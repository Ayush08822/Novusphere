import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUser,
  FaBookOpen,
} from "react-icons/fa";
import "../css/Navbar.css";
import type { Cart } from "../models/Cart";
import { AuthContext } from "react-oauth2-code-pkce";
import { jwtDecode } from "jwt-decode";
import type { MyLearningData } from "../models/MyLearningData";
import { StarRating } from "../Utils/StarRating";
import { AnnouncementData } from "../models/AnnouncementData";
import { formatTimeAgo } from "../Utils/FormatDate"; // Import the new function

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
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

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
    fetch("http://localhost:8072/app/mylearning/api/mylearning/getCourses", {
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

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8072/app/courses/api/announce/get-announcements", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announcements");
        return res.json();
      })
      .then((data) => {
        const announcementObjects = data.map(
          (a: any) =>
            new AnnouncementData(
              a.id,
              a.announcementTitle,
              a.announcementDescription,
              a.email,
              a.createdAt
            )
        );
        setAnnouncements(announcementObjects);
      })
      .catch((err) => console.error("Failed to fetch announcements:", err));
  }, [token]);

  const handleMarkAsRead = (announcementId: number) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== announcementId));
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">Novusphere</div>
        <div className="navbar-explore-search">
          <div className="explore-hover-wrapper">
            <span className="explore-label">Explore</span>
            <div className="navbar-popup explore-dropdown">
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
                  <Link to="/search?query=Design and Lifestyle">
                    Design and Lifestyle
                  </Link>
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

      <div className="navbar-right">
        <Link to="/instructor" className="navbar-link">
          Instructor
        </Link>
        <div
          className="bell-container navbar-icon"
          style={{ position: "relative" }}
        >
          <Link to="/mylearning" style={{ color: "inherit" }}>
            <FaBookOpen />
          </Link>
          <div className="navbar-popup my-learning-popup">
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
                        alignItems: "center",
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
                          <StarRating rating={course.rating} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <hr className="profile-divider" />
                <Link to="/mylearning" className="go-to-cart-button">
                  Go to My Learning →
                </Link>
              </>
            )}
          </div>
        </div>

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
          <div className="navbar-popup cart-popup">
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
                <hr className="profile-divider" />
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

        <div className="bell-container navbar-icon">
          <FaBell />
          {announcements.length > 0 && (
            <span className="cart-count-badge">{announcements.length}</span>
          )}
          <div className="navbar-popup bell-popup">
            <div className="popup-header">
              <h4>Notifications</h4>
            </div>
            {announcements.length > 0 ? (
              <ul className="notification-list">
                {announcements.map((ann) => (
                  <li key={ann.id} className="notification-item">
                    <div className="notification-item-header">
                      <span className="notification-email">{ann.email}</span>
                      <span className="notification-time">
                        {formatTimeAgo(ann.createdAt)}
                      </span>
                    </div>
                    <div className="notification-item-body">
                      <strong className="notification-title">
                        {ann.announcementTitle}
                      </strong>
                      <p className="notification-description">
                        {ann.announcementDescription.substring(0, 100)}
                        {ann.announcementDescription.length > 100 && "..."}
                      </p>
                    </div>
                    <div className="notification-item-footer">
                      <button
                        className="mark-as-read-btn"
                        onClick={() => handleMarkAsRead(ann.id)}
                      >
                        Mark as Read
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-notifications">You have no new notifications.</p>
            )}
          </div>
        </div>

        <div className="profile-container navbar-icon">
          <FaUser />
          <div className="navbar-popup profile-popup">
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
