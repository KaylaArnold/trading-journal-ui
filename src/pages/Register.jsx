import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Register({ onRegister }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/auth/register", { email, password });
      const loginRes = await api.post("/auth/login", { email, password });

      const token =
        loginRes.data?.token ||
        loginRes.data?.accessToken ||
        loginRes.data?.jwt ||
        loginRes.data?.data?.token;

      if (!token) {
        setError("Registered, but login did not return a token.");
        return;
      }

      localStorage.setItem("token", token);
      onRegister?.();
      navigate("/daily-logs");
    } catch (e2) {
      const status = e2?.response?.status;
      const data = e2?.response?.data;

      const msg =
        data?.error ||
        data?.message ||
        (status ? `Request failed (${status})` : null) ||
        "Failed to register.";

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Create account</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create account"}
        </button>

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
