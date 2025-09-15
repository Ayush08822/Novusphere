import { useContext, useEffect, useState } from "react";
import "../CheckoutPage.css";
import { Cart } from "../models/Cart";
import { AuthContext } from "react-oauth2-code-pkce";

// Util: Convert base64 image if stored as File object
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

// Payment Form
const CreditCardForm = ({ cartCourses }: { cartCourses: Cart[] }) => {
  const { token } = useContext(AuthContext);
  const [selectedPayment, setSelectedPayment] = useState("credit");

  const convertCartToDTO = async () => {
    const promises = cartCourses.map(async (c) => {
      let imageBase64: string | null = null;
      if (c.image instanceof File) {
        imageBase64 = await fileToBase64(c.image);
      } else if (typeof c.image === "string") {
        imageBase64 = c.image;
      }

      return {
        title: c.title,
        price: c.price * 100,
        quantity: 1,
        createdBy: c.createdBy,
        rating: c.rating,
        imageData: imageBase64,
      };
    });
    return Promise.all(promises);
  };

  const handlePayment = async () => {
    const cartDto = await convertCartToDTO();
    console.log(cartDto);

    const res = await fetch(
      "http://localhost:8072/app/payments/api/payment/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartDto),
      }
    );

    const result = await res.json();
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else {
      alert("Payment failed.");
    }
  };

  return (
    <>
      <div className="payment-methods">
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="credit"
            checked={selectedPayment === "credit"}
            onChange={() => setSelectedPayment("credit")}
          />
          <span>Credit/Debit Card</span>
        </label>
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="upi"
            checked={selectedPayment === "upi"}
            onChange={() => setSelectedPayment("upi")}
          />
          <span>UPI</span>
        </label>
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="wallet"
            checked={selectedPayment === "wallet"}
            onChange={() => setSelectedPayment("wallet")}
          />
          <span>Wallets</span>
        </label>
      </div>

      {selectedPayment === "credit" && (
        <div
          style={{
            marginTop: "16px",
            border: "1px solid #ccc",
            padding: "14px",
            borderRadius: "6px",
          }}
        >
          <button
            type="button"
            className="place-order-btn"
            onClick={handlePayment}
            style={{ marginTop: "16px" }}
          >
            Pay with Card
          </button>
        </div>
      )}
    </>
  );
};

// Checkout Page
export const CheckoutPage = () => {
  const { token } = useContext(AuthContext);
  const [cartCourses, setCartCourses] = useState<Cart[]>([]);

  useEffect(() => {
    fetch("http://localhost:8072/app/carts/api/cart/secure/getAll", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const carts = data.map(
          (item: any) =>
            new Cart(
              item.id,
              item.title,
              item.price,
              item.createdBy,
              item.rating,
              item.imageData
            )
        );
        setCartCourses(carts);
      });
  }, []);

  const totalPrice = cartCourses.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="checkout-container">
      {/* LEFT SIDE */}
      <div className="checkout-left">
        <form className="billing-form">
          <h3>Payment Method</h3>
          <CreditCardForm cartCourses={cartCourses} />

          <h3 style={{ marginTop: "20px" }}>Order Details</h3>
          <ul className="order-details-list">
            {cartCourses.map((item) => (
              <li key={item.id} className="order-detail-item">
                <img
                  src={
                    typeof item.image === "string"
                      ? `data:image/jpeg;base64,${item.image}`
                      : ""
                  }
                  alt={item.title}
                  className="order-detail-image"
                />
                <div className="order-detail-info">
                  <div className="title-price-row">
                    <div className="order-title">{item.title}</div>
                    <div className="order-price">
                      <strong>₹{item.price}</strong>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </form>
      </div>

      {/* RIGHT SIDE */}
      <div className="checkout-right">
        <h2>Order Summary</h2>
        <div className="summary-info">
          <p>
            Total Courses: <strong>{cartCourses.length}</strong>
          </p>
          <p>
            Total Price: <strong>₹{totalPrice}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
