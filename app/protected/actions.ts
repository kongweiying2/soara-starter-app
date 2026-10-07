"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FILE_BUCKET, FILE_TYPES, MAX_FILE_SIZE, type ActionResult } from "@/lib/workspace";

async function currentUser() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/auth/login");
  return { client, user: data.user };
}
export async function addTask(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const title = form.get("title");
  if (typeof title !== "string" || !title.trim() || title.trim().length > 300)
    return { status: "error", message: "Enter a task between 1 and 300 characters." };
  const { client, user } = await currentUser();
  const { error } = await client.from("tasks").insert({ title: title.trim(), user_id: user.id });
  if (error) return { status: "error", message: "Task could not be saved. Please try again." };
  revalidatePath("/protected");
  return { status: "success", message: "Task saved." };
}
export async function changeTask(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const { client, user } = await currentUser();
  const id = form.get("id"); const operation = form.get("operation");
  if (!["delete", "complete", "reopen"].includes(typeof operation === "string" ? operation : "") || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { status: "error", message: "Invalid task." };
  const query = operation === "delete"
    ? client.from("tasks").delete().eq("id", id).eq("user_id", user.id)
    : client.from("tasks").update({ completed: operation === "complete" }).eq("id", id).eq("user_id", user.id);
  const { data, error } = await query.select("id");
  if (error || !data?.length) return { status: "error", message: "Task could not be changed. Please refresh and try again." };
  revalidatePath("/protected");
  return { status: "success", message: "Task updated." };
}
export async function uploadFile(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE || !FILE_TYPES.includes(file.type))
    return { status: "error", message: "Choose a JPEG, PNG, WebP, PDF or text file up to 10 MB." };
  const { client, user } = await currentUser();
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const { error } = await client.storage.from(FILE_BUCKET).upload(`${user.id}/${crypto.randomUUID()}-${name}`, file, { contentType: file.type, upsert: false });
  if (error) return { status: "error", message: "File could not be uploaded. Please try again." };
  revalidatePath("/protected");
  return { status: "success", message: "File uploaded privately." };
}
export async function deleteFile(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const { client, user } = await currentUser();
  const path = form.get("path");
  if (typeof path !== "string" || !path.startsWith(`${user.id}/`)) return { status: "error", message: "Invalid file." };
  const { error } = await client.storage.from(FILE_BUCKET).remove([path]);
  if (error) return { status: "error", message: "File could not be deleted. Please try again." };
  revalidatePath("/protected");
  return { status: "success", message: "File deleted." };
}
