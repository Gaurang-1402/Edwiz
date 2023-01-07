import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { jwtUserPayloadType } from "./getAuthToken";

// Used by server
export const getAuthUser = (req: NextApiRequest): null | jwtUserPayloadType => {
    const token = req.headers.authorization ?? "";
    const res: any = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET ?? "");
    return res;
};