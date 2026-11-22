export function fromApiDate(iso) {
  return new Date(iso);
}

export function formatDate(iso) {
  return fromApiDate(iso).toLocaleString("sk-SK", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizeDateTimeInput(value) {
  const [dateTime, fraction = ""] = value.split(".");
  const digits = fraction.replace(/0+$/, "");
  if (digits) return `${dateTime}.${digits}`;

  return dateTime.replace(/(T\d{2}:\d{2}):00$/, "$1");
}

export function toDateTimeInput(isoOrDate) {
  const date = fromApiDate(isoOrDate);
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return normalizeDateTimeInput(new Date(localTime).toISOString().slice(0, -1));
}

export function parseDateTimeInput(value, original) {
  const normalized = normalizeDateTimeInput(value);
  if (original && toDateTimeInput(original) === normalized) {
    return fromApiDate(original);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || toDateTimeInput(date) !== normalized) {
    return null;
  }

  return date;
}
