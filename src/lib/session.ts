// import { jwtVerify } from 'jose';
// import { ipmsDb } from '@/lib/prisma';

// const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
// const LIFETIME_SEC = Number(process.env.LARAVEL_SESSION_LIFETIME ?? 120) * 60;

// export type DashUser = { id: number; title: string; role_id: number };

// export async function verifySession(token?: string): Promise<DashUser | null> {
//   if (!token) return null;
//   try {
//     const { payload } = await jwtVerify(token, secret);
//     const sid = String(payload.sid);
//     const userId = Number(payload.sub);

//     const rows = await ipmsDb.$queryRaw<{ ok: number }[]>`
//       SELECT 1 AS ok FROM sessions s JOIN users u ON u.id = s.user_id
//        WHERE s.id = ${sid} AND s.user_id = ${userId}
//          AND s.last_activity > UNIX_TIMESTAMP() - ${LIFETIME_SEC}
//          AND u.deleted_at IS NULL`;
//     if (!rows.length) return null;

//     await ipmsDb.$executeRaw`
//       UPDATE sessions SET last_activity = UNIX_TIMESTAMP() WHERE id = ${sid}`;

//     return { id: userId, title: String(payload.title), role_id: Number(payload.role_id) };
//   } catch {
//     return null;
//   }
// }
import { jwtVerify } from 'jose';
import { ipmsDb } from '@/lib/prisma';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const LIFETIME_SEC = Number(process.env.LARAVEL_SESSION_LIFETIME ?? 120) * 60;

export type DashUser = { id: number; title: string; role_id: number };

export async function verifySession(token?: string): Promise<DashUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sid = String(payload.sid);
    const userId = Number(payload.sub);

    const rows = await ipmsDb.$queryRaw<{ ok: number }[]>`
      SELECT 1 AS ok FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ${sid} AND s.user_id = ${userId}
         AND s.last_activity > UNIX_TIMESTAMP() - ${LIFETIME_SEC}
         AND u.deleted_at IS NULL`;
    if (!rows.length) return null;

    await ipmsDb.$executeRaw`
      UPDATE sessions SET last_activity = UNIX_TIMESTAMP() WHERE id = ${sid}`;

    return { id: userId, title: String(payload.title), role_id: Number(payload.role_id) };
  } catch {
    return null;
  }
}

// Add this helper for Server Components / Layouts
export async function getCurrentUser(): Promise<DashUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('dash_session')?.value;
  return verifySession(token);
}