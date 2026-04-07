import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const getTime = (book) => {
  if (book.createdAt) return new Date(book.createdAt).getTime();
  return parseInt(String(book._id).substring(0, 8), 16) * 1000;
};

const formatWeek = (dateMs) => {
  const d = new Date(dateMs);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
};

const groupByPeriod = (items, days) => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const bucketMs = days <= 7 ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const buckets = {};
  const numBuckets = Math.ceil((now - cutoff) / bucketMs);

  for (let i = 0; i <= numBuckets; i++) {
    const ts = cutoff + i * bucketMs;
    const key = formatWeek(ts);
    buckets[key] = { date: key, count: 0 };
  }

  items.forEach((item) => {
    const t = getTime(item);
    if (t < cutoff) return;
    const bucketIndex = Math.floor((t - cutoff) / bucketMs);
    const ts = cutoff + bucketIndex * bucketMs;
    const key = formatWeek(ts);
    if (buckets[key]) buckets[key].count += 1;
  });

  return Object.values(buckets);
};

export default function ListingsChart({ books, days }) {
  const data = groupByPeriod(books, days);

  return (
    <div className="admin-card admin-chart-card">
      <h2 className="heading-md">New Listings</h2>
      <p className="text-muted-xs admin-card-note" style={{ marginBottom: 16 }}>
        Books listed over the selected period
      </p>
      {books.length === 0 ? (
        <p className="text-muted-xs admin-card-note">No listings yet.</p>
      ) : (
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, "Listings"]}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#A32D2D"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}