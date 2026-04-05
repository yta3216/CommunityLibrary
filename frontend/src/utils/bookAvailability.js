export function getBookUserId(userField) {
  if (!userField) {
    return "";
  }

  if (typeof userField === "object" && userField._id) {
    return String(userField._id);
  }

  return String(userField);
}

export function isListingAvailable(listing) {
  if (!listing) {
    return false;
  }

  const ownerId = getBookUserId(listing.owner);
  const holderId = getBookUserId(listing.holder);
  const normalizedStatus = String(listing.status || "").toLowerCase();

  const availableByStatus = normalizedStatus === "available";
  const availableByOwnership =
    ownerId && holderId && ownerId.toString() === holderId.toString();

  return Boolean(availableByStatus || availableByOwnership);
}