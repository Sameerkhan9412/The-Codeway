import React, { useState, useRef } from 'react';
import { Upload, Video, Clock, FileText, CheckCircle, AlertCircle, X, Play, Pause } from 'lucide-react';
import axios from 'axios';
import axiosClient from '../../utils/axiosClient';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


const UploadVideo = () => {
  
  const {problemId} = useParams(); 
  const navigate = useNavigate();
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    visibility: 'public'
  });
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };



  const handleFileSelection = (file) => {
    // Validate file
    if (!file.type.startsWith('video/')) {
      setErrors({ file: 'Please select a valid video file' });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit to match original
      setErrors({ file: 'File size must be less than 100MB' });
      return;
    }

    setSelectedFile(file);
    setErrors({});
    
    // Create preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Auto-fill title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setFormData(prev => ({
      ...prev,
      title: fileName.charAt(0).toUpperCase() + fileName.slice(1)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Real upload to Cloudinary via backend
  const uploadToCloudinary = async () => {
    if (!selectedFile) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrors({});

    try {
      // Step 1: Get upload signature from backend
      console.log("Problem id"  , problemId)
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('signature', signature);
      cloudinaryFormData.append('timestamp', timestamp);
      cloudinaryFormData.append('public_id', public_id);
      cloudinaryFormData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, cloudinaryFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      setUploadStatus('success');
      toast.success("Video upload successfully");
      navigate("/admin/video")
      
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      setErrors({
        upload: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSubmit = () => {
    // Validate form
    const newErrors = {};
    if (!selectedFile) newErrors.file = 'Please select a video file';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    uploadToCloudinary();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVideoPreview(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadedVideo(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      visibility: 'public'
    });
    setErrors({});
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Video Upload</h1>
            <p className="text-slate-400">Upload and manage video content for your platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800 rounded-lg px-4 py-2">
              <span className="text-sm text-slate-300">Storage Used: </span>
              <span className="text-orange-400 font-semibold">2.4GB / 10GB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Upload className="mr-2" size={24} />
              Upload Video
            </h2>

            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-orange-400 bg-orange-400/10' 
                    : selectedFile 
                    ? 'border-green-400 bg-green-400/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Video className="text-green-400" size={48} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{selectedFile.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-orange-400 hover:text-orange-300 text-sm flex items-center mx-auto"
                    >
                      <X size={16} className="mr-1" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className="text-slate-400" size={48} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Drop your video here</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        or <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-orange-400 hover:text-orange-300 underline"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Supports MP4, MOV, AVI • Max 500MB
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files[0] && handleFileSelection(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {errors.file && (
                <div className="text-red-400 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.file}
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    placeholder="Enter video title"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  placeholder="Describe your video content..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  placeholder="tutorial, javascript, react (comma separated)"
                />
              </div>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Uploading to Cloudinary...</span>
                    <span className="text-sm text-orange-400">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.upload && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-400 mr-2" size={20} />
                    <div>
                      <h3 className="text-red-400 font-medium">Upload Failed</h3>
                      <p className="text-slate-300 text-sm">{errors.upload}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadStatus === 'success' && uploadedVideo && (
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-400 mr-2" size={20} />
                    <div>
                      <h3 className="text-green-400 font-medium">Upload Successful!</h3>
                      <p className="text-slate-300 text-sm">
                        Duration: {formatDuration(uploadedVideo.duration)}
                      </p>
                      <p className="text-slate-300 text-sm">
                        Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                {uploadStatus === 'success' && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center"
                  >
                    Upload Another
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploadStatus === 'uploading'}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center"
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Video Preview */}
          {videoPreview && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Play className="mr-2" size={20} />
                Preview
              </h3>
              <div className="relative group">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full rounded-lg"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                >
                  {isPlaying ? (
                    <Pause className="text-white" size={32} />
                  ) : (
                    <Play className="text-white" size={32} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upload Guidelines */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Upload Guidelines
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>File Format:</strong> MP4, MOV, AVI, or WMV
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Max Size:</strong> 100MB per video
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Resolution:</strong> 1080p recommended
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Duration:</strong> 2 minutes to 2 hours
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Processing:</strong> Videos are automatically optimized
                </div>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Recent Uploads
            </h3>
            <div className="space-y-3">
              {[
                { title: "React Hooks Tutorial", status: "Processing", time: "2 min ago" },
                { title: "JavaScript Fundamentals", status: "Live", time: "1 hour ago" },
                { title: "CSS Grid Layout", status: "Live", time: "3 hours ago" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-slate-400 text-xs">{item.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'Live' 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-orange-400/20 text-orange-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
