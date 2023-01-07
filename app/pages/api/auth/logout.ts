// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'
import { ERROR_ROUTE, LANDING } from '../../../config/routes';
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        res.setHeader('set-cookie', [
            cookie.serialize(
                process.env.AUTH_COOKIE_KEY ?? "dummy_key", "token", {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: -1,
                sameSite: 'strict',
                path: `/`
            }
            ),
        ])
        res.redirect(LANDING)
    } catch (err) {
        console.error(err);
        res.redirect(ERROR_ROUTE);
    }
}
