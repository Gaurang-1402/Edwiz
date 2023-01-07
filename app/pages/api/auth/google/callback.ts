// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { googleOAuth2ClientInstance } from '../../../../utils/googleOAuth2ClientInstance';
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client'
import { getAuthToken } from '../../../../utils/getAuthToken';
import cookie from 'cookie'


const prisma = new PrismaClient()


type Data = {
    error: boolean,
    token: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const code: string = (req.query as any).code;
        let { tokens } = await googleOAuth2ClientInstance.getToken(code);
        googleOAuth2ClientInstance.setCredentials(tokens);

        // get data
        // also we're damn sure that the token integrity is okay
        const data: any = jwt.decode(tokens.id_token as string);

        const { name, email, picture } = data;

        let userInstance = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if (!userInstance) {
            const currTime = new Date();
            userInstance = await prisma.user.create({
                data: {
                    email,
                    name,
                    picture,
                    created_time: currTime,
                    last_token_generated_at: currTime
                }
            })
        } else {
            // send the auth cookie
            userInstance.last_token_generated_at = new Date();
            // doing it async
            prisma.user.update({
                where: {
                    email
                },
                data: userInstance
            })
        }

        const token = getAuthToken(userInstance);

        res.setHeader('set-cookie', [
            cookie.serialize(
                process.env.AUTH_COOKIE_KEY ?? "dummy_key", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 604800,
                sameSite: 'strict',
                path: `/`
            }
            ),
        ])

        res.redirect(`/dash`)
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

