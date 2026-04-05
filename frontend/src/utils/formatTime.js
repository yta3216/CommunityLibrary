function formatTime(timeValue) {
  const timestamp = new Date(timeValue || 0).getTime();
  if (!timestamp) return "Now";

  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export { formatTime };
export default formatTime;
