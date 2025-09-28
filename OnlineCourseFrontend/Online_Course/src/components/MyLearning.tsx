import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "react-oauth2-code-pkce";

// Import Child Components
import { Announcements } from "./CourseAnnouncements";
import { Reviews } from "./CourseReviews";

// Import CSS and any shared utilities
import "../css/MyLearning.css";
// Define local interfaces needed for state and data fetching
interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}
interface AnnouncementData {
  id: number;
  announcementTitle: string;
  announcementDescription: string;
  email: string;
  createdAt: string;
}
interface VideoResponse {
  id: number;
  title: string;
  data: string;
  type: string;
}
interface FileResponse {
  id: number;
  title: string;
  data: string;
  contentType: string;
}
interface SectionData {
  id: number;
  name: string;
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

// This helper function is used to create playable video URLs from base64 data
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
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchSections = async () => {
      try {
        const sectionResponse = await fetch(
          `http://localhost:8072/app/courses/api/sections/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
              videos: videoResponse.map((v: any) => ({
                id: v.id,
                title: v.title,
                data: base64ToUrl(v.data, v.type),
                type: v.type,
              })),
              files: fileResponse.map((f: any) => ({
                id: f.id,
                title: f.title,
                data: base64ToUrl(f.data, f.contentType),
                contentType: f.contentType,
              })),
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const fetchAnnouncements = useCallback(async () => {
    if (!courseId || !token) return;
    setAnnouncementsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8072/app/courses/api/announce/get-announcements/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "announcements") fetchAnnouncements();
  }, [activeTab, fetchReviews, fetchAnnouncements]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0 || !newReviewText) {
      alert("Please provide a rating and a comment.");
      return;
    }
    try {
      await fetch(
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
      setShowReviewForm(false);
      setNewReviewRating(0);
      setNewReviewText("");
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
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
                      {section.videos.map((video) => (
                        <li
                          key={video.id}
                          className="video-item"
                          onClick={() => setSelectedVideo(video.data)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="video-logo"
                          >
                            <polygon points="10 8 16 12 10 16 10 8" />
                            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                          </svg>
                          <span className="video-title">{video.title}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="file-list">
                      {section.files.map((file) => (
                        <li key={file.id} className="file-item">
                          📄{" "}
                          <a href={file.data} download={file.title}>
                            {file.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "announcements" && (
          <Announcements
            announcements={announcements}
            announcementsLoading={announcementsLoading}
          />
        )}

        {activeTab === "reviews" && (
          <Reviews
            reviewsLoading={reviewsLoading}
            averageRating={averageRating}
            hasUserReviewed={hasUserReviewed}
            reviews={reviews}
            showReviewForm={showReviewForm}
            setShowReviewForm={setShowReviewForm}
            handleReviewSubmit={handleReviewSubmit}
            newReviewRating={newReviewRating}
            setNewReviewRating={setNewReviewRating}
            newReviewText={newReviewText}
            setNewReviewText={setNewReviewText}
            ratingOptions={ratingOptions}
          />
        )}
      </div>
    </div>
  );
};
