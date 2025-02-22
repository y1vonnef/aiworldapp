"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import * as fal from "@fal-ai/serverless-client";
import { socket } from "../socket";

// Configure Fal with the user’s key via a custom header
function configureFalWithUserKey(userKey) {
  console.log("Setting Fal API Key:", userKey);
  fal.config({
    //proxyUrl: "/api/fal/proxy", // or your route path
    dangerouslyAllowBrowser: true, credentials: userKey
  });
}

// For consistent image output
const seed = Math.floor(Math.random() * 100000);
const baseArgs = {
  sync_mode: true,
  strength: 0.99,
  seed,
};

export default function Home() {
  const [image, setImage] = useState(null);
  const [sourceImg, setSourceImg] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("Futuristic city.");

  // Keep a ref to the interval so we can stop it if needed
  const intervalRef = useRef(null);
  const promptRef = useRef(currentPrompt);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected to socket server`);
    })

    socket.on("disconnect", () => {
      console.log(`Disconnected from socket server`);
    })

    socket.on("Share Prompt", (data) => {
      console.log("FRONTEND Received Prompt Update with data:", data);
      setCurrentPrompt(data);
      promptRef.current = data;
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("Share Prompt");
    }
  }, [])

  //also send image data to TD via socket here

  function startStream() {
    if (!apiKey) {
      alert("Please enter your Fal API key");
      return;
    }
    // 1) Configure Fal with the user’s key
    configureFalWithUserKey(apiKey);

    // 2) Create a real-time connection after Fal is configured
    const connection = fal.realtime.connect("110602490-sdxl-turbo-realtime", {
      connectionKey: "realtime-nextjs-app-1",
      onResult(result) {
        if (result.error) {
          console.error("Fal error:", result.error);
          return;
        }
        console.log("I've made the CALL");
        setImage(result.images[0].url);
        socket.emit("Image Result", result.images[0].url);
        // fetch(result.images[0].url)
        //   .then((response) => response.blob())
        //   .then((blob) => {
        //     console.log("Blob:", blob);
        //     const reader = new FileReader();
        //     reader.onloadend = () => {
        //       // reader.result = 'data:image/png;base64,AAAA...'
        //       const base64Data = reader.result;

        //       // 3) Emit the Base64 image to TouchDesigner via Socket.IO
        //       //    (Assuming "socket" is the same socket TouchDesigner is listening to)
        //       socket.emit("TD Base64 Image", base64Data);
        //     };
        //     reader.readAsDataURL(blob);
        //   })
        //   .catch((err) => console.error("Error converting to base64:", err));

      },
      onError(err) {
        console.error("Fal WebSocket error:", err);
      },
    });

    // 3) Send your prompt on an interval
    intervalRef.current = setInterval(() => {
      connection.send({
        ...baseArgs,
        image_url: "https://storage.googleapis.com/falserverless/model_tests/lcm/beach.png",
        prompt: promptRef.current,
      });
    }, 500);
  }

  // Cleanup the interval if the user leaves the page
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <main className="p-10">
      <input
        type="text"
        placeholder="Enter Fal API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />

      <div className="btn-container" style={{ marginTop: "1rem" }}>
        <button onClick={startStream}>Stream</button>
      </div>

      <div className="img-wrapper" style={{ marginTop: "1rem" }}>
        {image && (
          <Image
            className="img1"
            src={image}
            width={550}
            height={550}
            alt="fal image"
          />
        )}
        {sourceImg && (
          <Image
            className="img2"
            src={sourceImg}
            width={550}
            height={550}
            alt="fal image"
          />
        )}
      </div>
    </main>
  );
}
