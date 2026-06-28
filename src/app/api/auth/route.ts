import { NextResponse } from "next/server";

import fs from "fs";
import { google } from "googleapis";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "mygoogle.json");
    JSON.parse(fs.readFileSync(filePath, "utf8"));

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3002/api/auth/callback",
    );

    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    console.log(
      "Debug Auth Client ID:",
      process.env.GOOGLE_CLIENT_ID ? "Found" : "MISSING",
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
    });

    return NextResponse.json({ url });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// force redeploy
