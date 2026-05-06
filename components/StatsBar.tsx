"use client";

import { Todo } from "@/hooks/useTodos";

interface StatsBarProps {
  todos: Todo[];
}

export default function StatsBar({ todos }: StatsBarProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = todos.filter((t) => t.priority === "HIGH" && !t.completed).length;
  const overdue = todos.filter(
    (t) => t.dueDate && !t.completed && new Date(t.dueDate) < new Date()
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <StatCard label="Total" value={total} color="var(--accent)" icon="📋" />
      <StatCard label="Completed" value={completed} color="var(--success)" icon="✅" />
      <StatCard label="Pending" value={pending} color="var(--warning)" icon="⏳" />
      <StatCard label="High Priority" value={highPriority} color="var(--danger)" icon="🔴" />
      {overdue > 0 && (
        <StatCard label="Overdue" value={overdue} color="var(--danger)" icon="⚠️" />
      )}

      {total > 0 && (
        <div style={styles.progress}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Progress</span>
            <span style={styles.progressValue}>{completionRate}%</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${completionRate}%`,
                background:
                  completionRate === 100
                    ? "var(--success)"
                    : "var(--accent)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={styles.card}>
      <span style={styles.icon}>{icon}</span>
      <div>
        <div style={{ ...styles.value, color }}>{value}</div>
        <div style={styles.cardLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "center",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    background: "var(--bg-card)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "0.75rem 1rem",
    minWidth: 90,
  },
  icon: { fontSize: "1.1rem" },
  value: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 },
  cardLabel: { fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 },
  progress: {
    flex: 1,
    minWidth: 160,
    background: "var(--bg-card)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "0.75rem 1rem",
  },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" },
  progressLabel: { fontSize: "0.75rem", color: "var(--text-muted)" },
  progressValue: { fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" },
  progressBar: { height: 6, background: "var(--bg-hover)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
};
