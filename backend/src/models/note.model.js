const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "General",
    },
    image: {
      type: String,
      default: "",
    },
    fileId: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
