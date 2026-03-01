import React from 'react';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, task.completed)}
        className="task-checkbox"
      />
      <span className="task-name">{task.name}</span>
      <span className="task-date">
        {new Date(task.created_at).toLocaleDateString()}
      </span>
      <button
        className="task-btn-delete"
        onClick={() => onDelete(task.id)}
      >
        Delete
      </button>
    </li>
  );
}

export default TaskItem;
