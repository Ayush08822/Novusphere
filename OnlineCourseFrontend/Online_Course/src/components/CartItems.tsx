import { useContext, useEffect, useState } from "react";
import { Cart } from "../models/Cart";
import "../Cart.css";
import { AuthContext } from "react-oauth2-code-pkce";
import { useNavigate } from "react-router-dom";

export const CartItems = () => {
  const [cartCourses, setCartCourses] = useState<Cart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useContext(AuthContext);

  const navigate = useNavigate();
  const totalCartPrice = cartCourses.reduce(
    (total, course) => total + course.price,
    0
  );
  console.log(totalCartPrice)
  const fetchCart = () => {
    setLoading(true);
    fetch("http://localhost:8072/app/carts/api/cart/secure/getAll", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCartCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeFromCart = async (cartId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8072/app/carts/api/cart/remove/${cartId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to remove course");

      const updatedCourses = cartCourses.filter((cart) => cart.id !== cartId);
      setCartCourses(updatedCourses);

      localStorage.setItem(
        "cartCourses",
        JSON.stringify(Array.from(updatedCourses.map((c) => c.id)))
      );
      fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Remove failed:", error);
      alert("Failed to remove course.");
    }
  };

  const totalPrice = cartCourses.reduce(
    (total, course) => total + course.price,
    0
  );

  return (
    <div className="cart-container">
      <h1 className="cart-heading">🛒 Shopping Cart</h1>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <p className="cart-subtext">
            <strong>{cartCourses.length}</strong>{" "}
            {cartCourses.length === 1 ? "course" : "courses"} in your cart
          </p>

          {cartCourses.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="cart-content">
              <ul className="cart-list">
                {cartCourses.map((cart) => (
                  <li key={cart.id} className="cart-item">
                    <img
                      src={`data:image/jpeg;base64,${(cart as any).imageData}`}
                      alt={cart.title}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{cart.title}</h3>
                      <p className="cart-author">By: {cart.createdBy}</p>
                      <p className="cart-rating">Rating: {cart.rating}</p>
                    </div>
                    <div className="cart-item-action">
                      <button
                        onClick={() => removeFromCart(cart.id!)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                      <div className="cart-item-price">₹{cart.price}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-summary">
                <div className="cart-total-label">Total</div>
                <div className="cart-total-price">₹{totalPrice}</div>
                <button
                  className="checkout-btn"
                  onClick={() => navigate(`/checkout?price=${totalCartPrice}`)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
