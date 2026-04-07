import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function BooksStatusChart({ books }) {
  const available = books.filter((b) => b.status === "available").length;
  const borrowed = books.filter((b) => b.status !== "available").length;

  const data = [
    { label: "Available", count: available },
    { label: "Borrowed", count: borrowed },
  ];

  const COLORS = ["#27500A", "#A32D2D"];

  return (
    <div className="admin-card admin-chart-card">
      <h2 className="heading-md">Book Availability</h2>
      <p className="text-muted-xs admin-card-note stack-space-md">
        Available vs currently borrowed
      </p>
      <div className="admin-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
            <XAxis dataKey="label" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip formatter={(value) => [value, "Books"]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}