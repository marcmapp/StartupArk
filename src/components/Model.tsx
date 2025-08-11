import React from "react";

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <p className="text-lg mb-4">{message}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;