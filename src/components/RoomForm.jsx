import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const RoomForm = ({ onSubmit, apiPort = 5001 }) => {
  const [roomNames, setRoomNames] = useState([]);

  useEffect(() => {
    // Fetch room names from API
    const fetchRoomNames = async () => {
      try {
        const response = await fetch(`http://localhost:${apiPort}/api/room-names`);
        if (response.ok) {
          const data = await response.json();
          setRoomNames(data.room_names || []);
        }
      } catch (error) {
        console.error('Error fetching room names:', error);
        // Fallback to default list if API fails
        setRoomNames([
          'Bedroom', 'Kitchen', 'Living Room', 'Dining Room', 'Bathroom',
          'Master Bedroom', 'Master Bathroom', 'Office', 'Basement', 'Garage',
          'Electrical Room', 'Under Stairs', 'Craft Room', 'Sport Room', 'Other'
        ]);
      }
    };
    fetchRoomNames();
  }, [apiPort]);
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: '',
      customName: '',
      length_ft: 0,
      length_in: 0,
      width_ft: 0,
      width_in: 0,
      height_ft: 8,
      height_in: 0,
      door_count: 0,
      manual_items: [],
    },
  ]);

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: '',
      customName: '',
      length_ft: 0,
      length_in: 0,
      width_ft: 0,
      width_in: 0,
      height_ft: 8,
      height_in: 0,
      door_count: 0,
      manual_items: [],
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
      rooms.map((room) => {
        if (room.id === id) {
          // Handle name and customName fields as string, others as numbers
          if (field === 'name' || field === 'customName') {
            return { ...room, [field]: value };
          } else {
            return { ...room, [field]: parseInt(value) || 0 };
          }
        }
        return room;
      })
    );
  };

  const addManualItem = (roomId) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const newItem = {
            id: Date.now(),
            description: '',
            qty: 1,
            unit: 'EA',
            unit_cost: 0,
          };
          return {
            ...room,
            manual_items: [...(room.manual_items || []), newItem],
          };
        }
        return room;
      })
    );
  };

  const removeManualItem = (roomId, itemId) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            manual_items: (room.manual_items || []).filter((item) => item.id !== itemId),
          };
        }
        return room;
      })
    );
  };

  const updateManualItem = (roomId, itemId, field, value) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            manual_items: (room.manual_items || []).map((item) => {
              if (item.id === itemId) {
                if (field === 'description') {
                  return { ...item, [field]: value };
                } else if (field === 'unit') {
                  return { ...item, [field]: value };
                } else {
                  return { ...item, [field]: parseFloat(value) || 0 };
                }
              }
              return item;
            }),
          };
        }
        return room;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // Clean up the data before submitting (remove id fields from manual_items)
      const cleanedRooms = rooms.map((room) => ({
        name: room.name === 'Other' ? (room.customName || 'Other') : room.name,
        length_ft: room.length_ft,
        length_in: room.length_in,
        width_ft: room.width_ft,
        width_in: room.width_in,
        height_ft: room.height_ft,
        height_in: room.height_in,
        door_count: room.door_count || 0,
        manual_items: (room.manual_items || []).map((item) => ({
          description: item.description,
          qty: item.qty,
          unit: item.unit,
          unit_cost: item.unit_cost,
        })),
      }));
      onSubmit(cleanedRooms);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Input Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {rooms.map((room, roomIndex) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Room Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Room {roomIndex + 1}
              </h3>
              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove Room"
                >
                  <Trash2 size={16} />
                  <span className="text-sm">Remove Room</span>
                </button>
              )}
            </div>

            {/* Room Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <select
                  value={room.name}
                  onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room...</option>
                  {roomNames.map((roomName) => (
                    <option key={roomName} value={roomName}>
                      {roomName}
                    </option>
                  ))}
                </select>
                {room.name === 'Other' && (
                  <input
                    type="text"
                    value={room.customName || ''}
                    onChange={(e) => updateRoom(room.id, 'customName', e.target.value)}
                    placeholder="Enter custom room name"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={room.name === 'Other'}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
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
              </div>
            </div>

            {/* Door Count */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Door Count
              </label>
              <input
                type="number"
                min="0"
                value={room.door_count || 0}
                onChange={(e) => updateRoom(room.id, 'door_count', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Manual Items Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-700">Manual Line Items</h4>
                <button
                  type="button"
                  onClick={() => addManualItem(room.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Item</span>
                </button>
              </div>

              {room.manual_items && room.manual_items.length > 0 ? (
                <div className="space-y-3">
                  {room.manual_items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md">
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateManualItem(room.id, item.id, 'description', e.target.value)}
                          placeholder="e.g., Install Sink"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.qty}
                          onChange={(e) => updateManualItem(room.id, item.id, 'qty', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateManualItem(room.id, item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SF">SF</option>
                          <option value="LF">LF</option>
                          <option value="EA">EA</option>
                          <option value="SY">SY</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit Cost ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateManualItem(room.id, item.id, 'unit_cost', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeManualItem(room.id, item.id)}
                          className="w-full p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No manual items added. Click "Add Item" to add custom line items.</p>
              )}
            </div>
          </div>
        ))}

        {/* Form Actions */}
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
