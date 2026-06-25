export function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

export function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

export function formatMonthLabel(monthStr: string): string {
  const date = new Date(monthStr + '-01T00:00:00');
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}
