/** Vercel is a presentation deployment until its durable backend is provisioned. */
export const isPreviewDeployment = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "preview";
export const isVercelRuntime = process.env.NEXT_PUBLIC_RUNTIME === "vercel";
