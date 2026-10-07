import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Execute the real migration in PostgreSQL. Only Supabase-owned schemas are minimal fixtures.
// This validates policies, not hosted Auth or the Storage HTTP service.
test('tasks and file policies isolate two users and reject anonymous access', async () => {
  const db = new PGlite();
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create function storage.foldername(text) returns text[] language sql immutable as
        $$ select (string_to_array($1, '/'))[1:array_length(string_to_array($1, '/'), 1)-1] $$;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema public, auth, storage to anon, authenticated;
      grant all on storage.objects to authenticated;
      grant select on storage.objects to anon;
      insert into auth.users values ('${alice}'), ('${bob}');
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202610070001_workspace.sql', import.meta.url), 'utf8'));
    await db.exec(`insert into public.tasks(user_id,title) values ('${alice}','Alice task'),('${bob}','Bob task');
      insert into storage.objects(bucket_id,name) values ('workspace-files','${alice}/alice.txt'),('workspace-files','${bob}/bob.txt');`);
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${alice}';`);
    assert.deepEqual((await db.query('select title from public.tasks')).rows, [{title:'Alice task'}]);
    assert.equal((await db.query("update public.tasks set completed=true where title='Bob task' returning id")).rows.length, 0);
    assert.equal((await db.query("delete from public.tasks where title='Bob task' returning id")).rows.length, 0);
    await assert.rejects(db.query(`insert into public.tasks(user_id,title) values ('${bob}','forged')`), /row-level security/);
    await assert.rejects(db.query(`update public.tasks set user_id='${bob}' where title='Alice task'`), /row-level security/);
    assert.equal((await db.query("insert into public.tasks(title) values ('New task') returning user_id")).rows[0].user_id, alice);
    assert.deepEqual((await db.query('select name from storage.objects')).rows, [{name:`${alice}/alice.txt`}]);
    await assert.rejects(db.query(`insert into storage.objects(bucket_id,name) values ('workspace-files','${bob}/forged.txt')`), /row-level security/);
    assert.equal((await db.query(`delete from storage.objects where name='${bob}/bob.txt' returning id`)).rows.length, 0);
    await db.query(`insert into storage.objects(bucket_id,name) values ('workspace-files','${alice}/new.txt')`);
    await db.exec(`set request.jwt.claim.sub = '${bob}';`);
    assert.deepEqual((await db.query('select title from public.tasks')).rows, [{title:'Bob task'}]);
    assert.deepEqual((await db.query('select name from storage.objects')).rows, [{name:`${bob}/bob.txt`}]);
    await db.exec("reset role; set role anon; set request.jwt.claim.sub = '';");
    await assert.rejects(db.query('select * from public.tasks'), /permission denied/);
    assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
    await db.exec('reset role;');
    assert.equal((await db.query("select public from storage.buckets where id='workspace-files'")).rows[0].public, false);
  } finally { await db.close(); }
});
