import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import RoomEditor from './RoomEditor';

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
      age: 0,
      condition: 'Average',
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
      age: 0,
      condition: 'Average',
      manual_items: [],
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  const updateRoom = (updatedRoom) => {
    setRooms(
      rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
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
            markup: true,  // Default to applying O&P
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
        age: room.age || 0,
        condition: room.condition || 'Average',
        manual_items: (room.manual_items || []).map((item) => ({
          description: item.description,
          qty: item.qty,
          unit: item.unit,
          unit_cost: item.unit_cost,
          markup: item.markup !== false,  // Default to True if not specified
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
          <div key={room.id} className="mb-6">
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

            {/* Room Editor with Tabs */}
            <RoomEditor
              room={room}
              onRoomUpdate={updateRoom}
              roomNames={roomNames}
              onManualItemAdd={addManualItem}
              onManualItemRemove={removeManualItem}
              onManualItemUpdate={updateManualItem}
            />
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
