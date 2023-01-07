// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { getAuthUser } from '../../utils/getAuthUser';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const user = getAuthUser(req)
        const prisma = new PrismaClient()
        const userData=await prisma.user.findFirst({
            where: {
                id: user?.id
            }
        })
        res.send({
            error: false,
            user: userData
        })
    } catch (err:any) {
        console.error(err);
        res.send({
            error: false,
            user: null,
            message: err.message
        })
    }
}


