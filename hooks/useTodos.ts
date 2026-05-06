"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  page?: number;
  limit?: number;
  completed?: boolean | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
}

export interface UpdateTodoData {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
}

export function useTodos() {
  const { token } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchTodos = useCallback(
    async (filters: TodoFilters = {}) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.page) params.set("page", String(filters.page));
        if (filters.limit) params.set("limit", String(filters.limit));
        if (filters.completed !== null && filters.completed !== undefined)
          params.set("completed", String(filters.completed));
        if (filters.priority) params.set("priority", filters.priority);
        if (filters.search) params.set("search", filters.search);

        const res = await fetch(`/api/todos?${params.toString()}`, {
          headers: authHeaders,
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        setTodos(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch todos");
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const createTodo = useCallback(
    async (input: CreateTodoData): Promise<Todo | null> => {
      if (!token) return null;
      try {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setTodos((prev) => [data.data, ...prev]);
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create todo");
        return null;
      }
    },
    [token]
  );

  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoData): Promise<Todo | null> => {
      if (!token) return null;
      try {
        const res = await fetch(`/api/todos/${id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? data.data : t))
        );
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
        return null;
      }
    },
    [token]
  );

  const deleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        const res = await fetch(`/api/todos/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setTodos((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete todo");
        return false;
      }
    },
    [token]
  );

  const toggleTodo = useCallback(
    async (id: string, completed: boolean): Promise<void> => {
      await updateTodo(id, { completed });
    },
    [updateTodo]
  );

  return {
    todos,
    pagination,
    isLoading,
    error,
    setError,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
