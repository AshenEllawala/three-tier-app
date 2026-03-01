import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError('❌ Cannot connect to backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (name) => {
    try {
      const res = await axios.post(`${API_URL}/tasks`, { name });
      setTasks([res.data, ...tasks]);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${id}`, {
        completed: !completed
      });
      setTasks(tasks.map(task => task.id === id ? res.data : task));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo App</h1>
        <p className="subtitle">3-Tier Architecture — Docker · Kubernetes · Jenkins</p>
        <div className="stats">
          <span>{tasks.length} Total</span>
          <span>{completedCount} Done</span>
          <span>{tasks.length - completedCount} Remaining</span>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchTasks}>Retry</button>
          </div>
        )}

        <TaskForm onAdd={addTask} />

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Tier 1: React · Tier 2: Node.js · Tier 3: PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
