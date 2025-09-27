import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../CourseDetails.css";
import { CreateSection } from "./CreateSection";
import type { CourseFormData } from "../models/CourseFormData";
import { AuthContext } from "react-oauth2-code-pkce";

export const CourseDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [course, setCourse] = useState<CourseFormData>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  useEffect(() => {
    if (!token || !id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCourse = async () => {
      try {
        const response = await fetch(
          `http://localhost:8072/app/courses/api/courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch course details. Please try again later."
          );
        }

        const data = await response.json();

        if (isMounted) {
          setCourse(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  const handleAnnouncementSubmit = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert("Please fill out both the title and content for the announcement.");
      return;
    }

    const payload = {
      announcementTitle: announcementTitle,
      announcementDescription: announcementContent,
    };

    try {
      const response = await fetch(
        `http://localhost:8072/app/courses/api/announce/post-announcements/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Announcement posted successfully!");
        setAnnouncementTitle("");
        setAnnouncementContent("");
        setIsAnnouncementModalOpen(false);
      } else {
        throw new Error("Failed to post announcement.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while posting the announcement.");
    }
  };

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!course) {
    return <div className="error-container">Course not found.</div>;
  }

  return (
    <div className="course-details-container">
      <div className="course-header">
        <img
          src={`data:image/jpeg;base64,${(course as any).imageData}`}
          alt={course.title}
          className="course-detail-image"
        />
        <div className="course-meta">
          {course.tags && (
            <div
              style={{
                fontSize: "1.1rem",
                color: "#6366f1",
                fontWeight: 600,
                marginBottom: "10px",
                letterSpacing: "2.5px",
              }}
            >
              {course.tags}
            </div>
          )}

          <h2>{course.title}</h2>
          <div className="meta-item">
            <strong>Rating:</strong> {course.rating}
          </div>
          <div className="meta-item">
            <strong>Students Enrolled:</strong> {course.studentsEnrolled}
          </div>
          <div className="meta-item">
            <strong>Created By:</strong> {course.createdBy}
          </div>
          <div className="meta-item">
            <strong>Price:</strong> ${course.price}
          </div>

          <button
            className="announcement-btn"
            onClick={() => setIsAnnouncementModalOpen(true)}
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
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Make an Announcement
          </button>
        </div>
      </div>

      <div className="course-description">
        <h3>Description</h3>
        <p dangerouslySetInnerHTML={{ __html: course.description }} />
        <h3>About the Author</h3>
        <p dangerouslySetInnerHTML={{ __html: course.aboutAuthor }} />
      </div>
      <CreateSection courseId={id} />

      {isAnnouncementModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Announcement</h2>
            <input
              type="text"
              placeholder="Announcement Title"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="modal-input"
            />
            <textarea
              placeholder="Announcement Content..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              className="modal-textarea"
              rows={8}
            />
            <div className="modal-buttons">
              <button className="create-btn" onClick={handleAnnouncementSubmit}>
                Announce
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsAnnouncementModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
