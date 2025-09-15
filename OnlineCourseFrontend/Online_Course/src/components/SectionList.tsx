import { useContext, useState, type ChangeEvent } from "react";
import { SectionData } from "../models/SectionData";
import { VideoResponse } from "../models/VideoResponse";
import { FileResponse } from "../models/FileResponse";
import "../SectionList.css";
import "../VideoList.css";
import { AuthContext } from "react-oauth2-code-pkce";

export const SectionList = ({ sections }: { sections: SectionData[] }) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: number]: boolean;
  }>({});
  const [videos, setVideos] = useState<{
    [sectionId: number]: VideoResponse[];
  }>({});
  const [files, setFiles] = useState<{ [sectionId: number]: FileResponse[] }>(
    {}
  );
  const [playingVideo, setPlayingVideo] = useState<{
    sectionId: number;
    url: string;
  } | null>(null);
  const [activeModal, setActiveModal] = useState<null | {
    type: "video" | "file";
    sectionId: number;
  }>(null);
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const { token } = useContext(AuthContext);

  const toggleExpand = async (id: number): Promise<void> => {
    const isCurrentlyExpanded = expandedSections[id];
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!isCurrentlyExpanded) {
      try {
        const [videoRes, fileRes] = await Promise.all([
          fetch(`http://localhost:8072/app/videos/api/video/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:8072/app/files/api/files/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!videoRes.ok || !fileRes.ok)
          throw new Error("Failed to fetch section data");

        const videoData = await videoRes.json();
        const fileData = await fileRes.json();

        const videoList: VideoResponse[] = (videoData || []).map((v: any) => {
          const byteArray = new Uint8Array(
            atob(v.data)
              .split("")
              .map((c: string) => c.charCodeAt(0))
          );
          const blob = new Blob([byteArray], {
            type: v.contentType || "video/mp4",
          });
          const url = URL.createObjectURL(blob);
          return new VideoResponse(v.id, v.title, url, v.contentType);
        });

        const fileList: FileResponse[] = (fileData || []).map((f: any) => {
          const byteArray = new Uint8Array(
            atob(f.data)
              .split("")
              .map((c: string) => c.charCodeAt(0))
          );
          const blob = new Blob([byteArray], {
            type: f.contentType || "application/octet-stream",
          });
          const url = URL.createObjectURL(blob);
          return new FileResponse(f.id, f.title, url, f.contentType);
        });

        setVideos((prev) => ({ ...prev, [id]: videoList }));
        setFiles((prev) => ({ ...prev, [id]: fileList }));
      } catch (error) {
        console.error(`Failed to fetch data for section ${id}:`, error);
        setVideos((prev) => ({ ...prev, [id]: [] }));
        setFiles((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const handleUpload = async (type: "video" | "file"): Promise<void> => {
    if (!file || !title || !activeModal)
      return alert("Provide title and select a file.");
    const formData = new FormData();
    formData.append("title", title);
    formData.append(type === "video" ? "video" : "files", file);
    formData.append("sectionId", String(activeModal.sectionId));

    const url =
      type === "video"
        ? "http://localhost:8072/app/videos/api/videos/upload"
        : "http://localhost:8072/app/files/api/files/upload";

    try {
      const uploadRes = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (uploadRes.ok) {
        toggleExpand(activeModal.sectionId); // refresh
        resetModal();
        alert(`${type === "video" ? "Video" : "File"} uploaded successfully!`);
      } else {
        alert(`${type === "video" ? "Video" : "File"} upload failed.`);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const resetModal = () => {
    setActiveModal(null);
    setTitle("");
    setFile(null);
  };

  const closeVideoPlayer = () => {
    if (playingVideo?.url) URL.revokeObjectURL(playingVideo.url);
    setPlayingVideo(null);
  };

  return (
    <div className="section-list">
      {sections.map((section) => (
        <div key={section.id} className="section-item">
          <div
            className="section-header"
            onClick={() => toggleExpand(section.id)}
          >
            {" "}
            <span>{section.name}</span>
            <svg
              onClick={() => toggleExpand(section.id)}
              className={`arrow-icon ${
                expandedSections[section.id] ? "rotate" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {expandedSections[section.id] && (
            <div className="section-content">
              <div className="section-actions">
                <button
                  className="upload-btn"
                  onClick={() =>
                    setActiveModal({ type: "video", sectionId: section.id })
                  }
                >
                  + Upload Video
                </button>
                <button
                  className="upload-btn"
                  onClick={() =>
                    setActiveModal({ type: "file", sectionId: section.id })
                  }
                >
                  + Upload File
                </button>
              </div>

              {!videos[section.id]?.length && !files[section.id]?.length ? (
                <div className="no-content">No videos or files uploaded.</div>
              ) : (
                <>
                  {videos[section.id]?.length > 0 && (
                    <div className="video-list">
                      {videos[section.id].map((video) => (
                        <div
                          key={video.id}
                          className="video-item"
                          onClick={() =>
                            setPlayingVideo({
                              sectionId: section.id,
                              url: video.data,
                            })
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                            style={{
                              marginRight: "8px",
                              verticalAlign: "middle",
                            }}
                          >
                            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                            <path d="M12 20v-3" />
                            <path d="M8 20h8" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                          <span>{video.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {files[section.id]?.length > 0 && (
                    <div className="video-list">
                      {files[section.id].map((file) => (
                        <div
                          key={file.id}
                          className="video-item"
                          onClick={() => window.open(file.data, "_blank")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                            style={{
                              marginRight: "8px",
                              verticalAlign: "middle",
                            }}
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>{file.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Upload {activeModal.type === "video" ? "Video" : "File"}</h2>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="modal-buttons">
              <button
                className="create-btn"
                onClick={() => handleUpload(activeModal.type)}
              >
                Upload
              </button>
              <button className="cancel-btn" onClick={resetModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {playingVideo && (
        <div className="modal-overlay">
          <div className="modal-content video-player-modal">
            <h2>
              Now Playing:{" "}
              {videos[playingVideo.sectionId]?.find(
                (v) => v.data === playingVideo?.url
              )?.title || "Video"}
            </h2>
            <video
              controls
              width="100%"
              src={playingVideo.url}
              onEnded={closeVideoPlayer}
            >
              Your browser does not support the video tag.
            </video>
            <button className="cancel-btn" onClick={closeVideoPlayer}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
