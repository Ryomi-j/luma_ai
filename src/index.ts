import express from "express";
import cors from "cors";
import ROUTES from "./constant/routes";
import { generateVideo } from "./api/generateVideo";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post(ROUTES.GENERATION, generateVideo);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
