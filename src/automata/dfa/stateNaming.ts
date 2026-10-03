/**
 * Converts a 0-based index to a readable spreadsheet-style column name:
 * 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, 27 -> AB, etc.
 */
export function getDFAStateName(index: number): string {
  if (index < 0) throw new Error('Index must be non-negative.');
  let name = '';
  let curr = index;
  while (curr >= 0) {
    name = String.fromCharCode(65 + (curr % 26)) + name;
    curr = Math.floor(curr / 26) - 1;
  }
  return name;
}
