import React, { useState } from "react";
import { fetchNui } from "../utils/fetchNui";

interface Props {
  onClose: () => void;
}

const CreateCharacter: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(180);

  const handleSubmit = () => {
    if (!name || !dob || !height) return;

    fetchNui("flakeyCore:createCharacter", {
      name,
      dob,
      gender,
      height,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1f1f2b] text-white p-6 rounded-xl w-full max-w-md space-y-5 shadow-lg border border-white/10">
        <h2 className="text-2xl font-bold text-center text-blue-400">
          Create Character
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-3 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="male" className="text-black">
            Male
          </option>
          <option value="female" className="text-black">
            Female
          </option>
        </select>

        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          placeholder="Height (cm)"
          min={140}
          max={220}
          className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex justify-between gap-4 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition border border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition border border-blue-400"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
