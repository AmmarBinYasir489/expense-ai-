// Current date as YYYY-MM-DD in a given IANA timezone, so "today"/"yesterday"
// resolve correctly for the user regardless of server location.
export function todayInTimezone(timeZone: string = "UTC"): string {
  try {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
