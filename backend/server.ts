import assert from "node:assert";
import { v4 as uuidv4 } from "uuid";
import { app, cleanResponse } from "../llm/necromancer";

// In-memory store for job statuses and results
// Warning: This is simple but will be lost on server restart.
// For production, consider a database or persistent cache.
const jobStore: Record<
  string,
  { status: "pending" | "completed" | "failed"; result?: any; error?: any }
> = {};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
  port: 3001,
  routes: {
    "/create-quest":{
      POST: async (req) => {
        const body = await req.json();
        // const { quest } = body;

        // TODO: Create a quest
        const questId = uuidv4();
        return Response.json({ questId });
      },
    },

    "/mint": {
      GET: async (req) => {
        const url = new URL(req.url);
        const address = url.searchParams.get("address");

        if (!address) {
          return new Response("Missing 'address' query parameter", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const jobId = uuidv4();
        jobStore[jobId] = { status: "pending" };

        (async () => {
          try {
            const input = {
              messages: [
                {
                  role: "user",
                  content: `Create new character for address: ${address}`,
                },
              ],
            };

            console.log("input", input);
            // Use a new thread ID for each invocation if necessary
            const config = { configurable: { thread_id: uuidv4() } };

            const result = await app.invoke(input, config);

            const lastMessage = result.messages[result.messages.length - 1];
            assert(lastMessage?.content, "No last message");

            // Store result on success
            jobStore[jobId] = { status: "completed", result: "ok" };
            console.log(`Job ${jobId} completed successfully.`);
          } catch (error) {
            console.error(`Job ${jobId} failed:`, error);
            // Store error on failure
            jobStore[jobId] = {
              status: "failed",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })(); // IIFE to run async code without blocking the request handler

        return Response.json(
          { jobId },
          {
            status: 202,
            headers: corsHeaders,
          }
        ); // 202 Accepted
      },
    },

    "/mint/status/:jobId": {
      GET: (req) => {
        const jobId = req.params.jobId;
        const job = jobStore[jobId];

        if (!job) {
          return new Response("Job not found", {
            status: 404,
            headers: corsHeaders,
          });
        }

        return Response.json(job, { headers: corsHeaders });
      },
    },
  },

  fetch(req) {
    // Handle OPTIONS requests for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  },

  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  },
});

console.log(`🚀 Listening on http://localhost:${server.port} !!!`);
