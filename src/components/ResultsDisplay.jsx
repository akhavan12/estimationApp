import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ResultsDisplay = ({ results, onReset }) => {
  const formatArea = (area) => {
    return `${area.toLocaleString()} sq ft`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              Estimate Results
            </h2>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>New Estimate</span>
          </button>
        </div>

        {/* Room Details */}
        <div className="space-y-6 mb-8">
          {results.rooms.map((room, index) => (
            <div
              key={room.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {room.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Dimensions
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      Length: {room.dimensions.length.feet}' {room.dimensions.length.inches}" 
                      ({room.dimensions.length.decimal} ft)
                    </p>
                    <p>
                      Width: {room.dimensions.width.feet}' {room.dimensions.width.inches}" 
                      ({room.dimensions.width.decimal} ft)
                    </p>
                    <p>
                      Height: {room.dimensions.height.feet}' {room.dimensions.height.inches}" 
                      ({room.dimensions.height.decimal} ft)
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Areas
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>Floor Area: {formatArea(room.areas.floor_area)}</p>
                    <p>Ceiling Area: {formatArea(room.areas.ceiling_area)}</p>
                    <p>Wall Area: {formatArea(room.areas.wall_area)}</p>
                    <p className="font-semibold text-gray-800 pt-2 border-t border-gray-200">
                      Total Area: {formatArea(room.areas.total_area)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Total Summary ({results.room_count} {results.room_count === 1 ? 'Room' : 'Rooms'})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Floor Area</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatArea(results.totals.floor_area)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ceiling Area</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatArea(results.totals.ceiling_area)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Wall Area</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatArea(results.totals.wall_area)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Grand Total</p>
              <p className="text-xl font-bold text-blue-600">
                {formatArea(results.totals.total_area)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;

