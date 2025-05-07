import { tool } from "ai";
import { z } from "zod";

export const getCurrentTime = tool({
  description:
    "Get the current time, optionally in a specific timezone and format",
  parameters: z.object({
    timezone: z
      .string()
      .optional()
      .describe(
        "Timezone in IANA format (e.g., 'America/New_York', 'Asia/Shanghai')"
      ),
    format: z
      .enum(["short", "full"])
      .optional()
      .describe("Time format: 'short' for HH:MM or 'full' for date and time"),
  }),
  execute: async ({ timezone = "UTC", format = "full" }) => {
    let options: Intl.DateTimeFormatOptions;

    if (format === "short") {
      options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
    } else {
      options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
    }

    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: timezone,
      });

      return {
        time: formatter.format(new Date()),
        timezone,
        format,
      };
    } catch (error) {
      // If timezone is invalid, fall back to UTC
      console.error(`Error with timezone ${timezone}:`, error);

      const formatter = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: "UTC",
      });

      return {
        time: formatter.format(new Date()),
        timezone: "UTC",
        format,
        error: `Invalid timezone: ${timezone}. Falling back to UTC.`,
      };
    }
  },
});

export const tools = {
  getCurrentTime,
};
