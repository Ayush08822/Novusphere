import { useContext, useEffect, useState } from "react";
import "../css/CheckoutPage.css";
import { Cart } from "../models/Cart";
import { AuthContext } from "react-oauth2-code-pkce";

/**
 * Converts a File object (from an input field) into a Base64 data URL string.
 * This is an asynchronous operation, so it returns a Promise.
 * @param file The File object to convert.
 * @returns A Promise that resolves with the Base64 data URL string.
 */
const fileToBase64 = (file: File): Promise<string> =>
  // 1. Create a new Promise to handle the asynchronous file reading operation.
  new Promise((resolve, reject) => {
    // 2. Instantiate a FileReader, the browser's tool for reading local files.
    const reader = new FileReader();

    // 3. Start reading the file. This specific method converts the file into a Base64 data URL.
    reader.readAsDataURL(file);

    // 4. Set up an event handler for when the file reading is successfully completed.
    reader.onload = () => {
      // The result of the read is a string. Resolve the promise with this string.
      resolve(reader.result as string);
    };

    // 5. Set up an event handler for any errors that occur during the reading process.
    reader.onerror = (error) => {
      // If an error happens, reject the promise, passing the error along.
      reject(error);
    };
  });

// Payment Form
const CreditCardForm = ({ cartCourses }: { cartCourses: Cart[] }) => {
  const { token } = useContext(AuthContext);
  const [selectedPayment, setSelectedPayment] = useState("credit");

  /**
   * Converts the local `cartCourses` state into a format suitable for the backend payment API.
   * It handles the asynchronous conversion of any File objects (images) to Base64 strings.
   * @returns {Promise<object[]>} A promise that resolves to an array of cart item DTOs.
   */
  const convertCartToDTO = async () => {
    // Use `map` to create an array of promises, one for each course in the cart.
    const promises = cartCourses.map(async (c) => {
      let imageBase64: string | null = null;

      // Check if the image is a File object (needs conversion).
      if (c.image instanceof File) {
        // Asynchronously convert the file to a Base64 string.
        imageBase64 = await fileToBase64(c.image);
      } else if (typeof c.image === "string") {
        // If it's already a string (e.g., from a previously fetched course), use it directly.
        imageBase64 = c.image;
      }

      // Return the formatted Data Transfer Object (DTO) for this cart item.
      return {
        title: c.title,
        // Convert price to the smallest currency unit (e.g., cents/paise) to avoid floating-point issues.
        price: c.price * 100,
        quantity: 1,
        createdBy: c.createdBy,
        rating: c.rating,
        imageData: imageBase64,
      };
    });

    // Wait for all the promises (especially file conversions) to complete before returning the final array.
    return Promise.all(promises);
  };

  /**
   * Handles the entire payment process. It prepares the cart data, sends it to the backend
   * to create a checkout session, and redirects the user to the payment provider's URL.
   */
  const handlePayment = async () => {
    // 1. Prepare the cart data for the backend.
    const cartDto = await convertCartToDTO();

    // 2. Send the prepared cart data to the backend endpoint.
    const res = await fetch(
      "http://localhost:8072/app/payments/api/payment/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the user's authentication token for authorization.
          Authorization: `Bearer ${token}`,
        },
        // Convert the JavaScript array of objects into a JSON string.
        body: JSON.stringify(cartDto),
      }
    );

    // 3. Parse the JSON response from the backend.
    const result = await res.json();

    // 4. Check if the backend successfully created a session and returned a checkout URL.
    if (result.checkoutUrl) {
      // If successful, redirect the user's browser to the payment page (e.g., Stripe, Razorpay).
      window.location.href = result.checkoutUrl;
    } else {
      // If the backend failed to create a session, notify the user.
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
