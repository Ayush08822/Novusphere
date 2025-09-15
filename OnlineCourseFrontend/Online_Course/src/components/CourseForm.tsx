import React, { useContext, useState } from "react";
import "../CourseForm.css";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("course", JSON.stringify(formData));
    if (image) form.append("image", image);

    try {
      const res = await fetch(
        "http://localhost:8072/app/courses/api/courses/create",
        {
          method: "POST",
          body: form,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setShowModal(true);
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
