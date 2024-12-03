import LumaAI from "lumaai";
import "dotenv/config";
import axios from "axios";
import { createWriteStream } from "fs";
import { Request, Response } from "express";

const client = new LumaAI({
  authToken: process.env.LUMA_API_KEY,
});

export const generateVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt } = req.body;

  let generation = await client.generations.create({
    prompt,
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
    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
    });

    const fileStream = createWriteStream(`${generation.id}.mp4`);
    response.data.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    console.log(`File downloaded as ${generation.id}.mp4`);
    
    res.json({ success: true, fileId: generation.id });
  } else {
    res.status(400).json({ success: false, error: "No video URL generated" });
  }
};
