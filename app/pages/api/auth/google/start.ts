// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { googleOAuth2ClientInstance } from '../../../../utils/googleOAuth2ClientInstance';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const authUrl = googleOAuth2ClientInstance.generateAuthUrl({
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        });
        res.redirect(authUrl);
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}
