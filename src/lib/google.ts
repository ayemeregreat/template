import { existsSync, readFileSync } from "fs";
import { google } from "googleapis";
import { join } from "path";


type OAuthCredentials = {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
};

const credentialsPath = join(process.cwd(), "mygoogle.json");
const tokenPath = join(process.cwd(), "mygoogle.token.json");

function loadCredentials(): OAuthCredentials {
  if (!existsSync(credentialsPath)) {
    throw new Error(`Google credentials file not found at ${credentialsPath}`);
  }

  const raw = readFileSync(credentialsPath, "utf8");
  const parsed = JSON.parse(raw) as OAuthCredentials;

  if (!parsed?.web?.client_id || !parsed?.web?.client_secret) {
    throw new Error(
      "Invalid Google OAuth credentials file. Ensure mygoogle.json contains web.client_id and web.client_secret.",
    );
  }

  return parsed;
}

function loadTokenFromFile(): Record<string, unknown> | null {
  if (!existsSync(tokenPath)) {
    return null;
  }

  const raw = readFileSync(tokenPath, "utf8");
  return JSON.parse(raw);
}

export function getOAuth2Client() {
  const credentials = loadCredentials();
  const { client_id, client_secret, redirect_uris = [] } = credentials.web;
  const redirectUri = redirect_uris[0] ?? "urn:ietf:wg:oauth:2.0:oob";

  const auth = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  const tokenFromFile = loadTokenFromFile();
  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN ??
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN ??
    (tokenFromFile?.refresh_token as string | undefined);
  const accessToken =
    process.env.GOOGLE_ACCESS_TOKEN ??
    process.env.GOOGLE_OAUTH_ACCESS_TOKEN ??
    (tokenFromFile?.access_token as string | undefined);

  if (!refreshToken && !accessToken) {
    throw new Error(
      "Missing Google OAuth token. Provide GOOGLE_REFRESH_TOKEN, GOOGLE_ACCESS_TOKEN, or create a mygoogle.token.json with refresh_token.",
    );
  }

  const credentialsToken: Record<string, unknown> = {};
  if (refreshToken) {
    credentialsToken.refresh_token = refreshToken;
  }
  if (accessToken) {
    credentialsToken.access_token = accessToken;
  }

  auth.setCredentials(credentialsToken);
  return auth;
}
