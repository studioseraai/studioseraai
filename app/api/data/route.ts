export const dynamic='force-dynamic';
export async function GET(request:Request){if(process.env.VERCEL==='1'){const {forward}=await import('../../../lib/platform/vercel');return forward(request,'/api/data');}return (await import('../../../lib/platform/cloudflare-data')).GET();}
export async function POST(request:Request){if(process.env.VERCEL==='1'){const {forward}=await import('../../../lib/platform/vercel');return forward(request,'/api/data');}return (await import('../../../lib/platform/cloudflare-data')).POST(request);}
