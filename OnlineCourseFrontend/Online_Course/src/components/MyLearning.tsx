import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { SectionData } from "../models/SectionData";
import { VideoResponse } from "../models/VideoResponse";
import { FileResponse } from "../models/FileResponse";
import { AuthContext } from "react-oauth2-code-pkce";
import { jwtDecode } from "jwt-decode";
import "../css/MyLearning.css";
import { StarRating } from "../Utils/StarRating";
import { AnnouncementData } from "../models/AnnouncementData";
import { formatTimeAgo } from "../Utils/FormatDate";

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
//Interface to check whether the current loggen in user is allowed to access the course.
interface AuthUser {
  email: string;
  name?: string;
}

/**
 * Converts a Base64 encoded string into a browser-readable blob URL.
 * @param base64Data The Base64 encoded data string.
 * @param mimeType The MIME type of the data (e.g., 'video/mp4', 'image/jpeg').
 * @returns A temporary URL that can be used as a source for HTML elements like <video> or <img>.
 */
const base64ToUrl = (base64Data: string, mimeType: string): string => {
  // 1. Decode the Base64 string into a binary string. The 'atob' function stands for "ASCII to Binary".
  const byteCharacters = atob(base64Data);

  // 2. Create an array to hold the byte values of the decoded string.
  const byteNumbers = new Array(byteCharacters.length);

  // 3. Loop through the binary string and convert each character to its corresponding byte value (0-255).
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // 4. Convert the array of byte values into a real byte array (Uint8Array).
  const byteArray = new Uint8Array(byteNumbers);

  // 5. Create a Blob from the byte array, tagging it with the correct MIME type.
  // A Blob is a file-like object of immutable, raw data.
  const blob = new Blob([byteArray], { type: mimeType });

  // 6. Generate a temporary, unique URL that points to the Blob object in the browser's memory.
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
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  //State to handle authorization errors
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !courseId) {
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      try {
        // STEP 1: Perform the authorization check first.
        // This endpoint should return 200 OK if enrolled, and 403/404 if not.
        const authResponse = await fetch(
          `http://localhost:8072/app/mylearning/api/mylearning/secure/check-enrollment/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // If the response is not OK (e.g., 403 Forbidden or 404 Not Found), the user is not enrolled.
        if (!authResponse.ok) {
          throw new Error(
            "You are not enrolled in this course and cannot view its content."
          );
        }

        // STEP 2: If the authorization check passes, proceed to fetch the actual course content.
        const sectionResponse = await fetch(
          `http://localhost:8072/app/courses/api/sections/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!sectionResponse.ok)
          throw new Error(
            "Failed to fetch course content after authorization."
          );

        const sectionData: SectionData[] = await sectionResponse.json();

        // This is the same logic as before to fetch videos and files for each section.
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
                    v.contentType
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
      } catch (error: any) {
        setAuthError(error.message);
        console.error("Authorization or fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, token]);

  // Method to fetch the reviews using a special hook known as useCallback.
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
      //Decoding the token to extract the email.
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

  //Method to fetch the announcements using a special hook known as useCallback.
  const fetchAnnouncements = useCallback(async () => {
    if (!courseId || !token) return;
    setAnnouncementsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8072/app/courses/api/announce/get-announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      const announcementObjects = data.map(
        (a: any) =>
          new AnnouncementData(
            a.id,
            a.announcementTitle,
            a.announcementDescription,
            a.email,
            a.createdAt
          )
      );
      setAnnouncements(announcementObjects);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [courseId, token]);

  //Use effect for checking which current tab is active.
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
    if (activeTab === "announcements") {
      fetchAnnouncements();
    }
  }, [activeTab, fetchReviews, fetchAnnouncements]);

  //Function to submit a review.
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0 || !newReviewText) {
      alert("Please provide a rating and a comment.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8072/app/courses/api/reviews/submit-review/${courseId}`,
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
      setSelectedVideo(allVideos[currentIndex + 1].data);
    }
  };
  const toggleSection = (id: number) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, isOpen: !sec.isOpen } : sec))
    );
  };
  const ratingOptions = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // ADDED: This new block renders an error screen if authorization fails.
  if (authError) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>{authError}</p>
        <Link to="/mylearning" className="error-link">
          ← Go back to My Learning
        </Link>
      </div>
    );
  }

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
                          {ann.email ? ann.email.charAt(0).toUpperCase() : "A"}
                        </div>
                        <span>{ann.email || "Anonymous"}</span>
                      </div>
                      <div className="announcement-date">
                        {formatTimeAgo(ann.createdAt)}
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
