import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyLearningData } from "../models/MyLearningData";
import { AuthContext } from "react-oauth2-code-pkce";
import "../spinner.css";
import "../css/MyLearningPage.css";

export const MyLearningPage = () => {
  const [courses, setCourses] = useState<MyLearningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8072/app/mylearning/api/mylearning/secure/get", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data: MyLearningData[] = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="mylearning-error">Error: {error}</div>;
  }
  console.log(courses);
  return (
    <div className="mylearning-container">
      <h1 className="mylearning-title">My Learning</h1>
      {courses.length === 0 ? (
        <p className="mylearning-empty">You haven't bought any courses yet.</p>
      ) : (
        <div className="mylearning-grid">
          {courses.map((course) => (
            <Link
              to={`/mylearning/${course.courseId}`}
              key={course.id}
              className="mylearning-card"
            >
              <img
                src={`data:image/jpeg;base64,${(course as any).imageData}`}
                alt={course.title}
                className="mylearning-image"
              />
              <h3 className="mylearning-title-text">{course.title}</h3>
              <p className="mylearning-createdby">By {course.createdBy}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
