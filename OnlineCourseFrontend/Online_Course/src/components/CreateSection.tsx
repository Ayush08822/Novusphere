import { useState, useEffect, useContext } from "react";
import "../Section.css";
import { SectionList } from "./SectionList";
import { SectionData } from "../models/SectionData";
import { AuthContext } from "react-oauth2-code-pkce";

export const CreateSection = ({
  courseId,
}: {
  courseId: string | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState<SectionData[]>([]);
  const { token } = useContext(AuthContext);

  const fetchSections = async () => {
    try {
      const res = await fetch("http://localhost:8072/app/courses/api/sections/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const sectionObjs = data.map(
        (s: any) => new SectionData(s.id, s.name, s.courseId)
      );
      setSections(sectionObjs);
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreate = async () => {
    if (!sectionName.trim()) return;

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
        const data = await res.json();
        const newSection = new SectionData(data.id, data.name, data.courseId);
        setSections((prev) => [...prev, newSection]); // ✅ Add new section immediately
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

      {/* ⬇️ Add spacing and show sections list */}
      <div style={{ marginTop: "32px" }}>
        <SectionList sections={sections} />
      </div>
    </div>
  );
};
