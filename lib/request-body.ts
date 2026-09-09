export class RequestBodyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}
/** Limit the stream itself, including requests without Content-Length. Validate the parsed value with Zod afterwards. */
export async function readJsonBody(request: Request, maxBytes = 20000) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new RequestBodyError(413, "حجم درخواست بیش از حد مجاز است.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError(400, "بدنه درخواست خالی است.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413, "حجم درخواست بیش از حد مجاز است.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError(400, "ساختار درخواست معتبر نیست.");
  }
}
