require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log(`Connected to the ${process.env.Database_Name || 'MongoDB'} Database Successfully!`))
  .catch((err) => console.error('MongoDB Error:', err));

// 2. Define Schema & Model
const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    deadline: { type: Date, default: null },
  },
  { timestamps: true }
);

// Convert _id to id so frontend works without any changes
todoSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

const Todo = mongoose.model('Todo', todoSchema);

// 3. API Routes (/api/todos)
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { text, priority, deadline } = req.body;
    const newTodo = await Todo.create({
      text,
      priority: priority || 'Medium',
      deadline: deadline || null,
    });
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
