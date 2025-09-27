import React from 'react';
import '../css/StarRating.css'; // Import the dedicated CSS for this component

// This component uses SVGs for perfect display
export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const totalStars = 5;

  const stars = Array.from({ length: totalStars }, (_, index) => {
    const starValue = index + 1;
    if (rating >= starValue) {
      // Full Star SVG
      return (
        <svg key={index} width="20" height="20" viewBox="0 0 24 24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
        </svg>
      );
    }
    if (rating >= starValue - 0.5) {
      // Half Star SVG
      return (
        <svg key={index} width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half_grad">
              <stop offset="50%" stopColor="#ffc107"/>
              <stop offset="50%" stopColor="#e0e0e0"/>
            </linearGradient>
          </defs>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="url(#half_grad)"/>
        </svg>
      );
    }
    // Empty Star SVG
    return (
      <svg key={index} width="20" height="20" viewBox="0 0 24 24" fill="#e0e0e0" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
      </svg>
    );
  });

  return <div className="star-rating">{stars}</div>;
};