import React, { useState } from "react";
import "./index.css"; 
import Cookies from "js-cookie";

const UploadModal = ({ closeModal, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      // Validate file size (limit to 5MB for example)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB.");
        return;
      }

      setSelectedFile(file);
      setError(null); // Reset error if file is valid
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("dp", selectedFile);

    const token = Cookies.get("auth_token");

    if (!token) {
      alert("You are not authorized to upload files.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/upload_dp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log("File uploaded successfully");
        if (onUploadSuccess) {
          onUploadSuccess(); // Callback to parent to update profile image
        }
        closeModal(); // Close the modal after uploading
      } else {
        const errorMsg = await response.text();
        console.error("File upload failed:", errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed due to a network or server issue.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="cross-container">
          <div onClick={closeModal} className="cross">
            X
          </div>
        </div>
        <h2>Upload File</h2>
        <div
          className="upload-area"
          onClick={() => document.querySelector("#fileInput").click()}
        >
          {selectedFile ? selectedFile.name : "Click here to upload a file"}
        </div>
        <input
          type="file"
          id="fileInput"
          accept="image/*" // Restrict file selection to images
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {error && <div className="error-message">{error}</div>} {/* Show error message */}
        <div className="modal-buttons">
          {selectedFile ? (
            <button onClick={handleUpload}>Post</button>
          ) : (
            <button className="newButton" disabled>Post</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
