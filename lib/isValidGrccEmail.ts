export function isValidGrccEmail(email: string) {
  return /^[a-zA-Z0-9._%+-]+@email\.grcc\.edu$/i.test(email.trim());
}