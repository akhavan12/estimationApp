import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DimensionInput from './DimensionInput';
import RoomVisualizer from './RoomVisualizer';

const RoomEditor = ({
  room,
  onRoomUpdate,
  roomNames,
  onManualItemAdd,
  onManualItemRemove,
  onManualItemUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('dimensions');
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const handleDimensionsChange = (updates) => {
    // Merge updates with existing room dimensions
    const updatedRoom = {
      ...room,
      ...updates,
    };
    onRoomUpdate(updatedRoom);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Room Header */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Name *
          </label>
          <select
            value={room.name}
            onChange={(e) => onRoomUpdate({ ...room, name: e.target.value })}
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
              onChange={(e) => onRoomUpdate({ ...room, customName: e.target.value })}
              placeholder="Enter custom room name"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={room.name === 'Other'}
            />
          )}
        </div>

        {/* Height Input (always visible) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={room.height_ft}
                onChange={(e) =>
                  onRoomUpdate({ ...room, height_ft: parseInt(e.target.value) || 0 })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onRoomUpdate({ ...room, height_in: val });
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-sm">in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dimensions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dimensions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dimensions
            </button>
            <button
              onClick={() => setActiveTab('sketch')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sketch'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visual Sketch
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'dimensions' && (
          <DimensionInput
            length_ft={room.length_ft}
            length_in={room.length_in}
            width_ft={room.width_ft}
            width_in={room.width_in}
            onDimensionsChange={handleDimensionsChange}
          />
        )}

        {activeTab === 'sketch' && (
          <RoomVisualizer
            length_ft={room.length_ft}
            length_in={room.length_in}
            width_ft={room.width_ft}
            width_in={room.width_in}
            onDimensionsChange={handleDimensionsChange}
          />
        )}
      </div>

      {/* Door Count (always visible) */}
      <div className="mb-6 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Door Count
        </label>
        <input
          type="number"
          min="0"
          value={room.door_count || 0}
          onChange={(e) =>
            onRoomUpdate({ ...room, door_count: parseInt(e.target.value) || 0 })
          }
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Room Details Section (Collapsible) */}
      <div className="mb-6 border-t pt-4">
        <button
          type="button"
          onClick={() => setShowRoomDetails(!showRoomDetails)}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Room Details</h4>
            <p className="text-xs text-gray-500 mt-1">
              Age and condition for depreciation calculations
            </p>
          </div>
          {showRoomDetails ? (
            <ChevronUp className="text-gray-500" size={20} />
          ) : (
            <ChevronDown className="text-gray-500" size={20} />
          )}
        </button>

        {showRoomDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Age (Years)
              </label>
              <input
                type="number"
                min="0"
                value={room.age || 0}
                onChange={(e) =>
                  onRoomUpdate({ ...room, age: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Age of room/items for depreciation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                value={room.condition || 'Average'}
                onChange={(e) =>
                  onRoomUpdate({ ...room, condition: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Overall condition of the room
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Items Section (always visible) */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-700">Manual Line Items</h4>
          <button
            type="button"
            onClick={() => onManualItemAdd(room.id)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <span>+</span>
            <span>Add Item</span>
          </button>
        </div>

        {room.manual_items && room.manual_items.length > 0 ? (
          <div className="space-y-3">
            {room.manual_items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md"
              >
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      onManualItemUpdate(room.id, item.id, 'description', e.target.value)
                    }
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
                    onChange={(e) =>
                      onManualItemUpdate(room.id, item.id, 'qty', e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      onManualItemUpdate(room.id, item.id, 'unit', e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SF">SF</option>
                    <option value="LF">LF</option>
                    <option value="EA">EA</option>
                    <option value="SY">SY</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) =>
                      onManualItemUpdate(room.id, item.id, 'unit_cost', e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 h-full">
                    <input
                      type="checkbox"
                      checked={item.markup !== false}
                      onChange={(e) =>
                        onManualItemUpdate(room.id, item.id, 'markup', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Apply O&P?
                    </span>
                  </label>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => onManualItemRemove(room.id, item.id)}
                    className="w-full p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No manual items added. Click "Add Item" to add custom line items.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomEditor;

