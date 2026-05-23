import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl?.pathname ?? '';

    // Admin forum routes: allow ADMIN and MODERATOR
    if (pathname.startsWith('/admin/foro')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'MODERATOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } else if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      // Other admin routes require ADMIN role
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: any) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/coleccion/:path*',
    '/chat/:path*',
    '/perfil/:path*',
    '/admin/:path*',
    '/suscripcion/:path*',
    '/mensajes/:path*',
    '/comunidad/favoritos/:path*',
    '/comunidad/amigos/:path*',
  ],
};
