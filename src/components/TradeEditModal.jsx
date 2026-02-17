import { useEffect, useMemo, useState } from "react";

function numOrUndef(v) {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function strOrUndef(v) {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
}

function toUpperOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s.toUpperCase() : null;
}

/**
 * Normalizes time inputs into H:MM or HH:MM (24-hour).
 * Accepts:
 * - "9:30", "09:30", "10:02"
 * - "9:30 AM", "10:02pm"
 * - "930", "0930"
 * Returns: "09:30" etc, or undefined if invalid/empty.
 */
function normalizeTimeHM(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return undefined;

  // Already valid: H:MM or HH:MM
  let m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (h >= 0 && h <= 23 && mm >= 0 && mm <= 59) {
      return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }
    return undefined;
  }

  // H:MM AM/PM
  m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let h = Number(m[1]);
    const mm = Number(m[2]);
    const ap = String(m[3]).toUpperCase();
    if (h < 1 || h > 12 || mm < 0 || mm > 59) return undefined;
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  // "930" or "0930"
  m = raw.match(/^(\d{3,4})$/);
  if (m) {
    const s = m[1].padStart(4, "0");
    const h = Number(s.slice(0, 2));
    const mm = Number(s.slice(2));
    if (h >= 0 && h <= 23 && mm >= 0 && mm <= 59) return `${s.slice(0, 2)}:${s.slice(2)}`;
    return undefined;
  }

  return undefined;
}

export default function TradeEditModal({ open, trade, onClose, onSave }) {
  const initial = useMemo(() => {
    if (!trade) return null;
    return {
      timeIn: trade.timeIn ?? "",
      timeOut: trade.timeOut ?? "",
      profitLoss: trade.profitLoss ?? "",
      runner: !!trade.runner,
      optionType: trade.optionType ?? "CALL",
      outcomeColor: trade.outcomeColor ?? "GREEN",
      strategy: trade.strategy ?? "ORB15",
      contractsCount: trade.contractsCount ?? "",
      dripPercent: trade.dripPercent ?? "",
      amountLeveraged: trade.amountLeveraged ?? "",
    };
  }, [trade]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial);
    setSaving(false);
    setError("");
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  async function submit(e) {
    e.preventDefault();
    setError("");

    // Normalize/validate time BEFORE sending
    const normTimeIn = normalizeTimeHM(form?.timeIn);
    const normTimeOut = normalizeTimeHM(form?.timeOut);

    if (!normTimeIn || !normTimeOut) {
      setError("Time must be H:MM or HH:MM (e.g. 9:30 or 10:02).");
      return;
    }

    setSaving(true);

    try {
      const body = {
        timeIn: normTimeIn,
        timeOut: normTimeOut,
        profitLoss: numOrUndef(form.profitLoss),
        runner: !!form.runner,
        optionType: toUpperOrNull(form.optionType) ?? undefined,
        outcomeColor: toUpperOrNull(form.outcomeColor) ?? undefined,
        strategy: toUpperOrNull(form.strategy) ?? undefined,
        contractsCount: numOrUndef(form.contractsCount),
        dripPercent: numOrUndef(form.dripPercent),
        amountLeveraged: numOrUndef(form.amountLeveraged),
      };

      // keep Zod happy (no empty PATCH)
      Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

      await onSave(body);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to update trade");
    } finally {
      setSaving(false);
    }
  }

  // Inline styles so the modal is NEVER “washed out”, regardless of global CSS.
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.80)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 999,
  };

  const modalStyle = {
    width: "min(760px, 100%)",
    margin: 0,
    background: "#0f1117",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 30px 80px rgba(0,0,0,0.85)",
    opacity: 1,
  };

  const fieldStyle = {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
  };

  const closeXStyle = {
    lineHeight: 1,
    padding: "6px 10px",
    fontSize: 18,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ width: "min(760px, 100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyle}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#fff" }}>Edit Trade</h3>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {trade?.timeIn || "—"} – {trade?.timeOut || "—"}
              </div>
            </div>

            <button
              className="btn"
              type="button"
              onClick={onClose}
              disabled={saving}
              style={closeXStyle}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={submit} style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <div className="row" style={{ gap: 12 }}>
              <input
                className="input"
                style={fieldStyle}
                placeholder="Time In (H:MM or HH:MM)"
                value={form?.timeIn ?? ""}
                onChange={set("timeIn")}
              />
              <input
                className="input"
                style={fieldStyle}
                placeholder="Time Out (H:MM or HH:MM)"
                value={form?.timeOut ?? ""}
                onChange={set("timeOut")}
              />
              <input
                className="input"
                style={fieldStyle}
                placeholder="Profit/Loss"
                value={form?.profitLoss ?? ""}
                onChange={set("profitLoss")}
              />
            </div>

            <div className="row" style={{ gap: 12 }}>
              <select
                className="select"
                style={fieldStyle}
                value={form?.optionType ?? "CALL"}
                onChange={set("optionType")}
              >
                <option value="CALL">CALL</option>
                <option value="PUT">PUT</option>
              </select>

              <select
                className="select"
                style={fieldStyle}
                value={form?.outcomeColor ?? "GREEN"}
                onChange={set("outcomeColor")}
              >
                <option value="GREEN">GREEN</option>
                <option value="RED">RED</option>
              </select>

              <select
                className="select"
                style={fieldStyle}
                value={form?.strategy ?? "ORB15"}
                onChange={set("strategy")}
              >
                <option value="ORB15">ORB15</option>
                <option value="ORB5">ORB5</option>
                <option value="3CONF">3CONF</option>
              </select>

              <label
                className="badge badgeGray"
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <input type="checkbox" checked={!!form?.runner} onChange={set("runner")} />
                Runner
              </label>
            </div>

            <div className="row" style={{ gap: 12 }}>
              <input
                className="input"
                style={fieldStyle}
                placeholder="Contracts"
                type="number"
                step="1"
                value={form?.contractsCount ?? ""}
                onChange={set("contractsCount")}
              />
              <input
                className="input"
                style={fieldStyle}
                placeholder="Drip %"
                type="number"
                step="0.01"
                value={form?.dripPercent ?? ""}
                onChange={set("dripPercent")}
              />
              <input
                className="input"
                style={fieldStyle}
                placeholder="Amount Leveraged"
                type="number"
                step="0.01"
                value={form?.amountLeveraged ?? ""}
                onChange={set("amountLeveraged")}
              />
            </div>

            {error ? (
              <p className="error" style={{ margin: 0 }}>
                {error}
              </p>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn" type="button" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button className="btn btnPrimary" type="submit" disabled={saving || !trade}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
