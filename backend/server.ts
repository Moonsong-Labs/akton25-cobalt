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
      POST: async () => {
       try{
        const jobId = uuidv4();
        jobStore[jobId] = { status: "pending" };

        (async () => {
          try {
            const input = {
              messages: [
                {
                  role: "user",
                  content: "Create and deploy a brand new quest"
                },
              ],
            };

            const questId = uuidv4(); // Keep a unique ID for the quest thread itself
            const config = { configurable: { thread_id: questId } };
            const result = await app.invoke(input, config);

            const lastMessage = result.messages[result.messages.length - 1];
            console.log("lastMessage for job", jobId, ":", lastMessage);

            jobStore[jobId] = { status: "completed", result: { questThreadId: questId, lastMessage } };
            console.log(`Job ${jobId} (Create Quest) completed successfully.`);
          } catch (error) {
             console.error(`Job ${jobId} (Create Quest) failed:`, error);
             jobStore[jobId] = {
               status: "failed",
               error: error instanceof Error ? error.message : String(error),
             };
          }
        })();

        return Response.json(
           { jobId },
           {
             status: 202,
             headers: corsHeaders,
           }
         );
       }
        catch(error){
          console.error("Error initiating create quest job:", error);
          return Response.json({ error: "Failed to initiate quest creation job" }, { status: 500, headers: corsHeaders });
        }
      },
    },
    
    // resolve-task
    // Get backend to read event pass as context
    // Poke LLM to do the resolve task
    // Parse event for data, use it to work out if pass or fail task

    '/create-quest/status/:jobId': {
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

    '/health': {
      GET: () => {
        return Response.json({ status: "ok" }, { headers: corsHeaders });
      },
    },
    
    "/story-text": {
      GET: async (req) => {
        const url = new URL(req.url);
        const inputText = url.searchParams.get("input");
        // Get existing threadId or generate a new one if not provided
        let threadId = url.searchParams.get("threadId"); 

        if (!inputText) {
          return new Response("Missing 'input' query parameter", {
            status: 400,
            headers: corsHeaders,
          });
        }
        
        // Generate a new threadId if none is provided in the request
        if (!threadId) {
          threadId = uuidv4();
          console.log(`No threadId provided for story-text request. Generated new one: ${threadId}`);
        }

        const jobId = uuidv4();
        jobStore[jobId] = { status: "pending" };

        (async () => {
          try {
            const input = {
              messages: [
                {
                  role: "user",
                  content: inputText,
                },
              ],
            };

            console.log("Input for story-text job", jobId, ":", input);
            // Use the provided threadId for context
            const config = { configurable: { thread_id: threadId } }; 

            const result = await app.invoke(input, config);
            console.log("Result for story-text job", jobId, ":", result);

            const lastMessage = result.messages[result.messages.length - 1];
            assert(lastMessage?.content, "No last message content found");


            // Store the result as a specific JSON object
            jobStore[jobId] = { status: "completed", result: { text: lastMessage.content } };
            console.log(`Job ${jobId} (Story Text) completed successfully.`);
          } catch (error) {
            console.error(`Job ${jobId} (Story Text) failed:`, error);
            jobStore[jobId] = {
              status: "failed",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })(); 

        return Response.json(
          { jobId, threadId }, // Return both jobId and threadId
          {
            status: 202, // Accepted
            headers: corsHeaders,
          }
        );
      },
    },

    "/story-text/status/:jobId": {
       GET: (req) => {
         const jobId = req.params.jobId;
         const job = jobStore[jobId];

         if (!job) {
           return new Response("Job not found", {
             status: 404,
             headers: corsHeaders,
           });
         }

         // Return the stored job status/result/error
         return Response.json(job, { headers: corsHeaders });
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
            const config = { configurable: { thread_id: uuidv4() } };

            const result = await app.invoke(input, config);

            const lastMessage = result.messages[result.messages.length - 1];
            assert(lastMessage?.content, "No last message");

            const cleaned = await cleanResponse(lastMessage.content);

            jobStore[jobId] = { status: "completed", result: JSON.stringify(cleaned) };
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
