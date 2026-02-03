import { useState, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FileUpload({ 
  projectId, 
  episodeId = null, 
  category = 'Other',
  onUploadSuccess,
  acceptedTypes = '*',
  maxSize = 52428800, // 50MB default
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large! Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (episodeId) formData.append('episode_id', episodeId);
    formData.append('category', category);
    formData.append('is_public_to_broadcaster', 'false');

    try {
      const response = await api.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      toast.success('File uploaded successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }

      // Reset
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : uploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
                <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
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
                  className="text-indigo-600 transition-all duration-300"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Uploading file...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        ) : (
          // Default State
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-cloud-arrow-up text-white text-3xl"></i>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {dragActive ? 'Drop file here' : 'Upload File'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
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
            <p className="text-sm font-semibold text-blue-900 mb-1">Accepted Files</p>
            <p className="text-xs text-blue-700">
              {acceptedTypes === '*' ? (
                'All file types accepted'
              ) : category === 'Script' ? (
                'PDF, DOC, DOCX, TXT'
              ) : category === 'Preview Video' || category === 'Master Video' ? (
                'MP4, MOV, AVI, MKV'
              ) : (
                'Common document and media files'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}