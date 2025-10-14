import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/searchCourses.css";
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

  //To fetch courses based on specific params.
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

  /**
   * Handles adding a course to the shopping cart when a user clicks the "Add to Cart" button.
   * It prevents the default link navigation, prepares course data and image for upload,
   * sends it to the backend, and updates the UI and local state on success.
   * @param e The mouse click event.
   * @param course The course object to be added to the cart.
   */
  const handleAddToCart = async (
    e: React.MouseEvent,
    course: CourseFormData
  ) => {
    // 1. Prevent the default action (e.g., navigating if the button is inside a Link)
    //    to allow this function to handle the click logic.
    e.preventDefault();

    try {
      // --- Image Conversion ---
      // Get the Base64 image string from the course object.
      const base64Image = (course as any).imageData;
      // Decode the Base64 string into a binary string.
      const byteString = atob(base64Image);
      // Create an ArrayBuffer to hold the binary data.
      const ab = new ArrayBuffer(byteString.length);
      // Create a typed array (Uint8Array) to manipulate the binary data.
      const ia = new Uint8Array(ab);
      // Loop through the binary string and set the byte values in the Uint8Array.
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      // Create a Blob (a file-like object) from the binary data with the correct image type.
      const imageBlob = new Blob([ia], { type: "image/jpeg" });

      // --- Data Preparation ---
      // Create a plain JavaScript object with the course's text data.
      const data = {
        title: course.title,
        createdBy: course.createdBy,
        rating: course.rating,
        price: course.price,
      };
      // Convert the JavaScript object into a JSON Blob.
      const jsonBlob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });

      // --- Form Data Construction ---
      // Create a FormData object to send both JSON and image data together.
      const formData = new FormData();
      // Append the JSON data as a part named "added_course".
      formData.append("added_course", jsonBlob);
      // Append the image Blob as a part named "image", with a filename.
      formData.append("image", imageBlob, "course.jpg");

      // --- API Request ---
      // Send the FormData to the backend endpoint using a POST request.
      const response = await fetch(
        "http://localhost:8072/app/carts/api/cart/add",
        {
          method: "POST",
          body: formData, // The FormData object is the body.
          headers: {
            // Include the user's authorization token.
            Authorization: `Bearer ${token}`,
            // NOTE: Do NOT set 'Content-Type'. The browser sets it automatically
            // to 'multipart/form-data' with the correct boundary for FormData.
          },
        }
      );

      // If the server responds with an error status, throw an error to be caught by the catch block.
      if (!response.ok) throw new Error("Failed to add to cart");

      // --- UI and State Update on Success ---
      // Set the state to show a "Course Added" confirmation modal.
      setAddedCourse(course);
      setShowModal(true);

      // Update the local list of cart courses.
      setCartCourses((prev) => {
        // Use a Set to easily add the new course ID, avoiding duplicates.
        const updated = new Set(prev).add(course.id!);
        // Persist the updated cart IDs to localStorage for session persistence.
        localStorage.setItem(
          "cartCourses",
          JSON.stringify(Array.from(updated))
        );
        // Dispatch a global event that other components (like the Navbar) can listen for
        // to know when to update their own state (e.g., the cart count).
        window.dispatchEvent(new Event("cart-updated"));
        return updated;
      });
    } catch (error) {
      // If any part of the try block fails, log the error and show an alert to the user.
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
                    src={`data:image/jpeg;base64,${(course as any).imageData}`}
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
