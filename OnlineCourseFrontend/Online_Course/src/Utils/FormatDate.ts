// This function handles date-only strings like "2025-09-28".
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  const announcementDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  if (isNaN(announcementDate.getTime())) {
    console.error("Invalid date string received:", dateString);
    return "Invalid date";
  }

  if (announcementDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (announcementDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return announcementDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};