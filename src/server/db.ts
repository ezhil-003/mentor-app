import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "@/env";

const CONNECTION_STRING = env.DATABASE_URL;
const prismaAdapter = new PrismaPg({ connectionString: CONNECTION_STRING });

const createPrismaClient = () => new PrismaClient({ adapter: prismaAdapter });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
