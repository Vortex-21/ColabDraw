import { PrismaClient } from "@prisma/client/extension";

export declare global{ 
    var prisma: PrismaClient|undefined
}