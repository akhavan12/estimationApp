import React from 'react';

const DimensionInput = ({ length_ft, length_in, width_ft, width_in, onDimensionsChange }) => {
  const updateDimension = (field, value) => {
    const numValue = parseInt(value) || 0;
    onDimensionsChange({ [field]: numValue });
  };

  const handleInchesChange = (field, value) => {
    const val = parseInt(value) || 0;
    if (val >= 0 && val <= 11) {
      onDimensionsChange({ [field]: val });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Length Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Length
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={length_ft}
                onChange={(e) => updateDimension('length_ft', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-sm">ft</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="11"
                value={length_in}
                onChange={(e) => handleInchesChange('length_in', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-sm">in</span>
            </div>
          </div>
        </div>

        {/* Width Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={width_ft}
                onChange={(e) => updateDimension('width_ft', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-sm">ft</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="11"
                value={width_in}
                onChange={(e) => handleInchesChange('width_in', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 text-sm">in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Total Dimensions */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Total Dimensions: </span>
          <span className="font-semibold text-gray-800">
            {length_ft}' {length_in}" × {width_ft}' {width_in}"
          </span>
        </div>
      </div>
    </div>
  );
};

export default DimensionInput;

