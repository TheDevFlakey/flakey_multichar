import React from "react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1f1f2b] text-white p-6 rounded-xl border border-white/10 shadow-lg w-full max-w-md space-y-6">
        <p className="text-lg text-center font-medium text-blue-400">
          {message}
        </p>
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition border border-blue-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition border border-red-500"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
