"use client";

import { useActionState } from "react";
import { addTask, changeTask, uploadFile, deleteFile } from "@/app/protected/actions";
import { initialActionResult, type ActionResult } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Message({ result }: { result: ActionResult }) {
  return result.status === "idle" ? null : <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? "text-sm text-red-600" : "text-sm text-muted-foreground"}>{result.message}</p>;
}
export function AddTaskForm() {
  const [result, action, pending] = useActionState(addTask, initialActionResult);
  return <form action={action} className="space-y-3"><label htmlFor="title" className="sr-only">New task</label><div className="flex flex-col gap-2 sm:flex-row"><Input className="flex-1" id="title" name="title" placeholder="What needs doing?" maxLength={300} required /><Button className="shrink-0" disabled={pending}>{pending ? "Saving…" : "Add task"}</Button></div><Message result={result} /></form>;
}
export function TaskControls({ id, completed }: { id: string; completed: boolean }) {
  const [result, action, pending] = useActionState(changeTask, initialActionResult);
  return <form action={action} className="space-y-2"><input type="hidden" name="id" value={id} /><div className="flex gap-2"><Button size="sm" variant="outline" name="operation" value={completed ? "reopen" : "complete"} disabled={pending}>{completed ? "Reopen" : "Complete"}</Button><Button size="sm" variant="ghost" name="operation" value="delete" disabled={pending}>Delete</Button></div><Message result={result} /></form>;
}
export function UploadForm() {
  const [result, action, pending] = useActionState(uploadFile, initialActionResult);
  return <form action={action} className="space-y-3"><label htmlFor="file" className="block text-sm">Upload a file</label><Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain" required /><p className="text-xs text-muted-foreground">Images, PDF or text, up to 10 MB. Only you can access these files.</p><Button disabled={pending}>{pending ? "Uploading…" : "Upload"}</Button><Message result={result} /></form>;
}
export function FileControls({ path }: { path: string }) {
  const [result, action, pending] = useActionState(deleteFile, initialActionResult);
  return <div className="space-y-2"><div className="flex gap-2"><Button size="sm" variant="outline" asChild><a href={`/protected/files/download?path=${encodeURIComponent(path)}`}>Download</a></Button><form action={action}><input type="hidden" name="path" value={path} /><Button size="sm" variant="ghost" disabled={pending}>Delete</Button></form></div><Message result={result} /></div>;
}
