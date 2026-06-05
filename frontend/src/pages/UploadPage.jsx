import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Upload, X, FileText, ImageIcon, Sparkles, AlertCircle
} from 'lucide-react';
import './UploadPage.css';

const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024;

const FilePreview = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  return (
    <div className="file-preview">
      <div className="file-preview__icon">
        {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
      </div>
      <div className="file-preview__info">
        <p className="file-preview__name">{file.name}</p>
        <p className="file-preview__size">{(file.size / 1024).toFixed(0)} KB · {isPDF ? 'PDF' : 'Image'}</p>
      </div>
      {file.preview && isImage && (
        <img src={file.preview} alt={file.name} className="file-preview__thumb" />
      )}
      <button className="file-preview__remove" onClick={() => onRemove(file)}>
        <X size={14} />
      </button>
    </div>
  );
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const reasons = rejected[0]?.errors?.map(e => e.message).join(', ');
      toast.error(`Some files rejected: ${reasons}`);
    }

    const withPreviews = accepted.map((f) =>
      Object.assign(f, {
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      })
    );

    setFiles((prev) => {
      const all = [...prev, ...withPreviews];
      return all.slice(0, MAX_FILES);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_SIZE,
    multiple: true,
  });

  const removeFile = (file) => {
    setFiles((prev) => prev.filter((f) => f !== file));
    if (file.preview) URL.revokeObjectURL(file.preview);
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      toast.error('Please add at least one document');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append('documents', f));

    try {
      const { data } = await api.post('/upload/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      toast.success('Documents uploaded! Generating your itinerary...');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page page-enter">
      <div className="upload-page__header">
        <h1>New Itinerary</h1>
        <p>Upload your travel documents and we'll build a complete itinerary for you.</p>
      </div>

      <div className="upload-page__body">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${files.length > 0 ? 'dropzone--compact' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone__content">
            <div className="dropzone__icon">
              <Upload size={32} />
            </div>
            <h3>
              {isDragActive ? 'Drop your files here' : 'Drag & drop your documents'}
            </h3>
            <p>or <span className="dropzone__browse">browse to upload</span></p>
            <div className="dropzone__chips">
              <span>PDF</span><span>JPG</span><span>PNG</span><span>WEBP</span>
            </div>
            <p className="dropzone__limit">Up to {MAX_FILES} files · 10 MB each</p>
          </div>
        </div>

        {/* Supported document types */}
        <div className="doc-types">
          <p className="doc-types__label">Supported documents</p>
          <div className="doc-types__list">
            {['✈️ Flight tickets', '🏨 Hotel bookings', '🚂 Train tickets', '🚌 Bus passes', '🎫 Tour vouchers'].map((d) => (
              <span key={d} className="doc-types__chip">{d}</span>
            ))}
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="upload-files">
            <div className="upload-files__header">
              <h3>{files.length} file{files.length !== 1 ? 's' : ''} selected</h3>
              <button className="upload-files__clear" onClick={() => setFiles([])}>
                Clear all
              </button>
            </div>
            <div className="upload-files__list">
              {files.map((file, i) => (
                <FilePreview key={i} file={file} onRemove={removeFile} />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="upload-info">
          <AlertCircle size={15} />
          <p>Your documents are processed securely. AI will extract booking information and generate a day-by-day itinerary with recommended activities.</p>
        </div>

        {/* Generate button */}
        <button
          className={`upload-generate-btn ${uploading ? 'upload-generate-btn--loading' : ''}`}
          onClick={handleGenerate}
          disabled={uploading || files.length === 0}
        >
          {uploading ? (
            <>
              <span className="upload-generate-btn__spinner" />
              Uploading & processing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Itinerary
            </>
          )}
        </button>
      </div>
    </div>
  );
}
