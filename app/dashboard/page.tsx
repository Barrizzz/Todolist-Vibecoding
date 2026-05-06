"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTodos, Todo } from "@/hooks/useTodos";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import StatsBar from "@/components/StatsBar";

type FilterCompleted = "all" | "pending" | "completed";
type FilterPriority = "all" | "LOW" | "MEDIUM" | "HIGH";

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { todos, pagination, isLoading, error, fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodo } = useTodos();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCompleted, setFilterCompleted] = useState<FilterCompleted>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [page, setPage] = useState(1);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCompleted, filterPriority]);

  const loadTodos = useCallback(() => {
    fetchTodos({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      completed:
        filterCompleted === "all"
          ? null
          : filterCompleted === "completed",
      priority: filterPriority === "all" ? null : filterPriority,
    });
  }, [fetchTodos, page, debouncedSearch, filterCompleted, filterPriority]);

  useEffect(() => {
    if (isAuthenticated) loadTodos();
  }, [isAuthenticated, loadTodos]);

  async function handleCreate(data: Parameters<typeof createTodo>[0]) {
    setFormLoading(true);
    const result = await createTodo(data);
    setFormLoading(false);
    if (result) setShowForm(false);
  }

  async function handleUpdate(data: Parameters<typeof updateTodo>[1]) {
    if (!editingTodo) return;
    setFormLoading(true);
    const result = await updateTodo(editingTodo.id, data);
    setFormLoading(false);
    if (result) setEditingTodo(null);
  }

  function handleEdit(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(false);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoIcon}>✓</span>
          <span style={styles.logoText}>TodoFlow</span>
        </div>

        {/* User info */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name || "User"} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={styles.avatarText}>{(user?.name || user?.email || "U")[0].toUpperCase()}</span>
            )}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name || "User"}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={styles.nav}>
          <div style={styles.navItem}>
            <span>📋</span> All Tasks
          </div>
        </nav>

        <div style={styles.sidebarFooter}>
          <a href="/api-docs" target="_blank" rel="noreferrer" style={styles.docsLink}>
            📖 API Docs
          </a>
          <button className="btn btn-ghost" onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>My Tasks</h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingTodo(null); }}
            style={{ gap: "0.5rem" }}
          >
            + New Todo
          </button>
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <StatsBar todos={todos} />
          </div>
        )}

        {/* Filters */}
        <div style={styles.filters}>
          <input
            className="input"
            type="text"
            placeholder="🔍 Search todos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 280 }}
          />
          <div style={styles.filterGroup}>
            {(["all", "pending", "completed"] as FilterCompleted[]).map((f) => (
              <button
                key={f}
                className={`btn ${filterCompleted === f ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilterCompleted(f)}
                style={styles.filterBtn}
              >
                {f === "all" ? "All" : f === "pending" ? "⏳ Pending" : "✅ Done"}
              </button>
            ))}
          </div>
          <select
            className="input"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            style={{ width: "auto", maxWidth: 160 }}
          >
            <option value="all">All priorities</option>
            <option value="HIGH">🔴 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {/* Todo List */}
        <div style={styles.list}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 76, marginBottom: 8 }} />
            ))
          ) : todos.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>
                {debouncedSearch || filterCompleted !== "all" || filterPriority !== "all"
                  ? "No matching todos"
                  : "No todos yet"}
              </h3>
              <p style={styles.emptyText}>
                {debouncedSearch || filterCompleted !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first todo to get started!"}
              </p>
              {!debouncedSearch && filterCompleted === "all" && filterPriority === "all" && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                  style={{ marginTop: "1rem" }}
                >
                  + Create Todo
                </button>
              )}
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              ← Prev
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              style={styles.pageBtn}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <TodoForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={formLoading}
        />
      )}
      {editingTodo && (
        <TodoForm
          todo={editingTodo}
          onSubmit={handleUpdate}
          onClose={() => setEditingTodo(null)}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "var(--bg-primary)" },
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "var(--bg-secondary)",
    borderRight: "1.5px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 1rem",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", padding: "0 0.5rem" },
  logoIcon: {
    width: 32, height: 32, background: "var(--accent)", borderRadius: 8,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "bold", fontSize: 16,
  },
  logoText: { fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" },
  userCard: {
    display: "flex", alignItems: "center", gap: "0.625rem",
    background: "var(--bg-card)", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius)", padding: "0.75rem",
    marginBottom: "1.5rem",
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "var(--accent-subtle)", border: "2px solid var(--accent)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarText: { color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" },
  userInfo: { overflow: "hidden" },
  userName: { fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userEmail: { fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" },
  navItem: {
    display: "flex", alignItems: "center", gap: "0.625rem",
    padding: "0.625rem 0.75rem", borderRadius: "var(--radius-sm)",
    fontSize: "0.875rem", color: "var(--text-primary)",
    background: "var(--accent-subtle)", fontWeight: 500,
  },
  sidebarFooter: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.5rem" },
  docsLink: {
    display: "flex", alignItems: "center", gap: "0.5rem",
    padding: "0.625rem 0.75rem", borderRadius: "var(--radius-sm)",
    fontSize: "0.875rem", color: "var(--text-secondary)",
    textDecoration: "none", transition: "all 0.2s",
  },
  logoutBtn: { width: "100%", justifyContent: "flex-start", gap: "0.5rem", padding: "0.625rem 0.75rem" },
  main: { flex: 1, padding: "2rem", maxWidth: 860, margin: "0 auto", width: "100%" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" },
  pageTitle: { fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" },
  pageSubtitle: { fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" },
  filters: { display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" },
  filterGroup: { display: "flex", gap: "0.25rem" },
  filterBtn: { padding: "0.5rem 0.875rem", fontSize: "0.8rem" },
  errorBox: {
    background: "var(--danger-subtle)", border: "1px solid rgba(229,72,77,0.2)",
    borderRadius: "var(--radius-sm)", color: "var(--danger)",
    padding: "0.75rem 1rem", fontSize: "0.875rem", marginBottom: "1rem",
  },
  list: { display: "flex", flexDirection: "column", gap: "0.625rem" },
  empty: {
    textAlign: "center", padding: "4rem 2rem",
    background: "var(--bg-card)", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-lg)",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: "1rem" },
  emptyTitle: { fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" },
  emptyText: { fontSize: "0.875rem", color: "var(--text-secondary)" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1.75rem" },
  pageBtn: { padding: "0.5rem 1rem", fontSize: "0.85rem" },
  pageInfo: { fontSize: "0.85rem", color: "var(--text-secondary)" },
};
