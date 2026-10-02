const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
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
  const fps = req.body.fps || "60";

  const command = `ffmpeg -i "${input}" -vf "fps=${fps}" -c:v libx264 -preset veryfast -crf 23 -c:a aac "${output}"`;

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
