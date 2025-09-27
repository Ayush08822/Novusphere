import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { SectionData } from "../models/SectionData";
import { VideoResponse } from "../models/VideoResponse";
import { FileResponse } from "../models/FileResponse";
import { AuthContext } from "react-oauth2-code-pkce";
import { jwtDecode } from "jwt-decode";
import "../css/MyLearning.css";
import { StarRating } from "../Utils/StarRating";
import { AnnouncementData } from "../models/AnnouncementData";

// --- Interfaces & Helper Components ---
interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}
interface ReviewsResponse {
  averageRating: number;
  reviews: ReviewData[];
}
interface SectionWithMedia extends SectionData {
  videos: VideoResponse[];
  files: FileResponse[];
  isOpen?: boolean;
}
interface AuthUser {
  email: string;
  name?: string;
}

// Helper function to format date into "time ago" format
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

const base64ToUrl = (base64Data: string, mimeType: string) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
};

export const MyLearning: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { token } = useContext(AuthContext);

  const [sections, setSections] = useState<SectionWithMedia[]>([]);
  const [activeTab, setActiveTab] = useState<
    "content" | "announcements" | "reviews"
  >("content");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // ADDED BACK: State for announcements
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchSections = async () => {
      try {
        const sectionResponse = await fetch(
          `http://localhost:8072/app/courses/api/sections/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!sectionResponse.ok) throw new Error("Failed to fetch sections");
        const sectionData: SectionData[] = await sectionResponse.json();
        const sectionWithMedia: SectionWithMedia[] = await Promise.all(
          sectionData.map(async (section) => {
            const [videoResponse, fileResponse] = await Promise.all([
              fetch(
                `http://localhost:8072/app/videos/api/video/${section.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              ).then((res) => res.json()),
              fetch(`http://localhost:8072/app/files/api/files/${section.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then((res) => res.json()),
            ]);
            return {
              ...section,
              isOpen: false,
              videos: videoResponse.map(
                (v: any) =>
                  new VideoResponse(
                    v.id,
                    v.title,
                    base64ToUrl(v.data, v.type),
                    v.type
                  )
              ),
              files: fileResponse.map((f: any) => {
                const mimeType = f.contentType || "";
                const extension = mimeType.split("/")[1] || "";
                const filename =
                  extension && !f.title.endsWith(`.${extension}`)
                    ? `${f.title}.${extension}`
                    : f.title;
                return new FileResponse(
                  f.id,
                  filename,
                  base64ToUrl(f.data, mimeType || "application/octet-stream"),
                  mimeType
                );
              }),
            };
          })
        );
        setSections(sectionWithMedia);
        if (
          sectionWithMedia.length > 0 &&
          sectionWithMedia[0].videos.length > 0
        ) {
          setSelectedVideo(sectionWithMedia[0].videos[0].data);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [courseId, token]);

  const fetchReviews = useCallback(async () => {
    if (!courseId || !token) return;
    setReviewsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8072/app/courses/api/reviews/fetch-reviews/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data: ReviewsResponse = await response.json();
      setAverageRating(data.averageRating);
      setReviews(data.reviews);
      const decodedUser: AuthUser = jwtDecode(token);
      if (decodedUser?.email) {
        const userReview = data.reviews.find(
          (review) => review.reviewerName === decodedUser.email
        );
        setHasUserReviewed(!!userReview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  }, [courseId, token]);

  // ADDED BACK: A function to fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    if (!courseId || !token) return;
    setAnnouncementsLoading(true);
    try {
      const response = await fetch(
        
        `http://localhost:8072/app/courses/api/announce/get-announcements/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }
      const data = await response.json();
      const announcementObjects = data.map(
        (a: any) =>
          new AnnouncementData(
            a.id,
            a.title,
            a.content,
            a.announcerEmail,
            a.createdAt
          )
      );
      setAnnouncements(announcementObjects);
      console.log(announcementObjects.createdAt);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [courseId, token]);

  // ADDED BACK: The useEffect now also handles the announcements tab
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
    if (activeTab === "announcements") {
      fetchAnnouncements();
    }
  }, [activeTab, fetchReviews, fetchAnnouncements]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0 || !newReviewText) {
      alert("Please provide a rating and a comment.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8072/app.courses/api/reviews/submit-review/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: newReviewRating,
            comment: newReviewText,
            courseId: Number(courseId),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to submit review.");
      setShowReviewForm(false);
      setNewReviewRating(0);
      setNewReviewText("");
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("There was an error submitting your review.");
    }
  };

  const allVideos = useMemo(
    () => sections.flatMap((section) => section.videos),
    [sections]
  );
  const handleVideoEnd = () => {
    const currentIndex = allVideos.findIndex(
      (video) => video.data === selectedVideo
    );
    if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
      const nextVideo = allVideos[currentIndex + 1];
      setSelectedVideo(nextVideo.data);
    }
  };
  const toggleSection = (id: number) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, isOpen: !sec.isOpen } : sec))
    );
  };
  const ratingOptions = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="course-detail-container">
      <div className="course-video-container">
        {selectedVideo ? (
          <video
            key={selectedVideo}
            src={selectedVideo}
            className="course-video"
            controls
            onEnded={handleVideoEnd}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="no-video">No video available</div>
        )}
      </div>

      <div className="course-tabs">
        <button
          className={`tab-btn ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Course Content
        </button>
        <button
          className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
        </button>
        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "content" && (
          <div className="sections">
            {sections.map((section) => (
              <div key={section.id} className="section">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span>{section.name}</span>
                  <span className={`arrow ${section.isOpen ? "open" : ""}`}>
                    &#9654;
                  </span>
                </div>
                {section.isOpen && (
                  <div className="section-body">
                    <ul className="video-list">
                      {section.videos.length > 0 ? (
                        section.videos.map((video) => (
                          <li
                            key={video.id}
                            className="video-item"
                            onClick={() => setSelectedVideo(video.data)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                              className="video-logo"
                            >
                              <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                              <path d="M12 20v-3" />
                              <path d="M8 20h8" />
                              <polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                            <span className="video-title">{video.title}</span>
                          </li>
                        ))
                      ) : (
                        <li className="empty-item">
                          No videos in this section
                        </li>
                      )}
                    </ul>
                    <ul className="file-list">
                      {section.files.length > 0 ? (
                        section.files.map((file) => (
                          <li key={file.id} className="file-item">
                            📄{" "}
                            <a href={file.data} download={file.title}>
                              {file.title}
                            </a>
                          </li>
                        ))
                      ) : (
                        <li className="empty-item">No files in this section</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ADDED BACK: The full announcements tab logic */}
        {activeTab === "announcements" && (
          <div className="announcements-container">
            {announcementsLoading ? (
              <div className="spinner-container-small">
                <div className="spinner"></div>
              </div>
            ) : announcements.length > 0 ? (
              <div className="announcements-list">
                {announcements.map((ann) => (
                  <div key={ann.id} className="announcement-item">
                    <div className="announcement-header">
                      <div className="announcement-author">
                        <div className="author-initial">
                          {ann.announcerEmail
                            ? ann.announcerEmail.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <span>{ann.announcerEmail || "Anonymous"}</span>
                      </div>
                      <div className="announcement-date">
                        {formatTimeAgo(ann.createdAt)}
                      </div>
                    </div>
                    <div className="announcement-body">
                      <h3>{ann.title}</h3>
                      <p>{ann.content}</p>
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
        )}

        {activeTab === "reviews" && (
          <div className="reviews-container">
            {reviewsLoading ? (
              <div className="spinner-container-small">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <h2>Student Feedback</h2>
                <div className="overall-rating">
                  <div className="rating-value">{averageRating.toFixed(1)}</div>
                  <div className="rating-summary">
                    <StarRating rating={averageRating} />
                    <span>Course Rating</span>
                  </div>
                </div>

                {hasUserReviewed ? (
                  <div className="user-reviewed-message">
                    <p>✓ You've already reviewed this course. Thank you!</p>
                  </div>
                ) : (
                  <>
                    <div className="review-actions">
                      <button
                        className="leave-review-btn"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? "Cancel" : "Leave a Review"}
                      </button>
                    </div>

                    {showReviewForm && (
                      <div className="review-form">
                        <form onSubmit={handleReviewSubmit}>
                          <h4>Your Review</h4>
                          <div className="form-group rating-input">
                            <label>Rating:</label>
                            <div className="rating-selection">
                              <select
                                value={newReviewRating}
                                onChange={(e) =>
                                  setNewReviewRating(Number(e.target.value))
                                }
                              >
                                <option value="0" disabled>
                                  Select a rating
                                </option>
                                {ratingOptions.map((rating) => (
                                  <option key={rating} value={rating}>
                                    {rating.toFixed(1)} Stars
                                  </option>
                                ))}
                              </select>
                              <StarRating rating={newReviewRating} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="review-text">Comment:</label>
                            <textarea
                              id="review-text"
                              rows={4}
                              value={newReviewText}
                              onChange={(e) => setNewReviewText(e.target.value)}
                              placeholder="Tell us about your own personal experience taking this course."
                            />
                          </div>
                          <button type="submit" className="submit-review-btn">
                            Submit Review
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}

                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-author">
                          {review.reviewerName
                            ? review.reviewerName.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <div className="review-content">
                          <div className="review-header">
                            <strong>
                              {review.reviewerName || "Anonymous"}
                            </strong>
                            <span>
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <StarRating rating={review.rating} />
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Be the first to review this course!</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
