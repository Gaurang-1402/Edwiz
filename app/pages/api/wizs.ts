


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


export type ImagesOrGifsInstance = {
    id: string,
    url: string
}

type Data = {
    error: false,
    wizs: ImagesOrGifsInstance[]
} | {
    error: true,
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === 'POST') {
        const {q} = req.body
        console.log(q)
        if(!q){
            res.status(400).json({ error: true, message: 'Bad request. we need input param' })
        }
        const lexiUrl=`https://lexica.art/api/v1/search?q=${q}`
        const response=await fetch(lexiUrl)
        const results=await response.json()
        res.send({
            error: false,
            wizs: results.images.map((e:any) => ({id: e.id, url: e.srcSmall})).slice(0,11)
        })
    } else {
        res.status(400).json({ error: true, message: 'Bad request. only POST method is allowed' })

    }
}
