import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CourseFormData } from "../models/CourseFormData";
import { SectionData } from "../models/SectionData";
import { VideoResponse } from "../models/VideoResponse";
import { FileResponse } from "../models/FileResponse";
import "../StudentCourseDetail.css";
import "../VideoList.css";
import { AuthContext } from "react-oauth2-code-pkce";

// --- Interfaces for Review Data ---
interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string; // From backend's ReviewDetailDto
  date: string;
}

interface ReviewsResponse {
  averageRating: number;
  reviews: ReviewData[];
}

// --- Reusable Star Rating Component ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating-display">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star-display full-star-display">
          ★
        </span>
      ))}
      {halfStar && <span className="star-display half-star-display">☆</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star-display empty-star-display">
          ☆
        </span>
      ))}
    </div>
  );
};

export const StudentCourseDetail = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseFormData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [expandedSectionIds, setExpandedSectionIds] = useState<number[]>([]);
  const [videosBySection, setVideosBySection] = useState<{
    [key: number]: VideoResponse[];
  }>({});
  const [filesBySection, setFilesBySection] = useState<{
    [key: number]: FileResponse[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<{
    [sectionId: number]: number | null;
  }>({});

  // --- State for Reviews ---
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [visibleReviews, setVisibleReviews] = useState<number>(3); // Initially show 3 reviews

  const handleVideoPlay = (sectionId: number, videoId: number) => {
    setPlayingVideoId((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === videoId ? null : videoId,
    }));
  };

  useEffect(() => {
    if (!token || !id) return;
    fetch(`http://localhost:8072/app/courses/api/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch course details");
        return response.json();
      })
      .then((data: CourseFormData) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      fetch(`http://localhost:8072/app/courses/api/sections/course/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch sections");
          return response.json();
        })
        .then((data: SectionData[]) => {
          setSections(data);
          data.forEach((section) => {
            fetchVideos(section.id);
            fetchFiles(section.id);
          });
        })
        .catch((err) => console.error("Section fetch error:", err));
    }
  }, [id, token]);

  // --- useEffect to fetch reviews ---
  useEffect(() => {
    if (id && token) {
      fetch(`http://localhost:8072/app/courses/api/reviews/fetch-reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch reviews");
          return res.json();
        })
        .then((data: ReviewsResponse) => {
          setAverageRating(data.averageRating);
          setReviews(data.reviews);
        })
        .catch((err) => console.error("Review fetch error:", err));
    }
  }, [id, token]);

  const fetchVideos = (sectionId: number) => {
    if (!token) return;
    fetch(`http://localhost:8072/app/videos/api/video/${sectionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((videos: VideoResponse[]) => {
        const processedVideos = videos
          .map((video) => {
            if (!video.data) return null;
            try {
              const binary = atob(video.data.replace(/\s/g, ""));
              const byteArray = Uint8Array.from(binary, (char) =>
                char.charCodeAt(0)
              );
              const blob = new Blob([byteArray], {
                type: video.contentType || "video/mp4",
              });
              const objectUrl = URL.createObjectURL(blob);
              return new VideoResponse(
                video.id,
                video.title,
                objectUrl,
                video.contentType
              );
            } catch (e) {
              console.error(`Error decoding video ID ${video.id}:`, e);
              return null;
            }
          })
          .filter((v): v is VideoResponse => v !== null);
        setVideosBySection((prev) => ({
          ...prev,
          [sectionId]: processedVideos,
        }));
      })
      .catch((err) =>
        console.error(`Error fetching videos for section ${sectionId}:`, err)
      );
  };

  const fetchFiles = (sectionId: number) => {
    if (!token) return;
    fetch(`http://localhost:8072/app/files/api/files/${sectionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((files: FileResponse[]) => {
        const processedFiles = files
          .map((f) => {
            if (!f.data) {
              console.warn(`Missing URL for file ID ${f.id}, skipping...`);
              return null;
            }

            try {
              const binary = atob(f.data.replace(/\s/g, ""));
              const byteArray = Uint8Array.from(binary, (char) =>
                char.charCodeAt(0)
              );
              const blob = new Blob([byteArray], {
                type: f.contentType || "application/octet-stream",
              });
              const objectUrl = URL.createObjectURL(blob);

              return new FileResponse(
                f.id,
                f.title.replace(/[^\w.-]/g, "_"), // sanitize filename
                objectUrl,
                f.contentType
              );
            } catch (e) {
              console.error(`Error processing file ID ${f.id}:`, e);
              return null;
            }
          })
          .filter((f): f is FileResponse => f !== null);

        setFilesBySection((prev) => ({ ...prev, [sectionId]: processedFiles }));
      })
      .catch((err) =>
        console.error(`Error fetching files for section ${sectionId}:`, err)
      );
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>No course found</div>;

  return (
    <div className="course-detail">
      <div className="course-header-full">
        <div className="course-header-content">
          <div className="course-info">
            {course.tags && (
              <div
                style={{
                  fontSize: "1.1rem",
                  color: "#6366f1", // Violet
                  fontWeight: 600,
                  marginBottom: "30px", // More space before title
                  letterSpacing: "1.5px",
                }}
              >
                {course.tags}
              </div>
            )}
            <h2>{course.title}</h2>
            <br />
            <p>
              <span>Created By:</span> {course.createdBy}
            </p>
            <br />
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "white",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                stroke="white"
                strokeWidth="1"
              >
                <circle cx="8" cy="8" r="7" />
                <line
                  x1="8"
                  y1="4.5"
                  x2="8"
                  y2="8.5"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="8" cy="11" r="0.7" fill="white" />
              </svg>
              <span
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span>Last Updated: {course.updatedAt}</span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  English
                </span>
              </span>
            </p>
          </div>
          <img
            className="course-image"
            src={`data:image/jpeg;base64,${(course as any).imageData}`}
            alt={course.title}
          />
        </div>
      </div>

      <div className="course-body">
        <h3>Course Content</h3>
        <br />
        <div className="section-list">
          {sections.map((section) => {
            const isExpanded = expandedSectionIds.includes(section.id);
            const sectionVideos = videosBySection[section.id] || [];
            const sectionFiles = filesBySection[section.id] || [];

            return (
              <div key={section.id} className="section-item">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  {section.name}
                  <svg
                    className={`arrow-icon ${isExpanded ? "rotate" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isExpanded && (
                  <>
                    {/* Videos */}
                    <div className="video-list">
                      {sectionVideos.map((video) => (
                        <div key={video.id} className="video-item">
                          {playingVideoId[section.id] === video.id ? (
                            <video
                              controls
                              muted
                              autoPlay
                              style={{
                                marginTop: "10px",
                                width: "100%",
                                borderRadius: "4px",
                              }}
                              onEnded={() =>
                                handleVideoPlay(section.id, video.id)
                              }
                            >
                              <source
                                src={video.data}
                                type={video.contentType || "video/mp4"}
                              />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <span
                              onClick={() =>
                                handleVideoPlay(section.id, video.id)
                              }
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
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
                                style={{
                                  marginRight: "8px",
                                  verticalAlign: "middle",
                                }}
                              >
                                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                                <path d="M12 20v-3" />
                                <path d="M8 20h8" />
                                <polygon points="10 8 16 12 10 16 10 8" />
                              </svg>
                              {video.title}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Files */}
                    <div className="video-list" style={{ marginTop: "8px" }}>
                      {sectionFiles.map((file) => (
                        <div
                          key={file.id}
                          className="video-item"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = file.data;
                            link.download = file.title || "file";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <span>📄 {file.title.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <br />
        <h3>Description</h3>
        <div
          className={`course-description ${
            showFullDescription ? "expanded" : "collapsed"
          }`}
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
        <button
          className="toggle-button"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show Less ⬆" : "Show More ⬇"}
        </button>
        <br />
        <br />
        <h3>About Instructor</h3>
        <div
          className={`course-description ${
            showFullAbout ? "expanded" : "collapsed"
          }`}
          dangerouslySetInnerHTML={{ __html: course.aboutAuthor }}
        />
        <button
          className="toggle-button"
          onClick={() => setShowFullAbout(!showFullAbout)}
        >
          {showFullAbout ? "Show Less ⬆" : "Show More ⬇"}
        </button>
        <br />
        <br />

        {/* --- Reviews & Ratings Section --- */}
        <h3>Reviews & Ratings</h3>
        <div className="reviews-section">
          <div className="overall-rating-display">
            <div className="rating-value-display">
              {averageRating.toFixed(1)}
            </div>
            <div className="rating-summary-display">
              <StarRating rating={averageRating} />
              <span>Overall Rating</span>
            </div>
          </div>

          <div className="review-list">
            {reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="review-item-display">
                <div className="review-author-initial">
                  {review.reviewerName
                    ? review.reviewerName.charAt(0).toUpperCase()
                    : "A"}
                </div>
                <div className="review-content-display">
                  <div className="review-header-display">
                    <strong>{review.reviewerName || "Anonymous"}</strong>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="review-comment-display">{review.comment}</p>
                  <span className="review-date-display">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {reviews.length > visibleReviews && (
            <button
              className="show-more-btn"
              onClick={() => setVisibleReviews(reviews.length)}
            >
              Show More Reviews
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
