import {NextRequest,NextResponse} from 'next/server';
import {authorize} from './lib/platform/vercel';
export function proxy(request:NextRequest){if(process.env.VERCEL!=='1')return NextResponse.next();return authorize(request)||NextResponse.next();}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
