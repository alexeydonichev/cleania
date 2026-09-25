// Selected only by the Vercel webpack build. Never emulate a durable database
// with process memory or a /tmp file. API writes fail closed in preview mode.
export const env = {} as Cloudflare.Env;
