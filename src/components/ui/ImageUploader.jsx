import React, { useState, useRef } from "react";
import { filesApi } from "../../services/api";

// Client-side image compression helper to keep payloads light and fast
function compressImage(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    // Keep SVGs, GIFs, and already compact files as-is
    if (file.type === "image/svg+xml" || file.type === "image/gif" || file.size < 150 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Picture",
  hint = "Supports PNG, JPG, WEBP, or GIF (max 10MB)",
  aspectRatio = "16/9",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // 1. Try uploading to backend file server
      const res = await filesApi.upload(file);
      if (res?.url) {
        onChange(res.url);
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err) {
      console.warn("Server upload fallback to optimized Base64 URL:", err);
      // 2. High-performance fallback: compress image client-side to keep DB fast
      const compressedUrl = await compressImage(file);
      if (compressedUrl) {
        onChange(compressedUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="image-uploader-wrapper">
      <div className="image-uploader-header">
        <label className="uploader-label">
          {label}
          {hint && <span className="uploader-hint"> — {hint}</span>}
        </label>
        <button
          type="button"
          className="uploader-mode-toggle"
          onClick={() => setUseUrlMode(!useUrlMode)}
        >
          {useUrlMode ? "📁 Switch to File Upload" : "🔗 Or paste Image URL"}
        </button>
      </div>

      {error && <p className="uploader-error">{error}</p>}

      {useUrlMode ? (
        <div className="uploader-url-input-box">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or any image link"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {value ? (
            <div className="uploader-preview-box" style={{ aspectRatio }}>
              <img src={value} alt="Uploaded picture preview" className="preview-img" />
              <div className="preview-overlay">
                <button
                  type="button"
                  className="preview-btn change"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Change Picture"}
                </button>
                <button
                  type="button"
                  className="preview-btn remove"
                  onClick={() => onChange("")}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`uploader-dropzone ${uploading ? "uploading" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="uploader-spinner-box">
                  <div className="btn-spinner" style={{ width: "24px", height: "24px" }} />
                  <span>Uploading picture to DevSphere...</span>
                </div>
              ) : (
                <div className="uploader-prompt-box">
                  <span className="upload-icon">📸</span>
                  <div className="upload-text">
                    <strong>Click to upload picture</strong> or drag and drop
                  </div>
                  <span className="upload-subtext">PNG, JPG, WEBP or GIF up to 10MB</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

