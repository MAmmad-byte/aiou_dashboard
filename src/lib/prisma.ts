// import "dotenv/config";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import { PrismaClient as IpmsClient } from "../generated/ipms-client";
// import { PrismaClient as FtsClient } from "../generated/fts-client";

// // Global BigInt JSON serialization fix
// (BigInt.prototype as any).toJSON = function () {
//   return this.toString();
// };

// const globalForPrisma = globalThis as unknown as {
//   ipmsDb?: IpmsClient;
//   ftsDb?: FtsClient;
// };

// // Initialize IPMS Client
// export const ipmsDb =
//   globalForPrisma.ipmsDb ??
//   new IpmsClient({
//     adapter: new PrismaMariaDb(process.env.IPMS_DATABASE_URL!),
//   });

// // Initialize FTS Client
// export const ftsDb =
//   globalForPrisma.ftsDb ??
//   new FtsClient({
//     adapter: new PrismaMariaDb(process.env.FTS_DATABASE_URL!),
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.ipmsDb = ipmsDb;
//   globalForPrisma.ftsDb = ftsDb;
// }

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient as IpmsClient } from "../generated/ipms-client";
import { PrismaClient as FtsClient } from "../generated/fts-client";

// Global BigInt JSON serialization fix
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const globalForPrisma = globalThis as unknown as {
  ipmsDb?: IpmsClient;
  ftsDb?: FtsClient;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env in the project root (or the server environment) before using the database.`,
    );
  }
  return value;
}

/**
 * Wraps a client factory in a Proxy so the real client (and its database
 * adapter) is only created on first use — not when the module is imported.
 * `next build` imports every route module while collecting page data; with
 * eager construction a missing DATABASE_URL at build time crashed the
 * build even though no query ever ran.
 */
function lazy<T extends object>(create: () => T): T {
  let instance: T | undefined;
  const get = () => (instance ??= create());
  return new Proxy({} as T, {
    get(_target, prop) {
      const client = get();
      const value = Reflect.get(client, prop, client);
      return typeof value === "function" ? value.bind(client) : value;
    },
  });
}

export const ipmsDb: IpmsClient = lazy(() => {
  if (globalForPrisma.ipmsDb) return globalForPrisma.ipmsDb;
  const client = new IpmsClient({
    adapter: new PrismaMariaDb(requireEnv("IPMS_DATABASE_URL")),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.ipmsDb = client;
  return client;
});

export const ftsDb: FtsClient = lazy(() => {
  if (globalForPrisma.ftsDb) return globalForPrisma.ftsDb;
  const client = new FtsClient({
    adapter: new PrismaMariaDb(requireEnv("FTS_DATABASE_URL")),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.ftsDb = client;
  return client;
});