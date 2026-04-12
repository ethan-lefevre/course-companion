export function normalizeCourseCode(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, " ");

  const match = cleaned.match(/^([A-Z]+)\s*([0-9]+[A-Z]?)$/);

  if (!match) {
    return cleaned;
  }

  const subject = match[1];
  const number = match[2];

  return `${subject} ${number}`;
}