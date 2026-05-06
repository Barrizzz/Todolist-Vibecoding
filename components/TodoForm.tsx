"use client";

import { useState, useEffect } from "react";
import { Todo, CreateTodoData, UpdateTodoData } from "@/hooks/useTodos";

interface TodoFormProps {
  todo?: Todo | null;
  onSubmit: (data: CreateTodoData | UpdateTodoData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function TodoForm({ todo, onSubmit, onClose, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(todo?.priority || "MEDIUM");
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : ""
  );
  const isEdit = !!todo;

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="animate-scale-in">
        <div style={styles.header}>
          <h2 style={styles.heading}>{isEdit ? "Edit Todo" : "New Todo"}</h2>
          <button className="btn btn-ghost" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Title *</label>
            <input
              className="input"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              className="input"
              placeholder="Add more details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Priority</label>
              <select
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Due Date</label>
              <input
                className="input"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.footer}>
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading || !title.trim()}
              style={{ minWidth: 120 }}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner} className="animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create todo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "1rem",
  },
  modal: {
    background: "var(--bg-card)", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 520,
    boxShadow: "var(--shadow)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
  },
  heading: { fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" },
  closeBtn: { padding: "0.25rem 0.5rem", fontSize: "0.9rem" },
  form: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.375rem" },
  label: { fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" },
  row: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" },
  spinner: { width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" },
};
