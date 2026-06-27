import { NextResponse } from "next/server";

import { readFileSync } from "fs";
import { google } from "googleapis";
import { join } from "path";


export const runtime = "nodejs";

export async function GET() {
  try {
    const credentialsPath = join(process.cwd(), "mygoogle.json");
    const raw = readFileSync(credentialsPath, "utf8");
    const parsed = JSON.parse(raw) as {
      web?: {
        client_id?: string;
        client_secret?: string;
        redirect_uris?: string[];
      };
    };

    const { client_id, client_secret, redirect_uris = [] } = parsed.web ?? {};
    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: "Invalid mygoogle.json: missing client_id or client_secret" },
        { status: 500 },
      );
    }

    const redirectUri =
      redirect_uris[0] ?? "http://localhost:3002/api/auth/callback";

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirectUri,
    );

    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
