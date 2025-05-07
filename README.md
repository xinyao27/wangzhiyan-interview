# Simple Chat Component

A simple chat component built with Next.js, Hono, and DrizzleORM, supporting AI conversations, persistent storage, and streaming responses.

## Features

1. Includes a text area for prompts and send/stop buttons.
2. Implements a chat container displaying conversation history.
3. Handles requests through the `/agent` API.
4. Ensures that data for each conversation is persistently stored.
5. Returns all results via streaming.

## Advanced Features

This project implements the following advanced features:

1. Enhanced chat component with Markdown rendering, auto-scrolling, and image uploading.
2. Implementation of function calls, such as getting the current time.

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [NextJs](https://nextjs.org/)
- [Hono](https://hono.dev/)
- [DrizzleORM](https://orm.drizzle.team/)
- [AI SDK](https://sdk.vercel.ai/)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

## Quick Start

### Environment Variables Setup

Create a `.env.local` file in the project root directory and add the following:

```
# API Keys
DEEPSEEK_API_KEY=your-api-key

# Base URL (can be empty for local development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Install Dependencies

```bash
npm install
```

### Initialize Database

```bash
npm run db:generate
npm run db:migrate
```

### Run Development Server

```bash
npm run dev
```

## Project Structure

- `src/app/api/[[...route]]/route.ts` - Hono API routes
- `src/lib/db` - Database models and services
- `src/components/chat` - Chat UI components
- `src/components/sidebar` - Sidebar components

## Notes

- The database uses SQLite, with the file stored in the project root directory as `sqlite.db`
- By default, it uses deepseek as the AI model, which can be changed through environment variables
