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

function businessDayStartFromParts(year: number, month: number, day: number) {
  let guess = Date.UTC(year, month - 1, day);

  for (let index = 0; index < 3; index += 1) {
    const actual = getBusinessParts(new Date(guess));
    guess -=
      Date.UTC(
        actual.year,
        actual.month - 1,
        actual.day,
        actual.hour,
        actual.minute,
        actual.second,
      ) - Date.UTC(year, month - 1, day);
  }
  return new Date(guess);
}

function addCalendarDays(year: number, month: number, day: number, days: number) {
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function businessDayStart(value = new Date()) {
  const parts = getBusinessParts(value);

  return businessDayStartFromParts(parts.year, parts.month, parts.day);
}

export function addBusinessDays(value: Date, days: number) {
  const parts = getBusinessParts(value);
  const next = addCalendarDays(parts.year, parts.month, parts.day, days);

  return businessDayStartFromParts(next.year, next.month, next.day);
}

export function businessDateKey(value: Date) {
  const parts = getBusinessParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function isBusinessDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function businessDateRangeFromKey(dateKey: string) {
  if (!isBusinessDateKey(dateKey)) {
    throw new Error(`Invalid business date: ${dateKey}`);
  }

  const [year, month, day] = dateKey.split('-').map(Number) as [number, number, number];
  const next = addCalendarDays(year, month, day, 1);

  return {
    end: businessDayStartFromParts(next.year, next.month, next.day),
    start: businessDayStartFromParts(year, month, day),
  };
}
