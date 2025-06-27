/** @format */

import React, { useState } from 'react';
import { fetchNui } from '../utils/fetchNui';
import CreateCharacter from './CreateCharacter';
import ConfirmModal from './ConfirmModel';
import { useNuiEvent } from '../hooks/useNuiEvent';

interface Character {
    slot: number;
    name: string;
    dob: string;
    gender: string;
    height: number;
}

const App: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [characters, setCharacters] = useState<Character[]>([
        { slot: 1, name: 'John Doe', dob: '1999-03-03' },
        { slot: 2, name: 'Jane Smith', dob: '1998-05-15' },
    ]);
    const [selected, setSelected] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingDeleteSlot, setPendingDeleteSlot] = useState<number | null>(null);

    useNuiEvent('setVisible', (isVisible: boolean) => {
        setVisible(isVisible);
    });

    useNuiEvent('loadCharacters', (chars: Character[]) => {
        setCharacters(chars.map((c, i) => ({ ...c, slot: i + 1 })));
        setVisible(true);
        setShowCreate(false);
    });

    useNuiEvent('showCreateCharacter', () => {
        setShowCreate(true);
        setVisible(true);
    });

    useNuiEvent('characterDeleted', (slotId: number) => {
        const updated = characters.filter((char) => char.slot !== slotId);
        setCharacters(updated);
        setSelected(null);
        setShowConfirm(false);
        setPendingDeleteSlot(null);
    });

    const handleDeleteRequest = (slotId: number | null) => {
        if (slotId !== null) {
            setPendingDeleteSlot(slotId);
            setShowConfirm(true);
        }
    };

    const confirmDelete = () => {
        if (pendingDeleteSlot !== null) {
            fetchNui('flakey_multichar:deleteCharacter', { slotId: pendingDeleteSlot });
            const updated = characters.filter((char) => char.slot !== pendingDeleteSlot);
            setCharacters(updated);
            setShowConfirm(false);
            setPendingDeleteSlot(null);
            setSelected(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setPendingDeleteSlot(null);
    };

    const selectCharacter = () => {
        if (selected !== null) {
            fetchNui('flakey_multichar:selectCharacter', { slot: selected });
            setVisible(false);
        }
    };

    return (
        visible && (
            <div className='min-h-screen bg-gradient-to-b from-red-200 to-violet-300 text-white flex flex-col items-center p-8'>
                <h1 className='text-4xl font-bold mb-6'>Select Your Character</h1>
                {showCreate && <CreateCharacter onClose={() => setShowCreate(false)} />}
                {showConfirm && (
                    <ConfirmModal
                        message='Are you sure you want to delete this character? This cannot be undone.'
                        onConfirm={confirmDelete}
                        onCancel={cancelDelete}
                    />
                )}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-6'>
                    {characters.map((char) => (
                        <div
                            key={char.slot}
                            onClick={() => setSelected(char.slot)}
                            className={`p-4 rounded-sm border-2 border-dashed border-white cursor-pointer transition-all ${
                                selected === char.slot
                                    ? 'bg-violet-500/80'
                                    : 'border-gray-700 bg-violet-500/30 hover:bg-violet-500/40'
                            }`}
                        >
                            <h2 className='text-xl font-semibold'>{char.name}</h2>
                            <p>DOB: {char.dob}</p>
                            <p>Gender: {char.gender}</p>
                            <p>Height: {char.height} cm</p>
                        </div>
                    ))}

                    {characters.length < 6 && (
                        <div
                            onClick={() => setShowCreate(true)}
                            className='p-4 rounded-sm border border-dashed border-white bg-violet-500/80 hover:bg-violet-500 text-center cursor-pointer'
                        >
                            <h2 className='text-xl font-bold'>+ Create New Character</h2>
                        </div>
                    )}
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={selectCharacter}
                        disabled={selected === null}
                        className='font-bold uppercase border-2 hover:border-white/0 border-white hover:border-red-200 hover:text-red-200 border-dashed px-6 py-2 rounded-sm hover:bg-white cursor-pointer'
                    >
                        Select
                    </button>
                    <button
                        onClick={() => handleDeleteRequest(selected)}
                        disabled={selected === null}
                        className='font-bold uppercase border-2 hover:border-white/0 border-white hover:border-red-200 hover:text-red-200 border-dashed px-6 py-2 rounded-sm hover:bg-white cursor-pointer'
                    >
                        Delete
                    </button>
                </div>
            </div>
        )
    );
};

export default App;
