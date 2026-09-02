import "server-only"; import { PrismaPg } from "@prisma/adapter-pg"; import { PrismaClient } from "@prisma/client";
const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl)throw new Error("DATABASE_URL is required to initialize the database client");
const globalDb=globalThis as unknown as {db?:PrismaClient}; export const db=globalDb.db??new PrismaClient({adapter:new PrismaPg({connectionString:databaseUrl})}); if(process.env.NODE_ENV!=="production")globalDb.db=db;
