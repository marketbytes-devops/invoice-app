import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999 }}
          className="flex items-center justify-center"
        >
          {/* Full-screen dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)" }}
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
            style={{ maxWidth: "60vw", maxHeight: "70vh" }}
          >
            {/* Close button — top-right of image */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <img
              src={imageUrl}
              alt={title || "Preview"}
              className="rounded-xl shadow-2xl object-contain"
              style={{ maxWidth: "60vw", maxHeight: "65vh" }}
            />

            {/* Caption */}
            {title && (
              <p className="mt-3 text-white/70 text-xs font-medium tracking-wide">
                {title}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
