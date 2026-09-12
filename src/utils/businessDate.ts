export const BUSINESS_TIMEZONE = 'Asia/Hebron';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
});

const labelFormatter = new Intl.DateTimeFormat('ar-IL', {
  day: '2-digit',
  month: '2-digit',
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
});

function getBusinessDateParts(value: Date) {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(value).map((part) => [part.type, part.value]),
  );

  return {
    day: parts.day ?? '01',
    month: parts.month ?? '01',
    year: parts.year ?? '1970',
  };
}

export function getBusinessDateInputValue(value = new Date()) {
  const parts = getBusinessDateParts(value);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatBusinessDateLabel(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number) as [number, number, number];

  if (!year || !month || !day) {
    return dateValue;
  }

  return labelFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)));
}
