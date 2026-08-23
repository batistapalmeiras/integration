export const CREATE_VOLUNTEER_FUNCTION = 'create-volunteer';

// Every new volunteer starts with this same password (shared with them
// directly by the admin) instead of the admin having to make one up —
// changes automatically each year.
export function getDefaultVolunteerPassword(): string {
  return `BatistaPalmeiras@${new Date().getFullYear()}`;
}
