export function hasCompletedLessons(lessonsAttended: number, lessonsTotal: number): boolean {
  return lessonsTotal > 0 && lessonsAttended >= lessonsTotal;
}
