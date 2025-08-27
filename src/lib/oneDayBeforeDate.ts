/**
 * Get a Date object that is N days before a given string date ("MM/DD/YYYY")
 * @param dateStr - Date string in format "MM/DD/YYYY"
 * @param daysBefore - Number of days to subtract (default = 1)
 * @returns Date object (not string)
 */
export function getDaysBefore(dateStr: string, daysBefore: number = 1): Date {
  const [month, day, year] = dateStr.split("-").map(Number)

  const date = new Date(year, month - 1, day) // JS months are 0-based
  date.setDate(date.getDate() - daysBefore)   // subtract N days

  return date
}
