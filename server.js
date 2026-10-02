const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const upload = multer({
  dest: "/tmp/uploads/"
});

app.get("/", (req, res) => {
  res.send("DIIZAM METHOD Backend aktif!");
});

app.post("/process", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Video tidak ditemukan.");
  }

  const input = req.file.path;
  const output = `/tmp/output_${Date.now()}.mp4`;
  const method = req.body.method || "original";

  let filter = "";

  if (method === "hd") {
    filter = "scale=1920:1080:force_original_aspect_ratio=decrease";
  } else if (method === "60") {
    filter = "fps=60";
  } else if (method === "120") {
    filter = "fps=120";
  }

  const videoFilter = filter
    ? `-vf "${filter}"`
    : "";

  const command =
    `ffmpeg -i "${input}" ${videoFilter} ` +
    `-c:v libx264 -preset veryfast -crf 20 ` +
    `-c:a aac -b:a 192k "${output}"`;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Gagal memproses video.");
    }

    res.download(output, "diizam-output.mp4", () => {
      fs.unlink(input, () => {});
      fs.unlink(output, () => {});
    });
  });
});

app.listen(PORT, () => {
  console.log(`DIIZAM backend berjalan di port ${PORT}`);
});
