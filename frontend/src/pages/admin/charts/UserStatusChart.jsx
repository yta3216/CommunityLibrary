import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function UserStatusChart({ users }) {
  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  const data = [
    { label: "Active", count: active },
    { label: "Suspended", count: suspended },
  ];

  const COLORS = ["#27500A", "#A32D2D"];

  return (
    <div className="admin-card">
      <h2 className="heading-md">User Status</h2>
      <p className="text-muted-xs admin-card-note" style={{ marginBottom: 16 }}>
        Active vs suspended accounts
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
          <XAxis dataKey="label" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip
            formatter={(value) => [value, "Users"]}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}