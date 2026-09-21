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

// Initialize IPMS Client
export const ipmsDb =
  globalForPrisma.ipmsDb ??
  new IpmsClient({
    adapter: new PrismaMariaDb(process.env.IPMS_DATABASE_URL!),
  });

// Initialize FTS Client
export const ftsDb =
  globalForPrisma.ftsDb ??
  new FtsClient({
    adapter: new PrismaMariaDb(process.env.FTS_DATABASE_URL!),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.ipmsDb = ipmsDb;
  globalForPrisma.ftsDb = ftsDb;
}