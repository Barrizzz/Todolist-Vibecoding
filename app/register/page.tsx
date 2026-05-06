"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        // Show field-level errors if available
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join(", ");
          throw new Error(msgs);
        }
        throw new Error(data.message);
      }
      login(data.data.token, data.data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container} className="animate-scale-in">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✓</span>
          <span style={styles.logoText}>TodoFlow</span>
        </div>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Start organizing your tasks today — it&apos;s free.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              className="input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <span style={styles.hint}>
              Must be at least 8 characters with one uppercase letter and one number.
            </span>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    background: "var(--bg-primary)",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    background: "var(--bg-card)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "2.5rem",
  },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" },
  logoIcon: {
    width: 36, height: 36, background: "var(--accent)", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "bold", fontSize: 18,
  },
  logoText: { fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" },
  title: { fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" },
  subtitle: { fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.75rem" },
  errorBox: {
    background: "var(--danger-subtle)", border: "1px solid rgba(229,72,77,0.2)",
    borderRadius: "var(--radius-sm)", color: "var(--danger)",
    padding: "0.75rem 1rem", fontSize: "0.875rem", marginBottom: "1.25rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.375rem" },
  label: { fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" },
  hint: { fontSize: "0.75rem", color: "var(--text-muted)" },
  footer: { marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" },
  link: { color: "var(--accent)", textDecoration: "none", fontWeight: 500 },
  spinner: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" },
};
