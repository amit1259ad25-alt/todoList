const express = require("express");
const cors = require("cors");
const ImageKit = require("@imagekit/nodejs");
const Note = require("./models/note.model");
const upload = require("./middlewares/upload.middleware");
const { toFile } = require("@imagekit/nodejs");

const app = express();
app.use(cors());
app.use(express.json());

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  timeout: 60000,
});

app.get("/", (req, res) => res.send("Notes API is running..."));

// Create note
app.post("/api/notes", upload.single("image"), async (req, res) => {
  try {
    const { title, content, tag } = req.body;
    let image = "";
    let fileId = "";

    if (req.file) {
      const uploaded = await imagekit.files.upload({
        file: await toFile(req.file.buffer, req.file.originalname),
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: "/snapnotes",
      });

      image = uploaded.url;
      fileId = uploaded.fileId;
    }

    const newNote = await Note.create({ title, content, tag, image, fileId });
    res.status(201).json(newNote);
  } catch (error) {
    console.error("POST /api/notes error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all notes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update note
// Update note
app.put("/api/notes/:id", upload.single("image"), async (req, res) => {
  try {
    const existingNote = await Note.findById(req.params.id);
    if (!existingNote)
      return res.status(404).json({ message: "Note not found" });

    const updateData = { ...req.body };

    if (req.file) {
      // 1. Delete old image from ImageKit if one existed
      if (existingNote.imageFileId) {
        await imagekit.deleteFile(existingNote.imageFileId);
      }

      // 2. Upload the new image
      const uploaded = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: "/snapnotes",
      });

      updateData.image = uploaded.url;
      updateData.imageFileId = uploaded.fileId;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Delete image from ImageKit if it has a fileId
    if (note.imageFileId) {
      await imagekit.deleteFile(note.imageFileId);
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
