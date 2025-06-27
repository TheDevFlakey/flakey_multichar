/** @format */

import React, { useState } from 'react';
import { fetchNui } from '../utils/fetchNui';

interface Props {
    onClose: () => void;
}

const CreateCharacter: React.FC<Props> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('male');
    const [height, setHeight] = useState(180);

    const handleSubmit = () => {
        if (!name || !dob || !height) return;

        fetchNui('flakeyCore:createCharacter', {
            name,
            dob,
            gender,
            height,
        });

        onClose();
    };

    return (
        <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50'>
            <div className='border-2 border-dashed bg-red-200/20 p-6 rounded-sm w-full max-w-md space-y-4'>
                <h2 className='text-2xl font-bold mb-2'>Create Character</h2>

                <input
                    type='text'
                    placeholder='Full Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full p-2 rounded bg-violet-200/20 text-white'
                />

                <input
                    type='date'
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className='w-full p-2 rounded bg-violet-200/20 text-white'
                />

                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className='w-full p-2 rounded bg-violet-200/20 text-white'
                >
                    <option value='male' className='bg-red-200/50 text-black'>
                        Male
                    </option>
                    <option value='female' className='bg-red-200/50 text-black'>
                        Female
                    </option>
                </select>

                <input
                    type='number'
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className='w-full p-2 rounded bg-violet-200/20 text-white'
                    placeholder='Height (cm)'
                    min={140}
                    max={220}
                />

                <div className='flex justify-end gap-3 pt-2'>
                    <button
                        onClick={onClose}
                        className='text-sm font-bold uppercase border-2 border-white hover:border-red-200 hover:text-red-200 border-dashed px-4 py-2 rounded-sm hover:bg-white/20 cursor-pointer'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className='text-sm font-bold uppercase border-2 border-white hover:border-red-200 hover:text-red-200 border-dashed px-4 py-2 rounded-sm hover:bg-white/20 cursor-pointer'
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCharacter;
