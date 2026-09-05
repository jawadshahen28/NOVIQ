export const BUSINESS_TIMEZONE = 'Asia/Hebron';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function getBusinessParts(value: Date) {
  const parts = Object.fromEntries(formatter.formatToParts(value).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second),
  };
}

export function businessDayStart(value = new Date()) {
  const parts = getBusinessParts(value);
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day);
  for (let index = 0; index < 2; index += 1) {
    const actual = getBusinessParts(new Date(guess));
    guess -= Date.UTC(actual.year, actual.month - 1, actual.day) - Date.UTC(parts.year, parts.month - 1, parts.day);
  }
  return new Date(guess);
}

export function addBusinessDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

export function businessDateKey(value: Date) {
  const parts = getBusinessParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}