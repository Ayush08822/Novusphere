// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { TopRatedCourses } from "../components/TopRatedCourses";
import "../HomePage.css";

export const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero">
          <div className="hero-box">
            <h1>Learn. Build. Grow.</h1>
            <p>
              Join thousands of learners worldwide mastering new skills with
              CourseHub.
            </p>
            <Link to="/explore" className="btn-primary">
              Explore Courses
            </Link>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
              alt="Online Learning"
            />
          </div>
        </div>
      </section>
      <TopRatedCourses />
      {/* Main Content */}
      <main className="home-container">
        {/* Top Rated Courses */}

        {/* Benefits Section */}
        <section className="benefits">
          <h2>Why Choose CourseHub?</h2>
          <div className="benefits-list">
            <div className="benefit">
              <span className="emoji">🎓</span>
              <h3>Expert Instructors</h3>
              <p>Learn from industry experts with real-world experience.</p>
            </div>
            <div className="benefit">
              <span className="emoji">⏰</span>
              <h3>Flexible Learning</h3>
              <p>Access courses anytime, anywhere on any device.</p>
            </div>
            <div className="benefit">
              <span className="emoji">📈</span>
              <h3>Career Growth</h3>
              <p>Build skills that help you get ahead and grow your career.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
