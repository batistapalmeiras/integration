export const CREATE_VOLUNTEER_FUNCTION = 'create-volunteer';

export function getDefaultVolunteerPassword(): string {
  return `BatistaPalmeiras@${new Date().getFullYear()}`;
}
