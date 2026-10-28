import {NextRequest,NextResponse} from 'next/server';
import {authorize} from './lib/platform/vercel';
export function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(process.env.NODE_ENV==='development'&&path==='/_next/webpack-hmr')return NextResponse.next();
 const publicPage=(path==='/'&&!request.nextUrl.searchParams.has('view'))||/^\/(collections|artworks|artists|events|about|contact|privacy)(\/|$)/.test(path);
 const publicAsset=/^\/(gallery|fonts)\//.test(path);
 const publicApi=path.startsWith('/api/gallery/');
 if(publicPage||publicAsset||publicApi)return NextResponse.next();
 if(process.env.VERCEL!=='1'&&!path.startsWith('/api/publication')&&!path.startsWith('/os/publishing'))return NextResponse.next();
 return authorize(request)||NextResponse.next();
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
