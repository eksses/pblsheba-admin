import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X } from '@phosphor-icons/react';

const ImageCapture = ({ onImageChange, currentImage }) => {
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
      alert("Could not access camera. Please check permissions.");
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
            <input type="file" accept="image
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
