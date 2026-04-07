import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    const t = new Date(item.createdAt).getTime();
    if (t < cutoff) return;
    const bucketIndex = Math.floor((t - cutoff) / bucketMs);
    const ts = cutoff + bucketIndex * bucketMs;
    const key = formatWeek(ts);
    if (buckets[key]) buckets[key].count += 1;
  });

  return Object.values(buckets);
};

export default function ReviewsChart({ reviews, days }) {
  const data = groupByPeriod(reviews, days);

  return (
    <div className="admin-card admin-chart-card">
      <h2 className="heading-md">Reviews Written</h2>
      <p className="text-muted-xs admin-card-note stack-space-md">
        Review activity over the selected period
      </p>
      {reviews.length === 0 ? (
        <p className="text-muted-xs admin-card-note">No reviews yet.</p>
      ) : (
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value, "Reviews"]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3C3489"
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