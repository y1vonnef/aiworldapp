import { route } from "@fal-ai/serverless-proxy/nextjs";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    // Grab the user’s key from request headers
    const userKey = req.headers.get("x-fal-api-key");
    console.log("User Key:", userKey);
    if (userKey) {
        // Attach the user key to the Authorization header for Fal.ai
        req.headers.set("Authorization", `Key ${userKey}`);
    }
    return route.GET(req);
}

export async function POST(req: NextRequest) {
    console.log("Received POST request");
    const userKey = req.headers.get("x-fal-api-key");
    console.log("User Key:", userKey);

    if (userKey) {
        req.headers.set("Authorization", `Key ${userKey}`);
    }
    return route.POST(req);
}