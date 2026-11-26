import { Trash2, Tag, Edit3 } from "lucide-react";

const BASE_URL = "http://localhost:5000";

export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition">
      <div>
        {note.image && (
  <img
    src={note.image.startsWith("http") ? note.image : `${BASE_URL}${note.image}`}
    alt={note.title}
    className="w-full h-48 object-cover border-b border-slate-800"
  />
)}

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
              <Tag className="w-3 h-3" />
              {note.tag || "General"}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-lg font-semibold mb-2 text-slate-100">
            {note.title}
          </h2>
          <p className="text-slate-400 text-sm whitespace-pre-line">
            {note.content}
          </p>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800/80 flex justify-end gap-2">
        <button
          onClick={() => onEdit(note)}
          className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(note._id)}
          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
