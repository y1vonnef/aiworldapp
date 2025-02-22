"use client";

import { io } from "socket.io-client";

export const socket = io("wss://aiworldapp.yvonnefang1.repl.co"); //makes connection to the port
