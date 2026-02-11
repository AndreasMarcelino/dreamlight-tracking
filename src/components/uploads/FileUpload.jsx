import { useState, useRef } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function FileUpload({
  projectId,
  episodeId = null,
  category = "Other",
  onUploadSuccess,
  acceptedTypes = "*",
  maxSize = 52428800, // 50MB default
  allowExternalLink = true, // Allow external link option
}) {
  const [mode, setMode] = useState("upload"); // 'upload' or 'link'
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // External link state
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [submittingLink, setSubmittingLink] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize) {
      toast.error(
        `File too large! Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
      );
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    if (episodeId) formData.append("episode_id", episodeId);
    formData.append("category", category);
    formData.append("is_public_to_broadcaster", "false");

    try {
      const response = await api.post("/assets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percentCompleted);
        },
      });

      toast.success("File uploaded successfully!");

      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }

      // Reset
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitLink = async (e) => {
    e.preventDefault();

    if (!linkName.trim() || !linkUrl.trim()) {
      toast.error("Nama dan URL harus diisi");
      return;
    }

    // Basic URL validation
    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      toast.error("URL harus dimulai dengan http:// atau https://");
      return;
    }

    setSubmittingLink(true);

    try {
      const response = await api.post("/assets/external-link", {
        project_id: projectId,
        episode_id: episodeId,
        file_name: linkName.trim(),
        external_url: linkUrl.trim(),
        category,
        is_public_to_broadcaster: false,
      });

      toast.success("Link berhasil ditambahkan!");

      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }

      // Reset form
      setLinkName("");
      setLinkUrl("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan link");
      console.error("Link error:", error);
    } finally {
      setSubmittingLink(false);
    }
  };

  const getLinkTypeIcon = (url) => {
    if (!url) return "fa-link";
    const lower = url.toLowerCase();
    if (
      lower.includes("drive.google.com") ||
      lower.includes("docs.google.com")
    ) {
      return "fa-google-drive";
    } else if (lower.includes("dropbox.com")) {
      return "fa-dropbox";
    } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      return "fa-youtube";
    } else if (lower.includes("vimeo.com")) {
      return "fa-vimeo";
    } else if (lower.includes("onedrive") || lower.includes("1drv.ms")) {
      return "fa-microsoft";
    }
    return "fa-link";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      {allowExternalLink && (
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              mode === "upload"
                ? "bg-white text-ocean-500 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              mode === "link"
                ? "bg-white text-ocean-500 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="fa-solid fa-link"></i>
            External Link
          </button>
        </div>
      )}

      {mode === "upload" ? (
        <>
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
              dragActive
                ? "border-ocean-500 bg-sky-50"
                : uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-300 hover:border-ocean-400 hover:bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept={acceptedTypes}
              disabled={uploading}
              className="hidden"
            />

            {uploading ? (
              // Uploading State
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-ocean-500">
                      {progress}%
                    </span>
                  </div>
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                      className="text-ocean-500 transition-all duration-300"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Uploading file...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait</p>
              </div>
            ) : (
              // Default State
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-cloud-arrow-up text-white text-3xl"></i>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  {dragActive ? "Drop file here" : "Upload File"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-ocean-200 transition-all transform hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-folder-open mr-2"></i>
                  Choose File
                </button>
                <p className="text-xs text-gray-400 mt-4">
                  Max size: {formatFileSize(maxSize)}
                </p>
              </div>
            )}
          </div>

          {/* File Type Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-circle-info text-blue-600 mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Accepted Files
                </p>
                <p className="text-xs text-blue-700">
                  {acceptedTypes === "*"
                    ? "All file types accepted"
                    : category === "Script"
                      ? "PDF, DOC, DOCX, TXT"
                      : category === "Preview Video" ||
                          category === "Master Video"
                        ? "MP4, MOV, AVI, MKV"
                        : "Common document and media files"}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* External Link Form */
        <form onSubmit={handleSubmitLink} className="space-y-4">
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center">
                <i
                  className={`fa-brands ${getLinkTypeIcon(linkUrl)} text-white text-xl`}
                ></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Add External Link</h4>
                <p className="text-xs text-gray-500">
                  Google Drive, Dropbox, YouTube, dll
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama File <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="contoh: Script Episode 1.pdf"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-ocean-500 focus:ring-4 focus:ring-sky-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  URL Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-ocean-500 focus:ring-4 focus:ring-sky-100 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLink || !linkName.trim() || !linkUrl.trim()}
                className="w-full bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ocean-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submittingLink ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Menambahkan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-plus"></i>
                    Tambah Link
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Supported Services */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-lightbulb text-amber-600 mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Layanan yang Didukung
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600">
                    <i className="fa-brands fa-google-drive text-green-600"></i>{" "}
                    Google Drive
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600">
                    <i className="fa-brands fa-dropbox text-blue-600"></i>{" "}
                    Dropbox
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600">
                    <i className="fa-brands fa-youtube text-red-600"></i>{" "}
                    YouTube
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600">
                    <i className="fa-brands fa-vimeo text-cyan-600"></i> Vimeo
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600">
                    <i className="fa-brands fa-microsoft text-blue-500"></i>{" "}
                    OneDrive
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
