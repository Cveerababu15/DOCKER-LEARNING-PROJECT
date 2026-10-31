import { useEffect, useState } from "react";
import "./App.css";

const API_URL =  `${import.meta.env.VITE_API_URL}/api`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTasks((currentTasks) => [data.task, ...currentTasks]);
        setTitle("");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setTasks((currentTasks) =>
          currentTasks.filter((task) => task._id !== id),
        );
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <main className="container">
      <section className="task-card">
        <h1>Task Manager</h1>

        <p className="subtitle">
          Simple MERN application for learning Docker.
        </p>

        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="Enter a task..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <button type="submit">Add Task</button>
        </form>

        <div className="tasks-section">
          <h2>Tasks</h2>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">No tasks yet.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task._id}>
                  <span>{task.title}</span>

                  <button
                    type="button"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;