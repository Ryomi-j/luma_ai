import 'dotenv/config';
import { createWriteStream } from 'fs';
import LumaAI from "lumaai";
import { Writable } from "stream";

const client = new LumaAI({
  authToken: process.env.LUMA_API_KEY,
});

const generativeVideo = async () => {
  let generation = await client.generations.create({
    prompt: "A teddy bear in sunglasses playing electric guitar and dancing",
  });

  let completed = false;

  while (!completed) {
    generation = await client.generations.get(generation.id ?? "");

    if (generation.state === "completed") {
      completed = true;
    } else if (generation.state === "failed") {
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    } else {
      console.log("Dreaming...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const videoUrl = generation.assets?.video;

  if (videoUrl) {
    const response = await fetch(videoUrl);
    const fileStream = createWriteStream(`${generation.id}.mp4`);
    await new Promise((res, rej) => {
      if (response.body) {
        response.body.pipeTo(Writable.toWeb(fileStream));
        fileStream.on("finish", res);
      } else {
        rej(new Error(`No response body`));
        return;
      }
    });
  }

  console.log(`File downloaded as ${generation.id}.mp4`);
};

generativeVideo()
