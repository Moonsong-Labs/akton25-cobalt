import  assert  from "node:assert";
import { v4 as uuidv4 } from "uuid";
import { app, cleanResponse } from "../llm/necromancer"; 

// In-memory store for job statuses and results
// Warning: This is simple but will be lost on server restart.
// For production, consider a database or persistent cache.
const jobStore: Record<
  string,
  { status: "pending" | "completed" | "failed"; result?: any; error?: any }
> = {};

const server = Bun.serve({
  port: 3001,
  routes: {
    "/mint": {
      GET: async (req) => {
        const url = new URL(req.url);
        const address = url.searchParams.get("address");

        if (!address) {
          return new Response("Missing 'address' query parameter", { status: 400 });
        }

        const jobId = uuidv4();
        jobStore[jobId] = { status: "pending" };

        (async () => {
          try {
            const input = {
              messages: [{ role: "user", content: `Create new character for address: ${address}` }],
            };
            // Use a new thread ID for each invocation if necessary
            const config = { configurable: { thread_id: uuidv4() } };

            const result = await app.invoke(input, config);

            const lastMessage = result.messages[result.messages.length - 1];
            assert(lastMessage?.content, "No last message");
            const cleanedResponse = await cleanResponse(lastMessage.content);

            // Store result on success
            jobStore[jobId] = { status: "completed", result: cleanedResponse };
            console.log(`Job ${jobId} completed successfully.`);

          } catch (error) {
            console.error(`Job ${jobId} failed:`, error);
            // Store error on failure
            jobStore[jobId] = { status: "failed", error: error instanceof Error ? error.message : String(error) };
          }
        })(); // IIFE to run async code without blocking the request handler

        return Response.json({ jobId }, { status: 202 }); // 202 Accepted
      },
    },

    "/mint/status/:jobId": {
        GET: (req) => {
            const jobId = req.params.jobId;
            const job = jobStore[jobId];

            if (!job) {
            return new Response("Job not found", { status: 404 });
            }

            return Response.json(job);
        },
    },
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },

  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚀 Listening on http://localhost:${server.port} !!!`);
