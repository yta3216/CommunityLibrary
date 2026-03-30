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

  const availableByStatus =
    normalizedStatus === "available" || normalizedStatus === "with_owner";
  const availableByOwnership =
    ownerId && holderId && ownerId.toString() === holderId.toString();

  return Boolean(availableByStatus || availableByOwnership);
}

export function toAvailableCopiesText(count) {
  if (count === 1) {
    return "1 copy available";
  }

  return `${count} copies available`;
}
