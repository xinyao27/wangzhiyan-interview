import { Hono } from "hono";
import { handle } from "hono/vercel";
import { conversationsApi, agentApi, uploadApi } from "@/lib/api";

// Create Hono instance
const app = new Hono().basePath("/api");

// Mount modularized APIs
app.route("/", conversationsApi);
app.route("/", agentApi);
app.route("/", uploadApi);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
