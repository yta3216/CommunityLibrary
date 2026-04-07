import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

export default function AvgRatingChart({ books }) {
  const data = books
    .filter((b) => b.numberOfReviews > 0)
    .map((b) => ({
      title: b.title && b.title.length > 14 ? b.title.slice(0, 13) + "…" : (b.title || "Untitled"),
      rating: Number(b.avgReviews || 0),
      reviews: b.numberOfReviews || 0,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="admin-card">
        <h2 className="heading-md">Average Ratings</h2>
        <p className="text-muted-xs admin-card-note">
          No reviews on your books yet.
        </p>
      </div>
    );
  }
  const getColor = (rating) => {
    if (rating >= 3.5) return "#27500A";
    if (rating >= 2.5) return "#BA7517";
    return "#A32D2D";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { title, rating, reviews } = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: "1px solid #e7eaef", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
        <p style={{ margin: "4px 0 0", color: "#667085" }}>★ {rating.toFixed(1)} · {reviews} review{reviews !== 1 ? "s" : ""}</p>
      </div>
    );
  };

  return (
    <div className="admin-card">
      <h2 className="heading-md">Average Ratings</h2>
      <p className="text-muted-xs admin-card-note" style={{ marginBottom: 16 }}>
        Your books ranked by reader rating
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={32} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" vertical={false} />
          <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
          <ReferenceLine y={3.5} stroke="#e7eaef" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rating" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.rating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}