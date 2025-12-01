import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const RoomForm = ({ onSubmit }) => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: '',
      length_ft: 0,
      length_in: 0,
      width_ft: 0,
      width_in: 0,
      height_ft: 8,
      height_in: 0,
    },
  ]);

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: '',
      length_ft: 0,
      length_in: 0,
      width_ft: 0,
      width_in: 0,
      height_ft: 8,
      height_in: 0,
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  const updateRoom = (id, field, value) => {
    setRooms(
      rooms.map((room) =>
        room.id === id ? { ...room, [field]: parseInt(value) || 0 } : room
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(rooms);
    }
  };

  const FeetInchesInput = ({ label, feetValue, inchesValue, onFeetChange, onInchesChange }) => {
    return (
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={feetValue}
              onChange={(e) => onFeetChange(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">ft</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="11"
              value={inchesValue}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val >= 0 && val <= 11) {
                  onInchesChange(val);
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">in</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Input Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Room Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Length
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Width
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Height
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room, index) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                        placeholder="e.g., Landing, Kitchen"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={room.length_ft}
                            onChange={(e) => updateRoom(room.id, 'length_ft', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">ft</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={room.length_in}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val >= 0 && val <= 11) {
                                updateRoom(room.id, 'length_in', val);
                              }
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">in</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={room.width_ft}
                            onChange={(e) => updateRoom(room.id, 'width_ft', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">ft</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={room.width_in}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val >= 0 && val <= 11) {
                                updateRoom(room.id, 'width_in', val);
                              }
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">in</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={room.height_ft}
                            onChange={(e) => updateRoom(room.id, 'height_ft', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">ft</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={room.height_in}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val >= 0 && val <= 11) {
                                updateRoom(room.id, 'height_in', val);
                              }
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 text-sm">in</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeRoom(room.id)}
                        disabled={rooms.length === 1}
                        className={`p-2 rounded-md transition-colors ${
                          rooms.length === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                        title="Remove Room"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addRoom}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} />
            <span>Add Another Room</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
          >
            Calculate Estimate
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;

