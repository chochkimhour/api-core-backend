export function getCambodiaTimestamp(date = new Date()): string {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Phnom_Penh",
  }).format(date);

  return `${datePart} ${timePart}`;
}
