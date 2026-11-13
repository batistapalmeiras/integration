const DIRECT_SIGNUP_ORIGIN = 'membership_signup';

export const isDirectSignup = (origin: string): boolean => origin === DIRECT_SIGNUP_ORIGIN;
