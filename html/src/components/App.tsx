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
      <div className="flex h-screen w-screen text-white font-sans">
        {/* Sidebar */}
        <div className="w-1/4 p-6 bg-[#12141b] border-r border-white/10 flex flex-col justify-between">
          {/* Top: Characters List */}
          <div>
            <h1 className="text-3xl font-extrabold mb-6 tracking-tight">
              Characters
            </h1>
            <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1">
              {characters.map((char) => (
                <div
                  key={char.cid}
                  onClick={() => {
                    setSelected(char.cid);
                    fetchNui("flakey_multichar:focusCharacter", {
                      cid: char.cid,
                    });
                  }}
                  className={`p-4 rounded-lg transition-all duration-200 cursor-pointer border ${
                    selected === char.cid
                      ? "bg-violet-600 border-violet-400 shadow-lg"
                      : "bg-violet-500/20 hover:bg-violet-500/40 border-white/10"
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
                  className="p-4 rounded-lg text-center bg-green-600 hover:bg-green-700 font-semibold cursor-pointer transition"
                >
                  + Create New Character
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Select/Delete Controls */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Select Your Character</h2>
            {selected !== null && (
              <p className="text-white/60 text-sm mb-4">
                Selected ID: <span className="font-semibold">{selected}</span>
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={selectCharacter}
                disabled={selected === null}
                className={`flex-1 px-4 py-2 rounded-md text-sm uppercase font-bold border-2 transition-all tracking-wide ${
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
                className={`flex-1 px-4 py-2 rounded-md text-sm uppercase font-bold border-2 transition-all tracking-wide ${
                  selected === null
                    ? "border-white/30 text-white/30 cursor-not-allowed"
                    : "border-red-400 hover:bg-red-600 hover:border-red-500 hover:text-white"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center items-center px-12 relative">
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
        </div>
      </div>
    )
  );
};

export default App;
