export function formatApiErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  const items = Array.isArray(detail) ? detail : [detail];
  const messages = items.flatMap((item): string[] => {
    if (typeof item === "string" && item.trim()) {
      return [item];
    }

    if (!item || typeof item !== "object") {
      return [];
    }

    if ("msg" in item && typeof item.msg === "string" && item.msg.trim()) {
      const location =
        "loc" in item && Array.isArray(item.loc)
          ? item.loc
              .filter((part: unknown): part is string => typeof part === "string" && part !== "body")
              .join(".")
          : "";
      return [location ? `${location}: ${item.msg}` : item.msg];
    }

    if ("message" in item && typeof item.message === "string" && item.message.trim()) {
      return [item.message];
    }

    return [];
  });

  return messages.length ? messages.join("; ") : fallback;
}
