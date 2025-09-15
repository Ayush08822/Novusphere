import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CourseForm } from "./components/CourseForm";
import { MyCourses } from "./components/MyCourses";
import { Navbar } from "./components/Navbar";
import { CourseDetails } from "./components/CourseDetails";
import { HomePage } from "./components/HomePage";
import { StudentCourseDetail } from "./components/StudentCourseDetail";
import { CartItems } from "./components/CartItems";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SearchCourses } from "./components/SearchCourses";
import { CheckoutPage } from "./components/CheckoutPage";
import { SuccessPage } from "./components/SuccessPage";
import { MyLearningPage } from "./components/MyLearningPage";
import { MyLearning } from "./components/MyLearning";

function App() {
  return (
    <Router>
      <ProtectedRoute>
        <Navbar />
      </ProtectedRoute>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <CourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mylearning"
          element={
            <ProtectedRoute>
              <MyLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mylearning/:courseId"
          element={
            <ProtectedRoute>
              <MyLearning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mycourses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student_course/:id"
          element={
            <ProtectedRoute>
              <StudentCourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartItems />
            </ProtectedRoute>
          }
        />
         <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        /><Route path="/success" element={<ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
