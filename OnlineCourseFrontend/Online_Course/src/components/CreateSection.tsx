import { useState, useContext } from "react";
import "../Section.css";
import { SectionList } from "./SectionList";
import { AuthContext } from "react-oauth2-code-pkce";

export const CreateSection = ({
  courseId,
}: {
  courseId: string | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  // NEW: A state to trigger a refresh in the child component
  const [refreshKey, setRefreshKey] = useState(0);
  const { token } = useContext(AuthContext);

  // REMOVED: The sections state and fetchSections logic are no longer needed here.
  // SectionList now handles its own data fetching.

  const handleCreate = async () => {
    if (!sectionName.trim() || !courseId) return;

    const payload = {
      name: sectionName,
      courseId: Number(courseId),
    };

    try {
      const res = await fetch(
        "http://localhost:8072/app/courses/api/sections/add-sections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        // Instead of manually adding to a local list, we trigger a refresh.
        setRefreshKey((prevKey) => prevKey + 1);
        setSectionName("");
        setIsModalOpen(false);
      } else {
        console.error("Failed to create section");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="create-section-container">
      <button
        onClick={() => setIsModalOpen(true)}
        className="create-section-btn"
      >
        + Create Section
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Section</h2>
            <input
              type="text"
              placeholder="Enter section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="create-btn" onClick={handleCreate}>
                Create
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "32px" }}>
        {/* UPDATED: Pass courseId and the new key prop instead of sections */}
        {courseId && <SectionList key={refreshKey} courseId={courseId} />}
      </div>
    </div>
  );
};
