"use client";

import { io } from "socket.io-client";

export const socket = io("https://aiworldapp-YvonneFang1.replit.app/", {
  path: "/socket.io",
  transports: ["websocket", "polling"]
}); //makes connection to the port
