import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../searchCourses.css";
import type { CourseFormData } from "../models/CourseFormData";
import { AuthContext } from "react-oauth2-code-pkce";

export const SearchCourses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [addedCourse, setAddedCourse] = useState<CourseFormData | null>(null);
  const [cartCourses, setCartCourses] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("cartCourses");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("query");
    if (query) {
      setSearchTerm(query);
      setLoading(true);

      fetch(
        `http://localhost:8072/app/courses/api/courses/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const publicCourses = data.filter(
            (course: CourseFormData) => course.public
          );
          setCourses(publicCourses);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setLoading(false);
        });
    }
  }, [location.search, token]);

  const handleAddToCart = async (
    e: React.MouseEvent,
    course: CourseFormData
  ) => {
    e.preventDefault(); // prevent Link navigation
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

  return (
    <>
      <div className="search-wrapper">
        <h2 className="search-heading">Results for "{searchTerm}"</h2>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : courses.length === 0 ? (
          <p className="search-no-results">No courses found.</p>
        ) : (
          <div className="search-grid">
            {courses.map((course) => (
              <Link
                to={`/student_course/${course.id}`}
                key={course.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="search-course-card">
                  <img
                    src={`data:image/jpeg;base64,${
                      (course as any).imageData
                    }`}
                    alt={course.title}
                    className="course-img"
                  />
                  <h3>{course.title}</h3>
                  <p>{course.createdBy}</p>
                  <div className="price-cart-row">
                    <p>
                      <strong style={{ fontSize: "1.1rem" }}>
                        ₹{course.price}
                      </strong>
                    </p>
                    {cartCourses.has(course.id!) ? (
                      <button
                        className="add-cart-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/cart");
                        }}
                      >
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        className="add-cart-btn"
                        onClick={(e) => handleAddToCart(e, course)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
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
