"use client";

import React, { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Columns3, Grid } from "lucide-react";

import { cn } from "@/lib/utils";

export type BookingEvent = {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  attendeeNames: string[];
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
    self?: boolean;
  }>;
};

export type DayType = {
  id: string;
  day: string;
  classNames: string;
  meetingInfo?: {
    date: string;
    time: string;
    title: string;
    participants: string[];
    location: string;
  }[];
};

interface DayProps {
  classNames: string;
  day: DayType;
  onHover: (day: string | null) => void;
}

function parseCalendarValue(value: string) {
  if (!value.includes("T")) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatEventTime(value: string) {
  if (!value.includes("T")) {
    return "All day";
  }

  const date = parseCalendarValue(value);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildMeetingInfo(event: BookingEvent) {
  const startDate = parseCalendarValue(event.startTime);
  const isAllDay = !event.startTime.includes("T");

  return {
    date: formatEventDate(startDate),
    time: isAllDay
      ? "All day"
      : `${formatEventTime(event.startTime)} - ${formatEventTime(event.endTime)}`,
    title: event.title,
    participants:
      event.attendeeNames.length > 0
        ? event.attendeeNames
        : [event.description || "No description available"],
    location: event.location || "No location specified",
  };
}

const Day: React.FC<DayProps> = ({ classNames, day, onHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasMeetings = Boolean(day.meetingInfo?.length);

  return (
    <>
      <motion.div
        className={`relative flex items-center justify-center py-1 ${classNames}`}
        style={{ height: "4rem", borderRadius: 16 }}
        onMouseEnter={() => {
          setIsHovered(true);
          onHover(day.day);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover(null);
        }}
        id={`day-${day.id}`}
      >
        <motion.div className="flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-zinc-100">{day.day}</span>
        </motion.div>

        {hasMeetings && (
          <motion.div
            className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full bg-zinc-700 p-1 text-[10px] font-bold text-white"
            layoutId={`day-${day.id}-meeting-count`}
            style={{
              borderRadius: 999,
            }}
          >
            {day.meetingInfo?.length}
          </motion.div>
        )}

        <AnimatePresence>
          {hasMeetings && isHovered && (
            <div className="absolute inset-0 flex size-full items-center justify-center">
              <motion.div
                className="flex size-10 items-center justify-center bg-zinc-700 p-1 text-xs font-bold text-white"
                layoutId={`day-${day.id}-meeting-count`}
                style={{
                  borderRadius: 999,
                }}
              >
                {day.meetingInfo?.length}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const CalendarGrid: React.FC<{
  days: DayType[];
  onHover: (day: string | null) => void;
}> = ({ days, onHover }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <Day
          classNames={day.classNames}
          day={day}
          key={day.id}
          onHover={onHover}
        />
      ))}
    </div>
  );
};

const InteractiveCalendar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof motion.div>
>(({ className, ...props }, ref) => {
  const [moreView, setMoreView] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDate] = useState(() => new Date());

  const handleDayHover = (day: string | null) => {
    setHoveredDay(day);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/bookings", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load live bookings.");
        }

        const data = (await response.json()) as BookingEvent[];

        if (!controller.signal.aborted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load live bookings.",
          );
          setEvents([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => controller.abort();
  }, []);

  const days = useMemo(() => {
    return buildDays(viewDate, events);
  }, [events, viewDate]);

  const sortedDays = useMemo(() => {
    if (!hoveredDay) return days;

    return [...days].sort((a, b) => {
      if (a.day === hoveredDay) return -1;
      if (b.day === hoveredDay) return 1;
      return 0;
    });
  }, [days, hoveredDay]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        className={`relative mx-auto my-10 flex w-full flex-col items-center justify-center gap-8 lg:flex-row ${className ?? ""}`}
        {...props}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div layout className="w-full max-w-lg">
          <motion.div
            key="calendar-view"
            className="flex w-full flex-col gap-4"
          >
            <div className="flex w-full items-center justify-between">
              <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-black dark:text-white">
                {new Intl.DateTimeFormat(undefined, {
                  month: "long",
                }).format(viewDate)}{" "}
                <span className="text-black/80 dark:text-white/80">
                  {new Intl.DateTimeFormat(undefined, {
                    year: "numeric",
                  }).format(viewDate)}
                </span>
              </motion.h2>

              <motion.button
                className="relative flex items-center gap-3 rounded-lg border border-[#323232] px-1.5 py-1 text-[#323232]"
                onClick={() => setMoreView(!moreView)}
                type="button"
              >
                <Columns3 className="z-[2]" />
                <Grid className="z-[2]" />
                <div
                  className="absolute top-0 left-0 h-[85%] w-7 rounded-md bg-white transition-transform duration-300"
                  style={{
                    top: "50%",
                    transform: moreView
                      ? "translateY(-50%) translateX(40px)"
                      : "translateY(-50%) translateX(4px)",
                  }}
                />
              </motion.button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-[#323232] py-1 text-center text-xs text-white"
                >
                  {day}
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <CalendarGrid days={days} onHover={handleDayHover} />
          </motion.div>
        </motion.div>

        {moreView && (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              key="more-view"
              className="mt-4 flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col items-start justify-between">
                <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-black dark:text-white">
                  Bookings
                </motion.h2>
                <p className="font-medium text-black/80 dark:text-white/80">
                  See what we have scheduled for this month.
                </p>
              </div>

              <motion.div
                className="flex h-[520px] flex-col items-start justify-start overflow-y-auto border-none bg-transparent shadow-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                layout
              >
                <AnimatePresence>
                  {loading && (
                    <div className="w-full p-4 text-sm text-zinc-300/60">
                      Loading live bookings...
                    </div>
                  )}

                  {!loading &&
                    !error &&
                    sortedDays
                      .filter((day) => day.meetingInfo)
                      .map((day) => (
                        <motion.div key={day.id} className="w-full py-0" layout>
                          {day.meetingInfo &&
                            day.meetingInfo.map((meeting, mIndex) => (
                              <motion.div
                                key={mIndex}
                                className="p-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                  duration: 0.2,
                                  delay: mIndex * 0.05,
                                }}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm font-medium text-black/85 dark:text-white/85">
                                    {meeting.date}
                                  </span>
                                  <span className="text-sm font-medium text-black/85 dark:text-white/85">
                                    {meeting.time}
                                  </span>
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">
                                  {meeting.title}
                                </h3>
                                <p className="mb-1 text-sm text-black/75 dark:text-white/75">
                                  {meeting.participants.join(", ")}
                                </p>
                                <div className="flex items-center text-black/75 dark:text-white/75">
                                  <svg
                                    className="mr-1 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-sm text-black/75 dark:text-white/75">
                                    {meeting.location}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                        </motion.div>
                      ))}

                  {!loading && !error && events.length === 0 && (
                    <div className="w-full p-4 text-sm text-black/75 dark:text-white/75">
                      No upcoming events were returned from the connected
                      calendar.
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

InteractiveCalendar.displayName = "InteractiveCalendar";

export default InteractiveCalendar;

function buildDays(viewDate: Date, events: BookingEvent[]) {
  const today = new Date(viewDate);
  today.setHours(0, 0, 0, 0);

  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  monthEnd.setHours(0, 0, 0, 0);
  const targetTileCount = 35;

  const meetingMap = new Map<string, DayType["meetingInfo"]>();

  for (const event of events) {
    const eventDate = parseCalendarValue(event.startTime);
    const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
    const existing = meetingMap.get(key) ?? [];
    existing.push(buildMeetingInfo(event));
    meetingMap.set(key, existing);
  }

  const days: DayType[] = [];

  for (
    let cursor = new Date(today);
    cursor <= monthEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    const meetings = meetingMap.get(key);

    days.push({
      id: key,
      day: String(cursor.getDate()).padStart(2, "0"),
      classNames: cn(
        "bg-[#1e1e1e]",
        "transition-colors duration-200",
        "hover:bg-[#262626] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        "cursor-pointer",
      ),
      meetingInfo: meetings,
    });
  }

  while (days.length < targetTileCount) {
    const nextMonthStart = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      1,
    );
    const index =
      days.length - Math.max(0, monthEnd.getDate() - today.getDate() + 1);
    const date = new Date(nextMonthStart);
    date.setDate(nextMonthStart.getDate() + index);

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const meetings = meetingMap.get(key);

    days.push({
      id: key,
      day: String(date.getDate()).padStart(2, "0"),
      classNames: cn(
        "bg-[#1e1e1e]",
        "transition-colors duration-200",
        "hover:bg-[#262626] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        "cursor-pointer",
      ),
      meetingInfo: meetings,
    });
  }

  return days;
}

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
