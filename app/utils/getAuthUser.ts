import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { jwtUserPayloadType } from "./getAuthToken";
import cookie from 'cookie'

// Used by server
export const getAuthUser = (req: NextApiRequest): null | jwtUserPayloadType => {
    const token=cookie.parse(req.headers.cookie??"")[process.env.AUTH_COOKIE_KEY??"dummy_key"]
    const res: any = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET ?? "");
    return res;
};
