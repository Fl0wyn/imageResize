import express from "express";
import sharp from "sharp";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const MAX_SIZE = 2000;

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/images", (req, res) => {
  const images = () => {
    const imagesPath = join(__dirname, "images");
    if (existsSync(imagesPath)) {
      return readdirSync(imagesPath);
    } else {
      return [];
    }
  };
  res.json(images());
});

app.get("/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const { size } = req.query;
  const imagePath = join(__dirname, "images", imageName);

  if (!existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  if (size) {
    const imageSize = parseInt(size, 10);
    if (isNaN(imageSize) || imageSize > MAX_SIZE) {
      return res.status(400).send("Invalid or too large size");
    }
    try {
      const data = await sharp(imagePath)
        .resize({ width: imageSize })
        .toBuffer();
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(data);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.sendFile(imagePath);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Running on http://127.0.0.1:${PORT}`);
});
