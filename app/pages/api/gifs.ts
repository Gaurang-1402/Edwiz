


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


export type GifResponse = {
    id: string,
    url: string
}

type Data = {
    error: false,
    gifs: GifResponse[]
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
        const giphyUrl=`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=$%3C${q}+transparent%3E&limit=10&offset=0&rating=G&lang=en`
        const response=await fetch(giphyUrl)
        const results=await response.json()
        const url=`https://i.giphy.com/media`
        res.send({
            error: false,
            gifs: results.data.map((e:any) => ({id: e.id, url: `${url}/${e.id}/giphy-preview.webp`}))
        })
    } else {
        res.status(400).json({ error: true, message: 'Bad request. only POST method is allowed' })

    }
}
