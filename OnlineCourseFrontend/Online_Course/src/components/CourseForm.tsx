import React, { useContext, useState } from "react";
import "../css/CourseForm.css";
import DescriptionEditor from "../models/DescriptionEditor";
import { AuthContext } from "react-oauth2-code-pkce";

export const CourseForm = () => {
  const [formData, setFormData] = useState({
    tags: "",
    title: "",
    description: "",
    aboutAuthor: "",
    price: 0,
    createdBy: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /**
   * Handles changes for standard text inputs and textareas.
   * @param e The change event from the input or textarea element.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Update the form's state object.
    setFormData({
      // 1. Use the spread syntax (...) to create a copy of all existing form data.
      // This ensures that you don't lose the values of other fields when updating one.
      ...formData,

      // 2. Use a computed property name `[e.target.name]` to dynamically set the key.
      // For an input like `<input name="title" ...>`, this becomes `title: "new value"`.
      // This allows one function to handle multiple input fields.
      [e.target.name]: e.target.value,
    });
  };
  /**
   * Handles the selection of a file from an <input type="file"> element.
   * It stores the file for submission and creates a temporary URL for previewing the image.
   * @param e The change event from the file input element.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Check if the user has selected any files.
    if (e.target.files && e.target.files[0]) {
      // 2. Get the first selected file from the FileList.
      const file = e.target.files[0];

      // 3. Store the actual File object in state, ready for upload.
      setImage(file);

      // 4. Create a FileReader to read the file's contents for a preview.
      const reader = new FileReader();

      // 5. Set up an event listener that will run after the file has been read.
      reader.onloadend = () => {
        // The `reader.result` contains the file as a Base64 data URL string.
        // Set this string in state to be used as the `src` for an <img> tag.
        setImagePreview(reader.result as string);
      };

      // 6. Start the asynchronous file reading process.
      reader.readAsDataURL(file);
    }
  };
  /**
   * Handles the form submission event.
   * It bundles text and file data into a FormData object and sends it to the backend.
   * @param e The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // 1. Prevent the default browser action of reloading the page on form submission.
    e.preventDefault();

    // 2. Create a new FormData object. This is the standard way to send files and text together.
    const form = new FormData();

    // 3. Append the text data. The `formData` state object is converted to a JSON string.
    // The backend will need to parse this string to get the course data.
    form.append("course", JSON.stringify(formData));

    // 4. If an image file is present in the state, append it to the FormData object.
    if (image) {
      form.append("image", image);
    }

    try {
      // 5. Send the FormData to the backend using a POST request.
      // Note: Do NOT set the 'Content-Type' header yourself. The browser will automatically
      // set it to 'multipart/form-data' with the correct boundary when using FormData.
      const res = await fetch(
        "http://localhost:8072/app/courses/api/courses/create",
        {
          method: "POST",
          body: form, // The FormData object is the body of the request.
          headers: {
            // Include the authorization token for security.
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 6. If the request was successful (e.g., status 200 OK or 201 Created)...
      if (res.ok) {
        // ...show a success modal to the user.
        setShowModal(true);

        // ...and reset all form fields to their initial empty state.
        setFormData({
          tags: "",
          title: "",
          description: "",
          aboutAuthor: "",
          price: 0,
          createdBy: "",
        });
        setImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      // 7. If the fetch request fails (e.g., network error), log the error.
      console.error("Error creating course:", err);
    }
  };

  return (
    <div className="course-form-wrapper">
      <form className="course-form" onSubmit={handleSubmit}>
        <h2>Create New Course</h2>

        <label>Title</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="Course title"
        />

        <label>Tags</label>
        <input
          type="text"
          name="tags"
          required
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., JavaScript | Spring Boot | AI"
        />

        <label>Description</label>
        <DescriptionEditor
          value={formData.description}
          onChange={(val: any) =>
            setFormData({ ...formData, description: val })
          }
        />

        <label>About Author</label>
        <DescriptionEditor
          value={formData.aboutAuthor}
          onChange={(val: any) =>
            setFormData({ ...formData, aboutAuthor: val })
          }
        />

        <label>Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          required
          onChange={handleChange}
        />

        <label>Created By</label>
        <input
          type="text"
          name="createdBy"
          value={formData.createdBy}
          required
          onChange={handleChange}
          placeholder="Instructor name(s)"
        />

        <label>Upload Course Image</label>
        <input
          type="file"
          required
          accept="image/*"
          onChange={handleFileChange}
        />

        {imagePreview && (
          <div className="image-preview">
            <p>Preview:</p>
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit">Create Course</button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                fontSize: "1.8rem",
                color: "#10b981",
                fontWeight: "bold",
              }}
            >
              🎉 Course Created!
            </h2>
            <p style={{ marginTop: "1rem", color: "#374151" }}>
              Your course was successfully created.
            </p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
