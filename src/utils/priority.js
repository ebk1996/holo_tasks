export const PRIORITY = { LOW: 0, MEDIUM: 1, HIGH: 2 };

export function mapPriorityTextToNumber(text) {
  if (!text) return PRIORITY.MEDIUM;
  const t = String(text).toLowerCase().trim();
  if (t.includes('high')) return PRIORITY.HIGH;
  if (t.includes('low')) return PRIORITY.LOW;
  return PRIORITY.MEDIUM;
}

export function priorityLabel(n) {
  return n === PRIORITY.LOW ? 'Low' : n === PRIORITY.HIGH ? 'High' : 'Medium';
}

export function priorityBadgeClass(n) {
  return n === PRIORITY.LOW
    ? 'bg-blue-600'
    : n === PRIORITY.HIGH
    ? 'bg-red-600'
    : 'bg-yellow-600';
}
