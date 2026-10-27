"use client";

import { createContext, useContext } from "react";
import type { DashUser } from "@/lib/session"; // adjust path if needed

const UserContext = createContext<DashUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: DashUser | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}