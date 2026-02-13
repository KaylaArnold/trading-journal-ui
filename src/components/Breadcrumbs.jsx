import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <span key={`${item.label}-${idx}`} style={{ display: "flex", gap: 8 }}>
            {idx > 0 && <span style={{ opacity: 0.6 }}>›</span>}

            {item.to && !isLast ? (
              <Link
                to={item.to}
                style={{
                  textDecoration: "none",
                  color: "#2563eb",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
