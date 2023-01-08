import { Prisma, PrismaClient, selected_blobs } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../lib/mongodb";
import { getAuthUser } from '../../utils/getAuthUser';

export type HistoryResponse = Omit<selected_blobs, 'object_data'>

type Data = {
    error: false,
    history: HistoryResponse[]
} | {
    error: true,
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

    try {
        const user = getAuthUser(req)
        if (!user) {
            throw new Error('Auth required')
        }
        const client = new PrismaClient();

        const results = client.selected_blobs.findMany({
            where: {
                user_id: user.id
            },
            select: {
                id: true,
                query: true,
                selected_at: true,
                url: true,
                resource_id: true,
                source: true,
                user_id: true
            },
            orderBy: {
                selected_at: 'desc'
            }
        });

        res.send({
            error: false,
            history: (await results)
        })

    } catch (err: any) {
        res.status(400).send({
            error: true,
            message: err.message
        })
    }


}
