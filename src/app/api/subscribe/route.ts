import { NextResponse } from "next/server";

import { google } from "googleapis";

import { getOAuth2Client } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const dob = typeof body?.dob === "string" ? body.dob.trim() : "";
    const language =
      typeof body?.language === "string" ? body.language.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required for subscription." },
        { status: 400 },
      );
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription service is temporarily unavailable.",
        },
        { status: 503 },
      );
    }

    let oauth2Client;

    try {
      oauth2Client = getOAuth2Client();
    } catch (authError) {
      console.error("Google OAuth initialization failed:", authError);
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription service is currently unavailable. Google Sheets access is not configured.",
        },
        { status: 503 },
      );
    }

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, timestamp, name, dob, language]],
      },
    });

    return NextResponse.json({ success: true, message: "Thank You!" });
  } catch (error) {
    console.error("Subscription route failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We couldn’t complete your subscription right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
