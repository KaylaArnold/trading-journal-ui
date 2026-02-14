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

      // 1) Register
      await api.post("/auth/register", { email, password });

      // 2) Login immediately after
      const loginRes = await api.post("/auth/login", { email, password });
      console.log("LOGIN RESPONSE:", loginRes.data);

      // Support different backend shapes
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
      console.error("REGISTER/LOGIN ERROR:", e2?.response?.data || e2);

      const status = e2?.response?.status;
      const data = e2?.response?.data;

      const msg =
        data?.error ||
        data?.message ||
        (status ? `Request failed (${status})` : null) ||
        "Failed after registering.";

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Create account</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create account"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
