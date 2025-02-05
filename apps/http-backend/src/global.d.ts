export declare global{
    namespace Express{ 
        interface Request{
            id?:string
        }
    }
}

declare global{ 
    var prisma:PrismaClient|undefined
}