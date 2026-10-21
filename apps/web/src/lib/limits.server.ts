import { clientIdentifier, createRateLimiter } from '@/lib/rate-limit.server';

const register = createRateLimiter({ maxRequests: 5, windowSeconds: 3600 });
const booking = createRateLimiter({ maxRequests: 8, windowSeconds: 3600 });
const manage = createRateLimiter({ maxRequests: 30, windowSeconds: 3600 });
const link = createRateLimiter({ maxRequests: 5, windowSeconds: 3600 });
const respond = createRateLimiter({ maxRequests: 30, windowSeconds: 3600 });

const wrap = (limiter: (id: string) => Promise<boolean>) => (request: Request) => limiter(clientIdentifier(request));

export const allowRegister = wrap(register);
export const allowBooking = wrap(booking);
export const allowManage = wrap(manage);
export const allowLink = wrap(link);
export const allowRespond = wrap(respond);

export const TOO_MANY = 'Too many attempts. Please wait a while and try again.';
