// ImageCropperWrapper.js
import React, { useState } from 'react';
import Cropper from "../Cropper/Cropper";

const SampleCode = ({ onCroppedImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // Reset input
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(null);
        setTimeout(() => {
          setSelectedImage(reader.result);
          setOpenCropper(true);
        }, 50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedImage = (dataUrl) => {
    // Pass the cropped DataURL to the parent or consumer
    onCroppedImage(dataUrl);
    customAlert('Updated', 'Updated and cropped.', 'info');
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="file-input-crop"
        onChange={handleFileSelect}
      />

      <Cropper
        open={openCropper}
        setOpen={setOpenCropper}
        setCroppedImageDataUrl={handleCroppedImage}
        initialImage={selectedImage}
      />
    </>
  );
};

export default SampleCode;
