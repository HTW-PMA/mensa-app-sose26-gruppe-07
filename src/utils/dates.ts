export interface UpcomingDate {
  iso: string;
  dayLabel: string;
  dateLabel: string;
  fullLabel: string;
  isToday: boolean;
}

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUpcomingDates(numberOfDays = 7): UpcomingDate[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      iso: formatLocalIsoDate(date),
      dayLabel:
        index === 0
          ? 'Heute'
          : date.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', ''),
      dateLabel: date.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
      }),
      fullLabel: date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      isToday: index === 0,
    };
  });
}
