import { ConfigurationError } from "@/components/configuration-error";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { FILE_BUCKET } from "@/lib/workspace";
import { AddTaskForm, TaskControls, UploadForm, FileControls } from "@/components/workspace-forms";

async function Workspace() {
  if (!hasEnvVars) return <>
    <div><h1 className="text-3xl font-semibold tracking-tight">Todos</h1><p className="mt-2 text-muted-foreground">Make room for what matters today.</p></div>
    <div className="grid gap-8">
      <ConfigurationError title="Tasks unavailable" description="Your tasks cannot be loaded or saved until the database is connected." />
      <ConfigurationError title="Files unavailable" description="Private uploads and downloads need a connected storage service." />
    </div>
  </>;
  const client = await createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) redirect("/auth/login");
  const [{ data: tasks, error: taskError }, { data: files, error: fileError }] = await Promise.all([
    client.from("tasks").select("id,title,completed").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
    client.storage.from(FILE_BUCKET).list(auth.user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
  ]);
  return <><div><h1 className="text-3xl font-semibold tracking-tight">Todos</h1><p className="mt-2 break-all text-muted-foreground">{auth.user.email}</p></div><div className="grid gap-8 "><section className="space-y-6 rounded-xl border bg-background p-6"><h2 className="text-xl font-semibold">Tasks</h2><AddTaskForm />{taskError ? <p role="alert" className="text-sm text-red-600">Tasks could not be loaded. Check that the workspace migration has been applied, then refresh.</p> : tasks?.length ? <ul className="space-y-4">{tasks.map(task => <li key={task.id} className="space-y-3 border-t pt-4"><p className={task.completed ? "line-through text-muted-foreground" : "break-words"}>{task.title}</p><TaskControls id={task.id} completed={task.completed} /></li>)}</ul> : <p className="text-sm text-muted-foreground">No tasks yet. Add your first one above.</p>}</section><section className="space-y-6 rounded-xl border bg-background p-6"><h2 className="text-xl font-semibold">Files</h2><UploadForm />{fileError ? <p role="alert" className="text-sm text-red-600">Files could not be loaded. Check that the workspace migration has been applied, then refresh.</p> : files?.length ? <ul className="space-y-4">{files.map(file => <li key={file.id} className="space-y-3 border-t pt-4"><p className="break-all text-sm">{file.name.slice(37)}</p><FileControls path={`${auth.user.id}/${file.name}`} /></li>)}</ul> : <p className="text-sm text-muted-foreground">No files uploaded yet.</p>}</section></div></>;
}
export default function ProtectedPage() {
  return <Suspense fallback={<p>Loading your todo list…</p>}><Workspace /></Suspense>;
}
