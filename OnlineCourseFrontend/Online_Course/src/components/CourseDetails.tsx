import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../CourseDetails.css";
import { CreateSection } from "./CreateSection";
import type { CourseFormData } from "../models/CourseFormData";
import { AuthContext } from "react-oauth2-code-pkce";

export const CourseDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [course, setCourse] = useState<CourseFormData>();

  useEffect(() => {
    fetch(`http://localhost:8072/app/courses/api/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourse(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!course) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
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
          {/* ✅ Tag with dark purple text only */}
          {course.tags && (
            <div
              style={{
                fontSize: "1.1rem",
                color: "#6366f1", // Violet
                fontWeight: 600,
                marginBottom: "10px", // More space before title
                letterSpacing: "2.5px", // Slight space between letters
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
        </div>
      </div>

      <div className="course-description">
        <h3>Description</h3>
        <p dangerouslySetInnerHTML={{ __html: course.description }} />
        <h3>About the Author</h3>
        <p dangerouslySetInnerHTML={{ __html: course.aboutAuthor }} />
      </div>
      <CreateSection courseId={id} />
    </div>
  );
};
