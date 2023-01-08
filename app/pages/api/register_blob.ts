import { PrismaClient, selected_blobs, Source } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../lib/mongodb";
import { getAuthUser } from '../../utils/getAuthUser';

export type HistoryResponse = {
    img: "",
    query: "",
    type: ""
}

type Data = {
    error: false,
    created_data: Omit<selected_blobs, 'object_data'>
} | {
    error: true,
    message: string
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const prisma = new PrismaClient()


    if (req.method === 'POST') {
        try {

            const { url, id, query, source } = req.body

            if (!url || !id || !query || !source) {
                throw new Error('Please ensure that all the params are correct!')
            }
            if (source !== Source.GIPHY && source !== Source.LEXICA) {
                throw new Error(`source needs to be either ${Source.GIPHY} or ${Source.LEXICA}`)
            }

            const user = getAuthUser(req)

            if(!user) throw new Error('auth required..')

            const response = await fetch(url);
            const buffer = await response.arrayBuffer()

            console.log(query, Buffer.from(buffer))

            const result = await prisma.selected_blobs.create({
                data: {
                    query,
                    object_data: Buffer.from(buffer),
                    url,
                    resource_id: id,
                    source,
                    user_id: user?.id
                }
            })

            const { object_data, ...data_except_object_data } = result
            res.json({
                error: false,
                created_data: data_except_object_data
            })
        } catch (err: any) {
            res.send({
                error: true,
                message: err.message
            })
        }

        prisma.$disconnect()
    } else {
        res.status(400).json({ error: true, message: 'Bad request. only POST method is allowed' })

    }
}
