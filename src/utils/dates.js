export function fromApiDate(iso) {
  return new Date(iso);
}

export function formatDate(iso) {
  return fromApiDate(iso).toLocaleString("sk-SK", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function toDateTimeInput(isoOrDate) {
  const date = fromApiDate(isoOrDate);
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}

export function parseDateTimeInput(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || toDateTimeInput(date) !== value) {
    return null;
  }

  return date;
}
