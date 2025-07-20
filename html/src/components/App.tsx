import React, { useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import CreateCharacter from "./CreateCharacter";
import ConfirmModal from "./ConfirmModel";
import { useNuiEvent } from "../hooks/useNuiEvent";

interface Character {
  cid: number;
  name: string;
  dob: string;
  gender: string;
  height: number;
}

const App: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteCid, setPendingDeleteCid] = useState<number | null>(null);

  useNuiEvent("setVisible", (isVisible: boolean) => {
    setVisible(isVisible);
  });

  useNuiEvent("loadCharacters", (chars: Character[]) => {
    setCharacters(chars);
    setVisible(true);
    setShowCreate(false);
  });

  useNuiEvent("showCreateCharacter", () => {
    setShowCreate(true);
    setVisible(true);
  });

  useNuiEvent("characterDeleted", (cid: number) => {
    const updated = characters.filter((char) => char.cid !== cid);
    setCharacters(updated);
    setSelected(null);
    setShowConfirm(false);
    setPendingDeleteCid(null);
  });

  const handleDeleteRequest = (cid: number | null) => {
    if (cid !== null) {
      setPendingDeleteCid(cid);
      setShowConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteCid !== null) {
      fetchNui("flakey_multichar:deleteCharacter", { cid: pendingDeleteCid });
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPendingDeleteCid(null);
  };

  const selectCharacter = () => {
    if (selected !== null) {
      fetchNui("flakey_multichar:selectCharacter", { cid: selected });
      setVisible(false);
    }
  };

  return (
    visible && (
      <div className="flex h-screen text-white font-sans">
        {/* Left Sidebar */}
        <div className="w-1/4 p-4 bg-[#1f1f2b] border-r border-white/10 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Characters</h1>
          <div className="space-y-3">
            {characters.map((char) => (
              <div
                key={char.cid}
                onClick={() => {
                  setSelected(char.cid);
                  fetchNui("flakey_multichar:focusCharacter", {
                    cid: char.cid,
                  });
                }}
                className={`p-3 rounded-md cursor-pointer transition-all ${
                  selected === char.cid
                    ? "bg-violet-600 shadow-md"
                    : "bg-violet-500/30 hover:bg-violet-500/50"
                }`}
              >
                <h2 className="text-lg font-semibold">{char.name}</h2>
                <p className="text-sm text-white/80">DOB: {char.dob}</p>
                <p className="text-sm text-white/80">Gender: {char.gender}</p>
                <p className="text-sm text-white/80">
                  Height: {char.height} cm
                </p>
              </div>
            ))}

            {characters.length < 6 && (
              <div
                onClick={() => setShowCreate(true)}
                className="p-3 bg-green-600 hover:bg-green-700 text-center rounded-md font-semibold cursor-pointer"
              >
                + Create New Character
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-12">
          {showCreate && (
            <CreateCharacter onClose={() => setShowCreate(false)} />
          )}
          {showConfirm && (
            <ConfirmModal
              message="Are you sure you want to delete this character? This cannot be undone."
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          )}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Select Your Character</h1>
            {selected !== null && (
              <p className="text-white/70">
                You have selected character ID: {selected}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={selectCharacter}
              disabled={selected === null}
              className={`px-6 py-2 rounded-md uppercase font-bold border-2 transition-all ${
                selected === null
                  ? "border-white/30 text-white/30 cursor-not-allowed"
                  : "border-white hover:bg-white hover:text-black"
              }`}
            >
              Select
            </button>
            <button
              onClick={() => handleDeleteRequest(selected)}
              disabled={selected === null}
              className={`px-6 py-2 rounded-md uppercase font-bold border-2 transition-all ${
                selected === null
                  ? "border-white/30 text-white/30 cursor-not-allowed"
                  : "border-red-400 hover:bg-red-600 hover:border-red-600"
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default App;
