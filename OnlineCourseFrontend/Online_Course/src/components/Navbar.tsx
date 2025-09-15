import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUser,
  FaBookOpen,
} from "react-icons/fa";
import "../Navbar.css";
import type { Cart } from "../models/Cart";
import { AuthContext } from "react-oauth2-code-pkce";
import { jwtDecode } from "jwt-decode";
import type { MyLearningData } from "../models/MyLearningData";

export const Navbar = () => {
  const { token, logOut } = useContext(AuthContext);
  const [cartCourses, setCartCourses] = useState<Cart[]>([]);
  const [myLearningCourses, setMyLearningCourses] = useState<MyLearningData[]>(
    []
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const decoded: any = jwtDecode(token);
    const fullName = decoded?.name || "User";
    const emailId = decoded?.email || "unknown@example.com";

    setName(fullName);
    setEmail(emailId);

    const nameParts = fullName.split(" ");
    const initials = nameParts
      .map((n: any) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    setInitials(initials);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchCart = () => {
      fetch("http://localhost:8072/app/carts/api/cart/secure/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => setCartCourses(data))
        .catch((err) => console.error("Failed to fetch cart courses:", err));
    };

    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () => {
      window.removeEventListener("cart-updated", fetchCart);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8072/app/mylearning/api/mylearning/secure/get", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setMyLearningCourses(data))
      .catch((err) =>
        console.error("Failed to fetch My Learning courses:", err)
      );
  }, [token]);

  return (
    <nav className="navbar">
      {/* Left Side */}
      <div className="navbar-left">
        <div className="navbar-logo">Novusphere</div>

        <div className="navbar-explore-search">
          <div className="explore-hover-wrapper">
            <span className="explore-label">Explore</span>
            <div className="explore-dropdown">
              <h4 className="explore-heading">Explore by Goal</h4>
              <ul>
                <li>
                  <Link to="/search?query=Development">Web Development</Link>
                </li>
                <li>
                  <Link to="/search?query=Personal Development">
                    Personal Development
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Business">Business</Link>
                </li>
                <li>
                  <Link to="/search?query=Business">Design and Lifestyle</Link>
                </li>
                <li>
                  <Link to="/search?query=Health & Wellness">
                    Health & Wellness
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Photography">Photography</Link>
                </li>
                <li>
                  <Link to="/search?query=Finance & Investment">
                    Finance & Investment
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Programming Languages">
                    Programming Languages
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Artificial Intelligence">
                    Artificial Intelligence
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Cloud Computing">
                    Cloud Computing
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Public Speaking">
                    Public Speaking
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Time Management">
                    Time Management
                  </Link>
                </li>
                <li>
                  <Link to="/search?query=Career Growth">Career Growth</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="navbar-search"
              placeholder="Search courses, topics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="tooltip-wrapper">
              <FaSearch
                className={`search-icon ${
                  !searchInput.trim() ? "disabled" : ""
                }`}
                onClick={() => {
                  if (searchInput.trim()) {
                    navigate(
                      `/search?query=${encodeURIComponent(searchInput.trim())}`
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <Link to="/instructor" className="navbar-link">
          Instructor
        </Link>

        <div
          className="bell-container navbar-icon"
          style={{ position: "relative" }}
        >
          {/* Clicking the icon will take user to /mylearning */}
          <Link to="/mylearning" style={{ color: "inherit" }}>
            <FaBookOpen />
          </Link>

          <div className="bell-popup">
            {myLearningCourses.length === 0 ? (
              <p>No courses found.</p>
            ) : (
              <>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginBottom: "12px",
                  }}
                >
                  {myLearningCourses.map((course, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        marginBottom: "12px",
                        gap: "14px",
                        alignItems: "flex-start",
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${
                          (course as any).imageData
                        }`}
                        alt={course.title}
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong className="cart-item-title">
                          {course.title}
                        </strong>
                        <div className="cart-item-meta">{course.createdBy}</div>
                        <div className="cart-item-price">
                          ⭐ {course.rating}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <hr className="cart-divider" />
                <Link to="/mylearning" className="go-to-cart-button">
                  Go to My Learning →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Cart */}
        <div
          className="bell-container navbar-icon"
          style={{ position: "relative" }}
        >
          <Link to="/cart" style={{ color: "inherit" }}>
            <FaShoppingCart />
            {cartCourses.length > 0 && (
              <span className="cart-count-badge">{cartCourses.length}</span>
            )}
          </Link>
          <div className="bell-popup">
            {cartCourses.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              <>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginBottom: "12px",
                  }}
                >
                  {cartCourses.map((course, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        marginBottom: "12px",
                        gap: "14px",
                        alignItems: "flex-start",
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${
                          (course as any).imageData
                        }`}
                        alt={course.title}
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong className="cart-item-title">
                          {course.title}
                        </strong>
                        <div className="cart-item-meta">{course.createdBy}</div>
                        <div className="cart-item-price">₹{course.price}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <hr className="cart-divider" />
                <div className="cart-total">
                  Total: ₹
                  {cartCourses.reduce(
                    (total, course) => total + course.price,
                    0
                  )}
                </div>
                <Link to="/cart" className="go-to-cart-button">
                  Go to Cart →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bell-container navbar-icon">
          <FaBell />
          <div className="bell-popup">
            <h4>Notifications</h4>
            <p>You have 3 new notifications.</p>
            <ul>
              <li>Course "React Basics" updated.</li>
              <li>New message from instructor.</li>
              <li>Your course "Spring Boot" is now public.</li>
            </ul>
          </div>
        </div>

        {/* Profile */}
        <div className="profile-container navbar-icon">
          <FaUser />
          <div className="profile-popup">
            <div className="profile-info">
              <div className="profile-initials">{initials}</div>
              <div className="profile-details">
                <div className="profile-name">{name}</div>
                <div className="profile-email">{email}</div>
              </div>
            </div>
            <hr className="profile-divider" />
            <ul className="profile-menu">
              <li>
                <Link to="/mylearning">My Learning</Link>
              </li>
              <li>
                <Link to="/cart">My Cart</Link>
              </li>
              <li>
                <Link to="/instructor">Instructor Dashboard</Link>
              </li>
              <li>
                <Link to="/messages">Messages</Link>
              </li>
            </ul>
            <hr className="profile-divider" />
            <ul className="profile-menu">
              <li>
                <Link to="/support">Help & Support</Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    logOut(undefined, undefined, {
                      redirect_uri: window.location.origin,
                    });
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
