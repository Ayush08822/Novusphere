import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import "../SucessPage.css";

export const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const { token } = useContext(AuthContext);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const verifyAndComplete = async () => {
      try {
        // 1. Verify Stripe payment
        const res = await fetch(
          `http://localhost:8072/app/payments/api/payment/verify?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (data.status === "paid") {
          setValid(true);

          // 2. Store course data in My Learning Service
          await fetch(
            "http://localhost:8072/app/mylearning/api/mylearning/secure/add",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // 3. Remove cart from localStorage
          localStorage.removeItem("cartCourses");

          // 4. Clear backend cart
          await fetch("http://localhost:8072/app/carts/api/cart/deleteAll", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Verification failed", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyAndComplete();
  }, [sessionId]);

  if (loading)
    return <div style={{ textAlign: "center" }}>Verifying payment...</div>;

  if (!valid) return null;

  return (
    <div className="success-container">
      <div className="success-icon-circle">
        <span className="success-icon">✓</span>
      </div>
      <h1 className="success-heading">Payment Successful!</h1>
      <p className="success-message">
        Thank you for your purchase. Your learning journey continues!
      </p>
      <button className="success-button" onClick={() => navigate("/")}>
        Back to Learning
      </button>
    </div>
  );
};
