import React from "react";

// --- INTERFACE DEFINITION ---
// Define the interface directly in the file that uses it.
export interface AnnouncementData {
  id: number;
  announcementTitle: string;
  announcementDescription: string;
  email: string;
  createdAt: string;
}

// Date formatting function
const formatAnnouncementDate = (dateString: string): string => {
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

interface AnnouncementsProps {
  announcements: AnnouncementData[];
  announcementsLoading: boolean;
}

export const Announcements: React.FC<AnnouncementsProps> = ({
  announcements,
  announcementsLoading,
}) => {
  if (announcementsLoading) {
    return (
      <div className="spinner-container-small">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      {announcements.length > 0 ? (
        <div className="announcements-list">
          {announcements.map((ann) => (
            <div key={ann.id} className="announcement-item">
              <div className="announcement-header">
                <div className="announcement-author">
                  <div className="author-initial">
                    {ann.email ? ann.email.charAt(0).toUpperCase() : "A"}
                  </div>
                  <span>{ann.email || "Anonymous"}</span>
                </div>
                <div className="announcement-date">
                  {formatAnnouncementDate(ann.createdAt)}
                </div>
              </div>
              <div className="announcement-body">
                <h3>{ann.announcementTitle}</h3>
                <p>{ann.announcementDescription}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="announcements">
          <p>No announcements yet.</p>
        </div>
      )}
    </div>
  );
};
