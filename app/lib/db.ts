import {PrismaClient} from "@/app/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

const globalPrismaClient = globalThis as unknown as {
    prisma?: PrismaClient;
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("Database is not configured");
    }

    const adapter = new PrismaPg( { connectionString });

    return new PrismaClient( {adapter} )
}

export const db = globalPrismaClient.prisma ?? createPrismaClient();

if(process.env.NODE_ENV !== 'production') {
    globalPrismaClient.prisma = db;
}

