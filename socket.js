"use client";

import { io } from "socket.io-client";

export const socket = io("wss://aiworldapp.yvonnefang1.repl.co", {transports: ["websocket", "polling"]}); //makes connection to the port
