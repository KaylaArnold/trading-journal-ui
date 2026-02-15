import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

/** ✅ Add this (fixes "Notice is not defined") */
function Notice({ title, type = "info", children }) {
  const stylesByType = {
    info: { border: "#cfe8ff", background: "#eef7ff", color: "#0b3d91" },
    error: { border: "#ffd0d0", background: "#fff0f0", color: "#8a0000" },
    success: { border: "#c8f3d1", background: "#eefcf1", color: "#0b5f24" },
    warn: { border: "#ffe6b3", background: "#fff7e6", color: "#7a4a00" },
  };

  const s = stylesByType[type] || stylesByType.info;

  return (
    <div
      style={{
        border: `1px solid ${s.border}`,
        background: s.background,
        color: s.color,
        padding: 14,
        borderRadius: 12,
        maxWidth: 760,
        margin: "18px auto",
        fontWeight: 600,
      }}
    >
      {title && <div style={{ fontSize: 16, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontWeight: 500 }}>{children}</div>
    </div>
  );
}

export default function Analytics() {
  const [strategyRows, setStrategyRows] = useState([]);
  const [weeklyRows, setWeeklyRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");     // YYYY-MM-DD

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  function plClass(value) {
    const n = Number(value);
    if (n > 0) return "plPos";
    if (n < 0) return "plNeg";
    return "plZero";
  }

  function fmtPL(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  }

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const str = p.toString();
    return str ? `?${str}` : "";
  }, [from, to]);

  async function fetchAnalytics({ showSpinner = true } = {}) {
    try {
      if (showSpinner) setLoading(true);
      setError("");

      // strategies doesn't need date range (it’s by Trade.strategy),
      // but weekly + summary do.
      const [strategyRes, weeklyRes, summaryRes] = await Promise.all([
        api.get("/analytics/strategies"),
        api.get(`/analytics/weekly?weeks=8${qs ? `&${qs.slice(1)}` : ""}`),
        api.get(`/analytics/summary${qs}`),
      ]);

      // ---------- Strategies ----------
      const sData = strategyRes.data || {};
      let sRows = [];
      if (Array.isArray(sData.strategies)) {
        sRows = sData.strategies;
      } else {
        sRows = Object.entries(sData).map(([strategy, stats]) => ({
          strategy,
          trades: stats.trades ?? 0,
          wins: stats.wins ?? 0,
          losses: stats.losses ?? 0,
          winRate: stats.winRate ?? 0,
          totalPL: Number(stats.totalPL ?? 0),
          totalPLStr:
            typeof stats.totalPL === "string" ? stats.totalPL : undefined,
        }));
      }

      // ---------- Weekly ----------
      const wData = weeklyRes.data || {};
      const wRows = Array.isArray(wData.weeks) ? wData.weeks : [];

      // ---------- Summary ----------
      setSummary(summaryRes.data || null);
      setStrategyRows(sRows);
      setWeeklyRows(wRows);
    } catch (e) {
      console.error(e?.response?.data || e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function runFilters() {
    try {
      setRunning(true);
      await fetchAnalytics({ showSpinner: true });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    fetchAnalytics({ showSpinner: true });

    // auto-refresh if a trade was just added
    const shouldRefresh = localStorage.getItem("analytics:refresh");
    if (shouldRefresh) {
      localStorage.removeItem("analytics:refresh");
      fetchAnalytics({ showSpinner: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Notice title="Loading..." type="info">
          Fetching your data...
        </Notice>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Notice title="Error" type="error">
          {error}
        </Notice>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <h2 className="h2">Analytics</h2>

        <button
          type="button"
          className="btn btnPrimary"
          onClick={() => fetchAnalytics({ showSpinner: true })}
          style={{ marginLeft: "auto" }}
        >
          Refresh
        </button>
      </div>

      {/* ===== Filters ===== */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Filters</h3>
          <span className="badge badgeGray">From/To affects Summary + Weekly</span>
        </div>

        <div className="hr" />

        <div className="row">
          <div>
            <div className="label">From</div>
            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <div className="label">To</div>
            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btnPrimary"
            onClick={runFilters}
            disabled={running}
            style={{ alignSelf: "end" }}
          >
            {running ? "Running…" : "Run"}
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            style={{ alignSelf: "end" }}
          >
            Clear
          </button>
        </div>

        {(from || to) && (
          <p className="muted" style={{ marginTop: 10 }}>
            Active range:{" "}
            <span className="badge badgePurple">{from || "—"}</span>{" "}
            →{" "}
            <span className="badge badgePurple">{to || "—"}</span>
          </p>
        )}
      </div>

      {/* ===== Summary ===== */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Summary</h3>
          <span className="badge badgeGray">/analytics/summary</span>
        </div>

        <div className="hr" />

        {!summary ? (
          <p className="muted">No summary data.</p>
        ) : (
          <div className="row" style={{ gap: 12 }}>
            <span className="badge badgePurple">
              Trades: {summary.totalTrades ?? 0}
            </span>
            <span
              className={`badge ${
                Number(summary.totalProfitLoss) >= 0 ? "badgeGreen" : "badgeRed"
              }`}
            >
              Total P/L: {Number(summary.totalProfitLoss) > 0 ? "+" : ""}
              {fmtPL(summary.totalProfitLoss)}
            </span>
            <span className="badge badgeGray">
              Win Rate: {summary.winRate ?? 0}%
            </span>
            <span className="badge badgeGray">Avg Win: {fmtPL(summary.avgWin)}</span>
            <span className="badge badgeGray">Avg Loss: {fmtPL(summary.avgLoss)}</span>
            <span className="badge badgeGray">Best: {summary.bestTicker ?? "—"}</span>
          </div>
        )}
      </div>

      {/* ===== Strategy Performance ===== */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Strategy Performance</h3>
          <span className="badge badgeGray">Trade.strategy</span>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          Based on <strong>Trade.strategy</strong> (trade-level tagging).
        </p>

        <div className="hr" />

        {strategyRows.length === 0 ? (
          <p className="muted">No strategy data.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th className="center">Trades</th>
                <th className="center">Wins</th>
                <th className="center">Losses</th>
                <th className="center">Win %</th>
                <th className="center">Total P/L</th>
              </tr>
            </thead>
            <tbody>
              {strategyRows.map((r) => {
                const totalNum = Number(r.totalPL ?? 0);
                const totalStr = r.totalPLStr ?? fmtPL(totalNum);

                return (
                  <tr key={r.strategy}>
                    <td>
                      <span className="badge badgePurple">{r.strategy}</span>
                    </td>
                    <td className="center">{r.trades}</td>
                    <td className="center">{r.wins}</td>
                    <td className="center">{r.losses}</td>
                    <td className="center">{r.winRate}%</td>
                    <td className={`center ${plClass(totalNum)}`}>
                      {totalNum > 0 ? "+" : ""}
                      {totalStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Weekly Summary ===== */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Weekly Summary</h3>
          <span className="badge badgeGray">/analytics/weekly</span>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          Bucketed by the Monday start date for each week.
        </p>

        <div className="hr" />

        {weeklyRows.length === 0 ? (
          <p className="muted">No weekly data.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Week Start</th>
                <th className="center">Trades</th>
                <th className="center">Win %</th>
                <th className="center">Total P/L</th>
              </tr>
            </thead>
            <tbody>
              {weeklyRows.map((w) => {
                const totalNum = Number(w.totalPL ?? 0);
                const totalStr = w.totalPLStr ?? fmtPL(totalNum);

                return (
                  <tr key={w.weekStart}>
                    <td>{w.weekStart}</td>
                    <td className="center">{w.trades}</td>
                    <td className="center">{w.winRate}%</td>
                    <td className={`center ${plClass(totalNum)}`}>
                      {totalNum > 0 ? "+" : ""}
                      {totalStr}
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
