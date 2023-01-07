import { OAuth2Client } from "google-auth-library";

export const googleOAuth2ClientInstance = new OAuth2Client({
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    redirectUri: `${process.env.CURRENT_SERVER_URL}/api/auth/google/callback`,
});
