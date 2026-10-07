export const FILE_BUCKET = "workspace-files";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain"];
export type ActionResult = { status: "idle" } | { status: "success"; message: string } | { status: "error"; message: string };
export const initialActionResult: ActionResult = { status: "idle" };
