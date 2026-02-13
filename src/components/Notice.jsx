export default function Notice({ type = "info", title, children, action }) {
  const styles = {
    info: {
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
    },
    error: {
      border: "1px solid rgba(239,68,68,0.35)",
      background: "rgba(239,68,68,0.10)",
    },
    success: {
      border: "1px solid rgba(34,197,94,0.30)",
      background: "rgba(34,197,94,0.10)",
    },
  };

  return (
    <div
      className="card"
      style={{
        ...styles[type],
        marginTop: 12,
      }}
    >
      {title ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div> : null}
      {children ? <div style={{ opacity: 0.9 }}>{children}</div> : null}
      {action ? <div style={{ marginTop: 10 }}>{action}</div> : null}
    </div>
  );
}
