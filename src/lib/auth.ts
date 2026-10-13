import 'server-only';
import { headers } from 'next/headers';
import type { DashUser } from '@/lib/session';

export async function getUser(): Promise<DashUser> {
  const h = await headers();
  const id = h.get('x-user-id');
  if (!id) throw new Error('getUser() called on a route the middleware does not cover');
  return {
    id: Number(id),
    role_id: Number(h.get('x-user-role')),
    title: decodeURIComponent(h.get('x-user-title') ?? ''),
  };
}