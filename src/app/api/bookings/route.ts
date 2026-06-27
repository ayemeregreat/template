import { NextResponse } from "next/server";

import { google } from "googleapis";

import { getOAuth2Client } from "@/lib/google";

type CalendarEvent = {
  title: string;
  description: string;
  location?: string;
  startTime: string;
  endTime: string;
  attendeeNames: string[];
  attendees: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
    self?: boolean;
    optional?: boolean;
    resource?: boolean;
    comment?: string;
    additionalGuests?: number;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
    const auth = getOAuth2Client();

    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();
    const yearAhead = new Date(now);
    yearAhead.setFullYear(yearAhead.getFullYear() + 1);

    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: yearAhead.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
      fields:
        "items(id,status,summary,description,location,start,end,attendees,creator,organizer)",
    });

    const events: CalendarEvent[] = (response.data.items ?? [])
      .filter((event) => event.status !== "cancelled" && event.start && event.end)
      .map((event) => {
        const attendees =
          event.attendees?.map((attendee) => ({
            email: attendee.email ?? undefined,
            displayName: attendee.displayName ?? undefined,
            responseStatus: attendee.responseStatus ?? undefined,
            organizer: attendee.organizer ?? undefined,
            self: attendee.self ?? undefined,
            optional: attendee.optional ?? undefined,
            resource: attendee.resource ?? undefined,
            comment: attendee.comment ?? undefined,
            additionalGuests: attendee.additionalGuests ?? undefined,
          })) ?? [];

        const attendeeNames = Array.from(
          new Set(
            attendees
              .map((attendee) => attendee.displayName || attendee.email || "")
              .filter((name): name is string => Boolean(name)),
          ),
        );

        return {
          title: event.summary?.trim() || "Untitled event",
          description: event.description ?? "",
          location: event.location ?? undefined,
          startTime: event.start?.dateTime ?? event.start?.date ?? "",
          endTime: event.end?.dateTime ?? event.end?.date ?? "",
          attendeeNames,
          attendees,
        };
      });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch Google Calendar events.",
      },
      { status: 500 },
    );
  }
}
