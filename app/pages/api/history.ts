import type { NextApiRequest, NextApiResponse } from 'next'

import clientPromise from "../../lib/mongodb";

export type HistoryResponse = {
    img: "",
    query: "",
    type: ""
    
}

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
    const client = await clientPromise;
    const db = client.db("history");

    if (req.method === 'POST') {

        const {userId, img, query, type} = <any>req;
        
        if(!userId) {
            res.json({
                error: true,
                message: 'userId is required'
            })
        }

        db.history.updateOne({userId}, { 
            $push: { 
                userHistory: {
                    img, query, type
                }
            } 
        });

        res.send({
            error: false,
            history: []
        })
    } else if (req.method === 'GET'){
        const {userId} = <any>req;

        if(!userId) {
            res.json({
                error: true,
                message: 'userId is required'
            })
        }

        const history = await db.history.findOne({
            userId
        });

        res.send({
            error: false,
            history: history.userHistory
        })

    } else {
        res.status(400).json({ error: true, message: 'Bad request. only POST method is allowed' })
    }
}