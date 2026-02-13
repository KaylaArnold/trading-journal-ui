import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [ticker, setTicker] = useState("");
  const [strategyOrb15, setStrategyOrb15] = useState(false);
  const [strategyOrb5, setStrategyOrb5] = useState(false);
  const [strategy3Conf, setStrategy3Conf] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function fetchLogs() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/daily-logs?limit=10&page=1");
      setLogs(res.data.dailyLogs || []);
    } catch (err) {
      console.error(err?.response?.data || err);
      setError("Failed to load daily logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");

    if (!date || !ticker) {
      setCreateError("Date and ticker are required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/daily-logs", {
        date,
        ticker: ticker.trim(),
        strategyOrb15,
        strategyOrb5,
        strategy3Conf,
      });

      setDate("");
      setTicker("");
      setStrategyOrb15(false);
      setStrategyOrb5(false);
      setStrategy3Conf(false);
      setShowForm(false);

      await fetchLogs();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to create log";
      setCreateError(msg);
      console.error("Create log error:", err?.response?.data || err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <p className="container">Loading daily logs…</p>;
  if (error) return <p className="container error">{error}</p>;

  return (
    <div className="container">
      <div className="topbar">
        <h2 className="h2">Daily Logs</h2>
        <button
          className={`btn ${showForm ? "" : "btnPrimary"}`}
          type="button"
          onClick={() => setShowForm((s) => !s)}
          style={{ marginLeft: "auto" }}
        >
          {showForm ? "Close" : "+ New Daily Log"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate}>
            <div className="row">
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input
                className="input"
                placeholder="Ticker (e.g. AAPL)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                style={{ textTransform: "uppercase" }}
              />

              <label className="badge badgePurple">
                <input type="checkbox" checked={strategyOrb15} onChange={(e) => setStrategyOrb15(e.target.checked)} />
                ORB15
              </label>

              <label className="badge badgePurple">
                <input type="checkbox" checked={strategyOrb5} onChange={(e) => setStrategyOrb5(e.target.checked)} />
                ORB5
              </label>

              <label className="badge badgePurple">
                <input type="checkbox" checked={strategy3Conf} onChange={(e) => setStrategy3Conf(e.target.checked)} />
                3CONF
              </label>

              <button className="btn btnPrimary" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create Log"}
              </button>
            </div>

            {createError && <p className="error" style={{ marginTop: 10 }}>{createError}</p>}
          </form>
        </div>
      )}

      <div className="card">
        {logs.length === 0 ? (
          <p className="muted">No logs yet</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Strategies</th>
                <th className="right">Open</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badges = [];
                if (log.strategyOrb15) badges.push("ORB15");
                if (log.strategyOrb5) badges.push("ORB5");
                if (log.strategy3Conf) badges.push("3CONF");

                return (
                  <tr key={log.id}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td><span className="badge badgeGray">{log.ticker}</span></td>
                    <td>
                      {badges.length ? (
                        <div className="row">
                          {badges.map((b) => (
                            <span key={b} className="badge badgePurple">{b}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="right">
                      <Link className="btn" to={`/daily-logs/${log.id}`}>View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
