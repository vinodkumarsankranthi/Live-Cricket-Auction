import React, { useState, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import { Modal, IconButton, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { canvasPreview } from "./canvasPreview";
import "react-image-crop/dist/ReactCrop.css";
import "./Cropper.css";

const Cropper = ({ open, setOpen, setCroppedImageDataUrl, initialImage }) => {
  const [image, setImage] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (initialImage) setImage(initialImage);
  }, [initialImage]);

  const handleClose = () => setOpen(false);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
  };

  const handleSave = () => {
    if (imgRef.current && previewCanvasRef.current && completedCrop) {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        previewCanvasRef.current,
        0,
        0,
        previewCanvasRef.current.width,
        previewCanvasRef.current.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL("image/png");
      setCroppedImageDataUrl(dataUrl);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate
      );
    }
  }, [completedCrop, scale, rotate]);
  
useEffect(() => {
  if (initialImage) {
    setImage(initialImage);
    setScale(1); // reset zoom
    setRotate(0); // reset rotation
  }
}, [initialImage]);

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="cropper-container">
        <div className="cropper-content">
          <IconButton className="cropper-close" onClick={handleClose}>
            <CloseIcon className="cropper-closex" />
          </IconButton>

          <h2 className="cropper-title">Image Cropper</h2>

          <div className="cropper-grid">
            <div className="cropper-left">
              <p>Select and adjust image:</p>
              <div className="cropper-image-container">
                {image && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    keepSelection={true}
                    aspect={undefined} // Allow any shape
                  >
                    <img
                      ref={imgRef}
                      src={image}
                      onLoad={onImageLoad}
                      style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                      className="cropper-image"
                      alt="Crop source"
                    />
                  </ReactCrop>
                )}
              </div>
              <div className="cropper-zoom-btn-image">
                <Button className="zoom-btn"onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}>
                  <ZoomInIcon /> Zoom In
                </Button>
                <Button className="zoom-btn"onClick={() => setScale((prev) => Math.max(prev - 0.1, -3))}>
                  <ZoomOutIcon /> Zoom Out
                </Button>
                <Button className="zoom-btn" onClick={() => setRotate((prev) => (prev + 90) % 360)}>
                  🔄 Rotate
                 </Button>
              </div>
            </div>

            <div className="cropper-right">
              <p>Preview</p>
              <canvas ref={previewCanvasRef} className="cropper-preview" />
              <Button onClick={handleSave}className="cropper-save-image">
                <SaveIcon /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Cropper;
