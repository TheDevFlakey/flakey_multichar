/** @format */

import React from 'react';

interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50'>
            <div className='bg-red-200/20 text-white p-6 rounded-sm border-2 border-dashed w-full max-w-sm space-y-4'>
                <p className='text-lg'>{message}</p>
                <div className='flex justify-end space-x-4'>
                    <button
                        className='text-sm font-bold uppercase border-2 border-white hover:border-red-200 hover:text-red-200 border-dashed px-4 py-2 rounded-sm hover:bg-white/20 cursor-pointer'
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className='text-sm font-bold uppercase border-2 border-white hover:border-red-500 hover:text-red-500 border-dashed px-4 py-2 rounded-sm hover:bg-white/20 cursor-pointer'
                        onClick={onConfirm}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
