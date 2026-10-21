export const dynamic='force-dynamic';
export async function GET(request:Request){if(process.env.VERCEL==='1'){const {forward}=await import('../../../lib/platform/vercel');return forward(request,'/api/media');}return (await import('../../../lib/platform/cloudflare-media')).GET(request);}
export async function POST(request:Request){if(process.env.VERCEL==='1'){const {forward}=await import('../../../lib/platform/vercel');return forward(request,'/api/media');}return (await import('../../../lib/platform/cloudflare-media')).POST(request);}
