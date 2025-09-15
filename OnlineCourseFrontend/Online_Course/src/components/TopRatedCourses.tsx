import { useContext, useEffect, useState } from "react";
import { CourseFormData } from "../models/CourseFormData";
import { MyLearningData } from "../models/MyLearningData";
import "../TopRatedCourses.css";
import "../HoverCourses.css";
import { Link } from "react-router-dom";
import { AuthContext } from "react-oauth2-code-pkce";

export const TopRatedCourses = () => {
  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [myLearningCourses, setMyLearningCourses] = useState<MyLearningData[]>(
    []
  );
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [addedCourse, setAddedCourse] = useState<CourseFormData | null>(null);
  const [cartCourses, setCartCourses] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("cartCourses");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [hoveredCourseId, setHoveredCourseId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch top-rated courses
    fetch("http://localhost:8072/app/courses/api/courses/top-rated", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch courses");
        return response.json();
      })
      .then((data: CourseFormData[]) => {
        const publicCourses = data.filter(
          (course) => (course as any).public === true
        );
        setCourses(publicCourses.slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch purchased (my learning) courses
    fetch("http://localhost:8072/app/mylearning/api/mylearning/secure/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch my learning");
        return res.json();
      })
      .then((data: MyLearningData[]) => {
        setMyLearningCourses(data);
      })
      .catch((err) => {
        console.error("Error fetching my learning:", err);
      });
  }, []);

  const isCourseOwned = (courseId: number) => {
    return myLearningCourses.some((course) => course.courseId === courseId);
  };

  const handleAddToCart = async (course: CourseFormData) => {
    try {
      const base64Image = (course as any).imageData;
      const byteString = atob(base64Image);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const imageBlob = new Blob([ia], { type: "image/jpeg" });

      const data = {
        title: course.title,
        createdBy: course.createdBy,
        rating: course.rating,
        price: course.price,
        courseId: course.id,
      };
      const jsonBlob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });

      const formData = new FormData();
      formData.append("added_course", jsonBlob);
      formData.append("image", imageBlob, "course.jpg");

      const response = await fetch(
        "http://localhost:8072/app/carts/api/cart/add",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to add to cart");

      setAddedCourse(course);
      setShowModal(true);
      setCartCourses((prev) => {
        const updated = new Set(prev).add(course.id!);
        localStorage.setItem(
          "cartCourses",
          JSON.stringify(Array.from(updated))
        );
        window.dispatchEvent(new Event("cart-updated"));
        return updated;
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add course to cart");
    }
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <section className="featured-courses">
        <h2>Recommended for you based on top ratings</h2>
        <div className="course-cards">
          {courses.map((course) => (
            <Link
              to={`/student_course/${course.id}`}
              className="course-link"
              key={course.id}
              onMouseEnter={() => setHoveredCourseId(course.id!)}
              onMouseLeave={() => setHoveredCourseId(null)}
            >
              <div className="course-card-tooltip-wrapper">
                <div className="course-card">
                  <div className="course-thumbnail">
                    <img
                      src={`data:image/jpeg;base64,${
                        (course as any).imageData
                      }`}
                      alt={course.title}
                    />
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <div className="course-authors">{course.createdBy}</div>
                    <div className="course-rating">
                      {course.rating.toFixed(1)} ({course.studentsEnrolled})
                    </div>
                    <div className="course-price">₹{course.price}</div>
                  </div>
                </div>

                <div
                  className="tooltip-box"
                  onClick={(e) => e.preventDefault()}
                >
                  <strong>{course.title}</strong>
                  <p>Last updated: {course.updatedAt}</p>

                  {isCourseOwned(course.id!) ? (
                    <button
                      className="tooltip-button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/mylearning/${course.id}`;
                      }}
                    >
                      Go to Course
                    </button>
                  ) : !cartCourses.has(course.id!) ? (
                    <button
                      className="tooltip-button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(course);
                      }}
                    >
                      Add to Cart
                    </button>
                  ) : hoveredCourseId === course.id ? (
                    <button
                      className="tooltip-button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "/cart";
                      }}
                    >
                      Go to Cart
                    </button>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ✅ Modal */}
      {showModal && addedCourse && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 className="modal-heading">Added to Cart</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>

            <div className="modal-main-line">
              <div className="modal-left-content">
                <div className="modal-checkmark">✔</div>
                <img
                  src={`data:image/jpeg;base64,${
                    (addedCourse as any).imageData
                  }`}
                  alt={addedCourse.title}
                  className="modal-image"
                />
                <div className="modal-texts">
                  <h3 className="modal-title">{addedCourse.title}</h3>
                  <p className="modal-author">By: {addedCourse.createdBy}</p>
                </div>
              </div>

              <div className="modal-button-wrapper">
                <button
                  className="tooltip-button"
                  onClick={() => {
                    setShowModal(false);
                    window.location.href = "/cart";
                  }}
                >
                  Go to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
