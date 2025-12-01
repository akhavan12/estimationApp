import React, { useState, useRef, useEffect } from 'react';

const GRID_SIZE = 20; // 1 foot = 20px
const MIN_SIZE = 1; // Minimum 1 foot

const RoomVisualizer = ({ length_ft, length_in, width_ft, width_in, onDimensionsChange }) => {
  const containerRef = useRef(null);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isDraggingBottom, setIsDraggingBottom] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ length: 0, width: 0 });

  // Convert feet and inches to total feet
  const lengthTotal = length_ft + length_in / 12;
  const widthTotal = width_ft + width_in / 12;

  // Convert to pixels for display
  const lengthPx = lengthTotal * GRID_SIZE;
  const widthPx = widthTotal * GRID_SIZE;

  // Calculate grid dimensions (show at least 20x20 feet, or room size + padding)
  const gridWidth = Math.max(20, Math.ceil(widthTotal) + 2) * GRID_SIZE;
  const gridHeight = Math.max(20, Math.ceil(lengthTotal) + 2) * GRID_SIZE;

  // Center the room in the grid
  const roomX = (gridWidth - widthPx) / 2;
  const roomY = (gridHeight - lengthPx) / 2;

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (handle === 'right') {
      setIsDraggingRight(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartDimensions({ length: lengthTotal, width: widthTotal });
    } else if (handle === 'bottom') {
      setIsDraggingBottom(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartDimensions({ length: lengthTotal, width: widthTotal });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRight && !isDraggingBottom) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (isDraggingRight) {
        // Calculate new width based on horizontal drag
        const deltaFeet = deltaX / GRID_SIZE;
        const newWidth = Math.max(MIN_SIZE, startDimensions.width + deltaFeet);
        
        // Convert to feet and inches
        const newWidthFt = Math.floor(newWidth);
        let newWidthIn = Math.round((newWidth - newWidthFt) * 12);
        
        // Handle overflow (if inches >= 12, add to feet)
        if (newWidthIn >= 12) {
          newWidthFt += Math.floor(newWidthIn / 12);
          newWidthIn = newWidthIn % 12;
        }
        
        onDimensionsChange({
          width_ft: newWidthFt,
          width_in: newWidthIn < 0 ? 0 : newWidthIn,
        });
      }

      if (isDraggingBottom) {
        // Calculate new length based on vertical drag
        const deltaFeet = deltaY / GRID_SIZE;
        const newLength = Math.max(MIN_SIZE, startDimensions.length + deltaFeet);
        
        // Convert to feet and inches
        const newLengthFt = Math.floor(newLength);
        let newLengthIn = Math.round((newLength - newLengthFt) * 12);
        
        // Handle overflow (if inches >= 12, add to feet)
        if (newLengthIn >= 12) {
          newLengthFt += Math.floor(newLengthIn / 12);
          newLengthIn = newLengthIn % 12;
        }
        
        onDimensionsChange({
          length_ft: newLengthFt,
          length_in: newLengthIn < 0 ? 0 : newLengthIn,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingRight(false);
      setIsDraggingBottom(false);
    };

    if (isDraggingRight || isDraggingBottom) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingRight, isDraggingBottom, dragStart, startDimensions, onDimensionsChange]);

  const formatDimension = (feet, inches) => {
    if (feet === 0 && inches === 0) return '0\' 0"';
    return `${feet}' ${inches}"`;
  };

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Length: </span>
            <span className="font-semibold text-gray-800">
              {formatDimension(length_ft, length_in)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Width: </span>
            <span className="font-semibold text-gray-800">
              {formatDimension(width_ft, width_in)}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden"
        style={{
          width: '100%',
          height: '500px',
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: '0 0',
        }}
      >
        {/* Room Rectangle */}
        <div
          className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 cursor-move"
          style={{
            left: `${roomX}px`,
            top: `${roomY}px`,
            width: `${widthPx}px`,
            height: `${lengthPx}px`,
            minWidth: `${MIN_SIZE * GRID_SIZE}px`,
            minHeight: `${MIN_SIZE * GRID_SIZE}px`,
          }}
        >
          {/* Dimension Display in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-90 px-3 py-1 rounded shadow text-sm font-semibold text-gray-800">
              {formatDimension(length_ft, length_in)} × {formatDimension(width_ft, width_in)}
            </div>
          </div>

          {/* Right Handle */}
          <div
            className="absolute top-0 right-0 w-4 h-full bg-blue-500 cursor-ew-resize hover:bg-blue-600 transition-colors"
            style={{
              transform: 'translateX(50%)',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded"></div>
          </div>

          {/* Bottom Handle */}
          <div
            className="absolute bottom-0 left-0 w-full h-4 bg-blue-500 cursor-ns-resize hover:bg-blue-600 transition-colors"
            style={{
              transform: 'translateY(50%)',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-white rounded"></div>
          </div>
        </div>

        {/* Grid Labels (optional - show every 5 feet) */}
        {Array.from({ length: Math.ceil(gridWidth / GRID_SIZE / 5) }).map((_, i) => (
          <div
            key={`x-${i}`}
            className="absolute text-xs text-gray-400"
            style={{
              left: `${i * 5 * GRID_SIZE}px`,
              top: '5px',
            }}
          >
            {i * 5}'
          </div>
        ))}
        {Array.from({ length: Math.ceil(gridHeight / GRID_SIZE / 5) }).map((_, i) => (
          <div
            key={`y-${i}`}
            className="absolute text-xs text-gray-400"
            style={{
              left: '5px',
              top: `${i * 5 * GRID_SIZE}px`,
            }}
          >
            {i * 5}'
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">💡 <strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Drag the <span className="font-semibold">right handle</span> to adjust width</li>
          <li>Drag the <span className="font-semibold">bottom handle</span> to adjust length</li>
          <li>Each grid square represents 1 foot</li>
        </ul>
      </div>
    </div>
  );
};

export default RoomVisualizer;

