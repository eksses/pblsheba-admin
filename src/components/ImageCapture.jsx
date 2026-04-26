import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { Camera, Image as ImageIcon, X } from '@phosphor-icons/react';

const ImageCapture = ({ onImageChange, currentImage }) => {
  const toast = useToast();
  const [preview, setPreview] = useState(currentImage);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          onImageChange(file);
          stopCamera();
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.9);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="image-capture-wrap">
      {preview && !isCapturing ? (
        <div className="image-preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <button type="button" onClick={removeImage} className="image-remove-btn">
            <X size={18} />
          </button>
        </div>
      ) : isCapturing ? (
        <div className="camera-view-container">
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-controls">
            <button type="button" onClick={capturePhoto} className="btn-capture">
              <div className="btn-capture-inner" />
            </button>
            <button type="button" onClick={stopCamera} className="btn-cancel-camera">
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="capture-options">
          <label className="capture-option-btn">
            <ImageIcon size={24} />
            <span>Gallery</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          <button type="button" onClick={startCamera} className="capture-option-btn" style={{ marginLeft: 20 }}>
            <Camera size={24} />
            <span>Camera</span>
          </button>
        </div>
      )}
      <style>{`
        .image-capture-wrap {
          width: 100%;
          min-height: 200px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-xl);
          background: var(--card-bg);
          overflow: hidden;
          position: relative;
        }
        .capture-options {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 20px 0;
          height: 100%;
          min-height: 180px;
        }
        .capture-option-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0;
          width: 130px;
          height: 130px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-2xl);
          cursor: pointer;
          color: var(--neutral-400);
          background: var(--neutral-800);
          transition: all 0.2s ease;
        }
        .capture-option-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(34, 197, 94, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(34, 197, 94, 0.15);
        }
        .image-preview-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
        }
        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .camera-view-container {
          position: relative;
          width: 100%;
          background: black;
          aspect-ratio: 4/3;
        }
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .camera-controls {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
        }
        .btn-capture {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid white;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .btn-capture-inner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
        }
        .btn-cancel-camera {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ImageCapture;
