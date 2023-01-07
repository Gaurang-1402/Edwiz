import { user } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextApiResponse } from "next";

export type jwtUserPayloadType = {
  id: string;
  email: string;
  name: string;
};


export const getAuthToken = (user: user) => {
  // create auth token
  const jwtPayload: jwtUserPayloadType = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(jwtPayload, process.env.JSON_WEB_TOKEN_SECRET??"");
};
