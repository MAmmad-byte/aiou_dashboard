import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

export async function proxy(req: NextRequest) {
  const user = await verifySession(req.cookies.get('dash_session')?.value);

  if (!user) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const res = NextResponse.redirect(process.env.LARAVEL_URL + '/go/dashboard');
    res.cookies.delete('dash_session');
    return res;
  }

  // Pass the user to pages, API routes and server actions
  const headers = new Headers(req.headers);
  headers.set('x-user-id', String(user.id));
  headers.set('x-user-role', String(user.role_id));
  headers.set('x-user-title', encodeURIComponent(user.title));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // runtime: 'nodejs',   // uncomment on Next.js 15.5
  matcher: ['/((?!sso|_next/static|_next/image|favicon.ico).*)'],
};