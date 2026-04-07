import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function StatusBreakdownChart({ books }) {
  const available = books.filter((b) => b.status === "available").length;
  const onLoan = books.filter((b) => b.status !== "available").length;

  const data = [
    { label: "Available", count: available },
    { label: "On Loan", count: onLoan },
  ];

  const COLORS = ["#27500A", "#A32D2D"];

  return (
    <div className="admin-card">
      <h2 className="heading-md">Availability</h2>
      <p className="text-muted-xs admin-card-note" style={{ marginBottom: 16 }}>
        Your listings by current status
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
          <XAxis dataKey="label" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip
            formatter={(value) => [value, "Books"]}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}