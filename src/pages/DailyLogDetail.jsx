import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import Breadcrumbs from "../components/Breadcrumbs";
import TradeEditModal from "../components/TradeEditModal";
import { patchTrade } from "../api/trades";
import Notice from "../components/Notice";

export default function DailyLogDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tradeId = searchParams.get("tradeId") || "";

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Trade form state (create)
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [profitLoss, setProfitLoss] = useState("");
  const [runner, setRunner] = useState(false);
  const [optionType, setOptionType] = useState("CALL");
  const [outcomeColor, setOutcomeColor] = useState("GREEN");
  const [strategy, setStrategy] = useState("ORB15");

  // Notes edit (keyLevels/feelings/reflections)
  const [editingNotes, setEditingNotes] = useState(false);
  const [keyLevelsEdit, setKeyLevelsEdit] = useState("");
  const [feelingsEdit, setFeelingsEdit] = useState("");
  const [reflectionsEdit, setReflectionsEdit] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchLog() {
    const res = await api.get(`/daily-logs/${id}`);
    const dailyLog = res.data.dailyLog ?? res.data;

    setLog(dailyLog);

    // hydrate the edit fields whenever we load the log
    setKeyLevelsEdit(dailyLog?.keyLevels || "");
    setFeelingsEdit(dailyLog?.feelings || "");
    setReflectionsEdit(dailyLog?.reflections || "");

    if (dailyLog?.ticker && dailyLog?.date) {
      document.title = `${dailyLog.ticker} — ${new Date(dailyLog.date).toLocaleDateString()}`;
    }
  }

  async function handleSaveNotes() {
    setNotesError("");
    try {
      setSavingNotes(true);
      await api.put(`/daily-logs/${id}`, {
        keyLevels: keyLevelsEdit,
        feelings: feelingsEdit,
        reflections: reflectionsEdit,
      });
      localStorage.setItem("analytics:refresh", "1");
      setEditingNotes(false);
      await fetchLog();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Failed to save notes.";
      setNotesError(msg);
      console.error("Save notes error:", e?.response?.data || e);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleSaveTrade(body) {
    await patchTrade(tradeId, body);
    localStorage.setItem("analytics:refresh", "1");
    await fetchLog();
  }

  function openTradeModal(idToOpen) {
    const next = new URLSearchParams(searchParams);
    next.set("tradeId", String(idToOpen));
    setSearchParams(next);
  }

  function closeTradeModal() {
    const next = new URLSearchParams(searchParams);
    next.delete("tradeId");
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        await fetchLog();
      } catch (e) {
        console.error(e?.response?.data || e);
        setError("Failed to load daily log");
      } finally {
        setLoading(false);
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selectedTrade = useMemo(() => {
    if (!log?.trades?.length || !tradeId) return null;
    return log.trades.find((t) => String(t.id) === String(tradeId)) || null;
  }, [log, tradeId]);

  const breadcrumbItems = useMemo(() => {
    const dateStr = log?.date ? new Date(log.date).toLocaleDateString() : "Log";
    const logLabel = log?.ticker ? `${dateStr} — ${log.ticker}` : dateStr;

    const items = [
      { label: "Dashboard", to: "/daily-logs" },
      { label: "Log", to: `/daily-logs/${id}` },
    ];

    if (selectedTrade) {
      const label = `Trade ${selectedTrade.timeIn || "—"}–${selectedTrade.timeOut || "—"}`;
      items.push({ label });
    } else {
      items[1] = { label: logLabel };
    }

    return items;
  }, [id, log, selectedTrade]);

  async function handleAddTrade(e) {
    e.preventDefault();
    setFormError("");

    if (!timeIn || !timeOut || profitLoss === "") {
      setFormError("timeIn, timeOut, and profitLoss are required.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/trades`, {
        // ✅ FIX: must be dailyLogId (capital I)
        dailyLogId: id,
        timeIn,
        timeOut,
        profitLoss: String(profitLoss),
        runner,
        optionType,
        outcomeColor,
        strategy,
      });

      localStorage.setItem("analytics:refresh", "1");

      setTimeIn("");
      setTimeOut("");
      setProfitLoss("");
      setRunner(false);
      setOptionType("CALL");
      setOutcomeColor("GREEN");
      setStrategy("ORB15");

      await fetchLog();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Failed to create trade.";
      setFormError(msg);
      console.error("Create trade error:", e?.response?.data || e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTrade(idToDelete) {
    const ok = window.confirm("Delete this trade?");
    if (!ok) return;

    try {
      await api.delete(`/trades/${idToDelete}`);
      localStorage.setItem("analytics:refresh", "1");

      if (String(tradeId) === String(idToDelete)) {
        closeTradeModal();
      }

      await fetchLog();
    } catch (e) {
      alert("Failed to delete trade");
      console.error(e?.response?.data || e);
    }
  }

  function clearTradeSelection() {
    closeTradeModal();
  }

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
        <Notice type="error" title="Something went wrong">
          {error}
        </Notice>
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbItems} />

      <Link to="/daily-logs">← Back</Link>

      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="h2" style={{ marginBottom: 10 }}>
          {log.date ? new Date(log.date).toLocaleDateString() : "—"} — {log.ticker}
        </h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setNotesError("");
              setEditingNotes((v) => !v);
            }}
          >
            {editingNotes ? "Cancel" : "Edit Notes"}
          </button>

          {editingNotes ? (
            <button
              className="btn btnPrimary"
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          ) : null}
        </div>

        {notesError ? (
          <p className="error" style={{ marginTop: 0 }}>
            {notesError}
          </p>
        ) : null}

        {editingNotes ? (
          <div className="row" style={{ flexDirection: "column", gap: 10 }}>
            <textarea
              className="input"
              rows={3}
              value={keyLevelsEdit}
              onChange={(e) => setKeyLevelsEdit(e.target.value)}
              placeholder="Key Levels"
            />
            <textarea
              className="input"
              rows={3}
              value={feelingsEdit}
              onChange={(e) => setFeelingsEdit(e.target.value)}
              placeholder="Feelings"
            />
            <textarea
              className="input"
              rows={4}
              value={reflectionsEdit}
              onChange={(e) => setReflectionsEdit(e.target.value)}
              placeholder="Reflections"
            />
          </div>
        ) : (
          <div className="kv">
            <strong>Key Levels</strong>
            <div>{log.keyLevels || "—"}</div>

            <strong>Feelings</strong>
            <div>{log.feelings || "—"}</div>

            <strong>Reflections</strong>
            <div>{log.reflections || "—"}</div>
          </div>
        )}

        {selectedTrade && (
          <div style={{ marginTop: 12 }}>
            <span className="badge badgeGray">
              Selected: {selectedTrade.timeIn || "—"}–{selectedTrade.timeOut || "—"}
            </span>{" "}
            <button className="btn" style={{ marginLeft: 10 }} onClick={clearTradeSelection}>
              Clear Trade
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add Trade</h3>

        <form onSubmit={handleAddTrade}>
          <div className="row">
            <input
              className="input"
              placeholder="Time In (HH:MM)"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
            />
            <input
              className="input"
              placeholder="Time Out (HH:MM)"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
            />
            <input
              className="input"
              placeholder="Profit/Loss (e.g. -17.00)"
              value={profitLoss}
              onChange={(e) => setProfitLoss(e.target.value)}
            />

            <label className="badge badgeGray">
              <input
                type="checkbox"
                checked={runner}
                onChange={(e) => setRunner(e.target.checked)}
              />
              Runner
            </label>

            <select className="select" value={optionType} onChange={(e) => setOptionType(e.target.value)}>
              <option value="CALL">CALL</option>
              <option value="PUT">PUT</option>
            </select>

            <select
              className="select"
              value={outcomeColor}
              onChange={(e) => setOutcomeColor(e.target.value)}
            >
              <option value="GREEN">GREEN</option>
              <option value="RED">RED</option>
            </select>

            <select className="select" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="ORB15">ORB15</option>
              <option value="ORB5">ORB5</option>
              <option value="3CONF">3CONF</option>
            </select>

            <button type="submit" className="btn btnPrimary" disabled={submitting}>
              {submitting ? "Saving..." : "Add Trade"}
            </button>
          </div>

          {formError ? (
            <p className="error" style={{ marginTop: 10 }}>
              {formError}
            </p>
          ) : null}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Trades</h3>

        {log.trades?.length ? (
          <div className="tableWrap">
            <table className="table" style={{ marginTop: 12, width: "100%" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Tags</th>
                  <th className="right">P/L</th>
                  <th className="right">Contracts</th>
                  <th className="right">Drip%</th>
                  <th className="right">Leveraged</th>
                  <th className="right" style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {log.trades.map((t) => {
                  const pl = Number(t.profitLoss ?? 0);
                  const plCls = pl > 0 ? "plPos" : pl < 0 ? "plNeg" : "plZero";
                  const isSelected = String(tradeId) === String(t.id);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => openTradeModal(t.id)}
                      style={
                        isSelected
                          ? { background: "rgba(124,58,237,.10)", cursor: "pointer" }
                          : { cursor: "pointer" }
                      }
                    >
                      <td>
                        {t.timeIn || "—"}–{t.timeOut || "—"}{" "}
                        {t.runner ? <span className="badge badgeGray">RUNNER</span> : null}
                      </td>

                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          {t.optionType ? <span className="badge badgePurple">{t.optionType}</span> : null}
                          {t.outcomeColor ? (
                            <span className={`badge ${t.outcomeColor === "GREEN" ? "badgeGreen" : "badgeRed"}`}>
                              {t.outcomeColor}
                            </span>
                          ) : null}
                          {t.strategy ? <span className="badge badgePurple">{t.strategy}</span> : null}
                        </div>
                      </td>

                      <td className={`right ${plCls}`}>
                        {pl > 0 ? "+" : ""}
                        {Number.isNaN(pl) ? "0.00" : pl.toFixed(2)}
                      </td>

                      <td className="right">
                        {t.contractsCount == null || t.contractsCount === "" ? "—" : t.contractsCount}
                      </td>

                      <td className="right">
                        {t.dripPercent == null || t.dripPercent === "" ? "—" : `${t.dripPercent}%`}
                      </td>

                      <td className="right">
                        {t.amountLeveraged == null || t.amountLeveraged === "" ? "—" : Number(t.amountLeveraged).toFixed(0)}
                      </td>

                      <td className="right" style={{ whiteSpace: "nowrap" }}>
                        <button
                          className="btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTradeModal(t.id);
                          }}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="btn btnDanger"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrade(t.id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No trades yet.</p>
        )}
      </div>

      <TradeEditModal
        open={!!tradeId && !!selectedTrade}
        trade={selectedTrade}
        onClose={closeTradeModal}
        onSave={handleSaveTrade}
      />
    </div>
  );
}
