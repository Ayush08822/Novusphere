import { useContext, useEffect, useState } from "react";
import "../MyCourses.css";
import type { CourseFormData } from "../models/CourseFormData";
import { Link } from "react-router-dom";
import { AuthContext } from "react-oauth2-code-pkce";

export const MyCourses = () => {
  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { token } = useContext(AuthContext);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:8072/app/courses/api/courses/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  const handlePublicClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowModal(true);
  };

  const confirmMakePublic = () => {
    if (selectedCourseId === null) return;

    fetch(
      `http://localhost:8072/app/courses/api/courses/public/${selectedCourseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(true),
      }
    )
      .then((res) => {
        if (res.ok) {
          setCourses((prev) =>
            prev.map((course) =>
              course.id === selectedCourseId
                ? { ...course, isPublic: true }
                : course
            )
          );
        } else {
          alert("Failed to update course status.");
        }
      })
      .catch((err) => console.error("Failed to mark course as public:", err))
      .finally(() => {
        setShowModal(false);
        setSelectedCourseId(null);
      });
  };

  return (
    <div className="my-courses-container">
      <h2>My Uploaded Courses</h2>
      <div className="course-grid">
        {courses.map((course) => (
          <div key={course.id} className="grid-item">
            <Link to={`/course/${course.id}`} className="course-link">
              <div className="course-card">
                <img
                  src={`data:image/jpeg;base64,${(course as any).imageData}`}
                  alt={course.title}
                  className="course-image"
                />
                <h3>{course.title}</h3>

                <div className="info-row">
                  <p>
                    <strong>Rating:</strong> {course.rating}
                  </p>
                  <p className="right">
                    <strong>Students:</strong> {course.studentsEnrolled}
                  </p>
                </div>

                <div className="info-row">
                  <p className="bold-black">
                    <strong>${course.price}</strong>
                  </p>
                  <p className="right small-muted">
                    Last Updated: <em>{course.updatedAt}</em>
                  </p>
                </div>
              </div>
            </Link>

            <div className="card-actions">
              <button
                className="public-btn"
                onClick={() => handlePublicClick(course.id)}
                disabled={course.public}
              >
                {course.public ? "Public" : "Make Public"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-box">
            <div className="modal-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  fill="#e0f2fe"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="8"
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="10"
                  x2="12"
                  y2="16"
                  stroke="#0284c7"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h2 className="modal-title">Make Course Public?</h2>
            <p className="modal-text">
              Once public, this course will be visible to all users. Are you
              sure you want to continue?
            </p>
            <div className="modal-btns">
              <button className="btn-confirm" onClick={confirmMakePublic}>
                Yes, Make Public
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCourseId(null);
                }}
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
