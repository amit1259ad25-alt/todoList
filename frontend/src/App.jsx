import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Check, X, Clock } from "lucide-react";

const API_URL = "https://taskflow-a9lr.onrender.com/api/todos";

function getTimeRemaining(deadline) {
  if (!deadline) return null;

  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { label: "Overdue!", isOverdue: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (days > 0)
    return { label: `${days}d ${hours}h ${minutes}m left`, isOverdue: false };
  if (hours > 0)
    return {
      label: `${hours}h ${minutes}m ${seconds}s left`,
      isOverdue: false,
    };
  return { label: `${minutes}m ${seconds}s left`, isOverdue: false };
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState("All");
  const [, setTick] = useState(0);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDeadline, setEditDeadline] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      setTodos(await res.json());
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        priority,
        deadline: deadline || null,
      }),
    });
    setText("");
    setPriority("Medium");
    setDeadline("");
    fetchTodos();
  };

  const handleToggle = async (todo) => {
    await fetch(`${API_URL}/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    if (todo.deadline) {
      const localISO = new Date(
        new Date(todo.deadline).getTime() -
          new Date().getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      setEditDeadline(localISO);
    } else {
      setEditDeadline("");
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: editText,
        priority: editPriority,
        deadline: editDeadline || null,
      }),
    });
    setEditId(null);
    fetchTodos();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "Active") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const badgeStyle = {
    High: "bg-red-500/20 text-red-400",
    Medium: "bg-amber-500/20 text-amber-400",
    Low: "bg-emerald-500/20 text-emerald-400",
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Task Manager</h1>

        {/* Add Form + Priority + Deadline */}
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new task..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button className="bg-emerald-500 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-1">
              <Plus size={18} /> Add
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock size={14} />
            <span>Finish by:</span>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
            />
          </div>
        </form>

        {/* Filter Options */}
        <div className="flex gap-2">
          {["All", "Active", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                filter === tab
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-900 text-zinc-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.map((todo) => {
            const status = getTimeRemaining(todo.deadline);

            return (
              <div
                key={todo.id}
                className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
              >
                {editId === todo.id ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-sm"
                      />
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="text-emerald-400 p-1"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-zinc-400 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>Finish by:</span>
                      <input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo)}
                        className="w-4 h-4 mt-0.5 accent-emerald-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm ${
                              todo.completed ? "line-through text-zinc-500" : ""
                            }`}
                          >
                            {todo.text}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${badgeStyle[todo.priority]}`}
                          >
                            {todo.priority}
                          </span>
                        </div>

                        {todo.deadline && status && (
                          <div className="text-xs flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-400">
                              Finish by:{" "}
                              {new Date(todo.deadline).toLocaleString()}
                            </span>
                            {!todo.completed && (
                              <span
                                className={
                                  status.isOverdue
                                    ? "text-red-400 font-semibold"
                                    : "text-emerald-400 font-medium"
                                }
                              >
                                ({status.label})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(todo)}
                        className="text-zinc-400 hover:text-white p-1.5"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-zinc-400 hover:text-red-400 p-1.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
