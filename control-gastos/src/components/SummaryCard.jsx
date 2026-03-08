function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="card summary-card">
      <h3>{title}</h3>
      <p className="summary-value">{value}</p>
      {subtitle && <span className="summary-subtitle">{subtitle}</span>}
    </div>
  );
}

export default SummaryCard;