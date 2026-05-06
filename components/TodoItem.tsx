"use client";

import { useState } from "react";
import { Todo } from "@/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityClass =
    todo.priority === "HIGH"
      ? "badge-high"
      : todo.priority === "LOW"
      ? "badge-low"
      : "badge-medium";

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(todo.id);
    setIsDeleting(false);
  };

  const isOverdue =
    todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div
      className="animate-fade-in"
      style={{
        ...styles.container,
        opacity: todo.completed ? 0.65 : 1,
        borderLeftColor: todo.completed
          ? "var(--border)"
          : todo.priority === "HIGH"
          ? "var(--danger)"
          : todo.priority === "LOW"
          ? "var(--success)"
          : "var(--warning)",
      }}
    >
      <div style={styles.left}>
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
        />
        <div style={styles.content}>
          <div style={styles.titleRow}>
            <span
              style={{
                ...styles.title,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "var(--text-muted)" : "var(--text-primary)",
              }}
            >
              {todo.title}
            </span>
            <span className={`badge ${priorityClass}`}>{todo.priority}</span>
          </div>

          {todo.description && (
            <p style={styles.description}>{todo.description}</p>
          )}

          <div style={styles.meta}>
            {todo.dueDate && (
              <span
                style={{
                  ...styles.dueDate,
                  color: isOverdue ? "var(--danger)" : "var(--text-muted)",
                }}
              >
                📅 {new Date(todo.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {isOverdue && " · Overdue"}
              </span>
            )}
            <span style={styles.timestamp}>
              {new Date(todo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          className="btn btn-ghost"
          onClick={() => onEdit(todo)}
          style={styles.actionBtn}
          title="Edit"
          aria-label="Edit todo"
        >
          ✏️
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ ...styles.actionBtn, color: "var(--danger)" }}
          title="Delete"
          aria-label="Delete todo"
        >
          {isDeleting ? "..." : "🗑️"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1rem 1.25rem",
    background: "var(--bg-card)",
    border: "1.5px solid var(--border)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "var(--radius)",
    transition: "all 0.2s ease",
  },
  left: { display: "flex", alignItems: "flex-start", gap: "0.875rem", flex: 1, minWidth: 0 },
  content: { flex: 1, minWidth: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" },
  title: { fontSize: "0.95rem", fontWeight: 500, wordBreak: "break-word" },
  description: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    marginTop: "0.3rem",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  meta: { display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" },
  dueDate: { fontSize: "0.75rem" },
  timestamp: { fontSize: "0.72rem", color: "var(--text-muted)" },
  actions: { display: "flex", gap: "0.25rem", flexShrink: 0 },
  actionBtn: { padding: "0.375rem", fontSize: "0.85rem" },
};
