import createMiddleware from 'next-intl/middleware';
import {NextRequest} from 'next/server';
import {routing} from './i18n/routing';
const middleware=createMiddleware(routing);
export default function proxy(req:NextRequest){const headers=new Headers(req.headers);headers.set('x-konvex-path',req.nextUrl.pathname+req.nextUrl.search);return middleware(new NextRequest(req,{headers}));}
export const config={matcher:['/((?!api|_next|_vercel|uploads|images|fonts|downloads|.*\\..*).*)']};
