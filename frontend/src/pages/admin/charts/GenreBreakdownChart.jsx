import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GenreBreakdownChart({ books }) {
  const genreCounts = books.reduce((acc, book) => {
    const genre = String(book.genre || "Unknown").trim().split(",")[0].trim();
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (data.length === 0) {
    return (
      <div className="admin-card">
        <h2 className="heading-md">Genre Breakdown</h2>
        <p className="text-muted-xs admin-card-note">No books yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-card admin-chart-card">
      <h2 className="heading-md">Genre Breakdown</h2>
      <p className="text-muted-xs admin-card-note stack-space-md">
        Top genres by number of listings
      </p>
      <div className="admin-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }} />
            <YAxis
              type="category"
              dataKey="genre"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip formatter={(value) => [value, "Books"]} />
            <Bar dataKey="count" fill="#4f7f7c" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}