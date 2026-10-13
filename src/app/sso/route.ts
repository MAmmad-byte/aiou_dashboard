import { ipmsDb } from '@/lib/prisma';
import { createHash } from 'crypto';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';


const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const LARAVEL = process.env.LARAVEL_URL!;

type TicketUser = {
  id: bigint | number;
  title: string;
  role_id: bigint | number;
  laravel_session_id: string;
};

export async function GET(req: Request) {
  const ticket = new URL(req.url).searchParams.get('ticket') ?? '';
  if (ticket.length !== 64) return NextResponse.redirect(LARAVEL + '/go/dashboard');
  const hash = createHash('sha256').update(ticket).digest('hex');
  
  // // Atomic: a ticket can be used only once
  const updated = await ipmsDb.$executeRaw`
    UPDATE sso_tickets SET used_at = NOW()
     WHERE token_hash = ${hash} AND used_at IS NULL AND expires_at > NOW()`;
  if (updated !== 1) return NextResponse.redirect(LARAVEL + '/go/dashboard');
  
  const rows = await ipmsDb.$queryRaw<TicketUser[]>`
    SELECT u.id, u.title, u.role_id, t.laravel_session_id
      FROM sso_tickets t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ${hash} AND u.deleted_at IS NULL`;
  const user = rows[0];
  if (!user) return NextResponse.redirect(LARAVEL + '/login');
  
  const jwt = await new SignJWT({
    sid: user.laravel_session_id,
    title: user.title,
    role_id: Number(user.role_id),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setExpirationTime('8h')
    .sign(secret);
  
    const resp = NextResponse.redirect(new URL('/', req.url));
    resp.cookies.set('dash_session', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 3600,
      });
  return resp;
}