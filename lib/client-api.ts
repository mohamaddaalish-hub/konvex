let tokenPromise: Promise<string> | null = null;
export function getCsrf() {
  if (!tokenPromise)
    tokenPromise = fetch("/api/csrf", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "نشست امن برقرار نشد.");
        return d.token as string;
      })
      .catch((e) => {
        tokenPromise = null;
        throw e;
      });
  return tokenPromise;
}
export async function apiRequest(
  url: string,
  data: unknown,
  method = "POST",
  retry = true,
): Promise<Record<string, any>> {
  const token = await getCsrf();
  const isFile = data instanceof FormData;
  const r = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: {
      "x-csrf-token": token,
      "x-konvex-locale": document.documentElement.lang === "en" ? "en" : "fa",
      ...(!isFile ? { "Content-Type": "application/json" } : {}),
    },
    body: isFile ? data : JSON.stringify(data),
  });
  let result: Record<string, any>;
  try {
    result = await r.json();
  } catch {
    throw new Error("پاسخ سرور قابل خواندن نیست. دوباره تلاش کنید.");
  }
  if (r.status === 403 && retry) {
    tokenPromise = null;
    return apiRequest(url, data, method, false);
  }
  if (!r.ok) {
    const e = new Error(result.error || "درخواست انجام نشد.") as Error & {
      fields?: Record<string, string>;
      details?: string;
    };
    e.fields = result.fields;
    e.details = result.details;
    throw e;
  }
  return result;
}
