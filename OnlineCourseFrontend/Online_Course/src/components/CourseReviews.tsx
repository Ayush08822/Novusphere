import React from "react";
import { StarRating } from "../Utils/StarRating"; // Adjust path as needed

// --- INTERFACE DEFINITION ---
// Define the interface directly in the file that uses it.
export interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}

interface ReviewsProps {
  reviewsLoading: boolean;
  averageRating: number;
  hasUserReviewed: boolean;
  reviews: ReviewData[];
  showReviewForm: boolean;
  setShowReviewForm: (show: boolean) => void;
  handleReviewSubmit: (e: React.FormEvent) => void;
  newReviewRating: number;
  setNewReviewRating: (rating: number) => void;
  newReviewText: string;
  setNewReviewText: (text: string) => void;
  ratingOptions: number[];
}

export const Reviews: React.FC<ReviewsProps> = ({
  reviewsLoading,
  averageRating,
  hasUserReviewed,
  reviews,
  showReviewForm,
  setShowReviewForm,
  handleReviewSubmit,
  newReviewRating,
  setNewReviewRating,
  newReviewText,
  setNewReviewText,
  ratingOptions,
}) => {
  if (reviewsLoading) {
    return (
      <div className="spinner-container-small">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h2>Student Feedback</h2>
      <div className="overall-rating">
        <div className="rating-value">{averageRating.toFixed(1)}</div>
        <div className="rating-summary">
          <StarRating rating={averageRating} />
          <span>Course Rating</span>
        </div>
      </div>

      {hasUserReviewed ? (
        <div className="user-reviewed-message">
          <p>✓ You've already reviewed this course. Thank you!</p>
        </div>
      ) : (
        <>
          <div className="review-actions">
            <button
              className="leave-review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? "Cancel" : "Leave a Review"}
            </button>
          </div>

          {showReviewForm && (
            <div className="review-form">
              <form onSubmit={handleReviewSubmit}>
                <h4>Your Review</h4>
                <div className="form-group rating-input">
                  <label>Rating:</label>
                  <div className="rating-selection">
                    <select
                      value={newReviewRating}
                      onChange={(e) =>
                        setNewReviewRating(Number(e.target.value))
                      }
                    >
                      <option value="0" disabled>
                        Select a rating
                      </option>
                      {ratingOptions.map((rating) => (
                        <option key={rating} value={rating}>
                          {rating.toFixed(1)} Stars
                        </option>
                      ))}
                    </select>
                    <StarRating rating={newReviewRating} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="review-text">Comment:</label>
                  <textarea
                    id="review-text"
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Tell us about your personal experience with this course."
                  />
                </div>
                <button type="submit" className="submit-review-btn">
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </>
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-author">
                {review.reviewerName
                  ? review.reviewerName.charAt(0).toUpperCase()
                  : "A"}
              </div>
              <div className="review-content">
                <div className="review-header">
                  <strong>{review.reviewerName || "Anonymous"}</strong>
                  <span>{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <StarRating rating={review.rating} />
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Be the first to review this course!</p>
        )}
      </div>
    </div>
  );
};
