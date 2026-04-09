import React, { useRef } from "react";
import { Plus } from "lucide-react";

const UploadImage = ({ onImageSelect }) => {
  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      // Reset input so the same file can be selected again if deleted
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={handleIconClick}
        className="p-2 text-gray-400 hover:bg-white/5 rounded-full cursor-pointer transition"
      >
        <Plus size={18} />
      </button>
    </>
  );
};

export default UploadImage;