import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Image as ImageIcon, Search, X } from "lucide-react";
import NoteCard from "./NoteCard";

const API_URL = "http://localhost:5000/api/notes";
const BASE_URL = "http://localhost:5000";
const TAGS = ["All", "General", "Work", "Study", "Ideas", "Personal"];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("General");
  const [image,setImage]= useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    const res = await axios.get(API_URL);
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes().catch(console.error);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTag("General");
    setImage(null);
    setPreview("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tag", tag);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      resetForm();
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag || "General");
    setPreview(note.image ? `${BASE_URL}${note.image}` : "");
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setNotes(notes.filter((n) => n._id !== id));
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === "All" || note.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              SnapNotes
            </h1>
            <p className="text-slate-400 text-sm">Capture ideas & visual memories</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500"
              required
            />
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              {TAGS.filter((t) => t !== "All").map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <textarea
            rows="3"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-indigo-500"
            required
          />

          {preview && (
            <div className="relative w-40 h-28 mb-4 rounded-xl overflow-hidden border border-slate-700">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(""); }}
                className="absolute top-1.5 right-1.5 bg-slate-950/80 p-1 rounded-full hover:bg-red-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-300 hover:text-indigo-400 cursor-pointer bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl transition">
              <ImageIcon className="w-4 h-4" />
              <span>{image ? image.name : "Attach Photo"}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-sm bg-slate-800 hover:bg-slate-700 transition">
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-medium transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {loading ? "Saving..." : editingId ? "Update Note" : "Add Note"}
              </button>
            </div>
          </div>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedTag === t ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No notes found. Create your first note above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard key={note._id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
