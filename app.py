from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend


def to_decimal_feet(feet, inches):
    """
    Convert feet and inches to decimal feet.
    
    Args:
        feet (int): Number of feet
        inches (int): Number of inches (0-11)
    
    Returns:
        float: Total length in decimal feet
    """
    return feet + (inches / 12.0)


def calculate_room_areas(length_ft, width_ft, height_ft):
    """
    Calculate wall area, floor area, and ceiling area for a room.
    
    Args:
        length_ft (float): Room length in decimal feet
        width_ft (float): Room width in decimal feet
        height_ft (float): Room height in decimal feet
    
    Returns:
        dict: Dictionary containing calculated areas
    """
    # Floor area (length × width)
    floor_area = length_ft * width_ft
    
    # Ceiling area (same as floor area)
    ceiling_area = floor_area
    
    # Wall area (perimeter × height)
    # Perimeter = 2 × (length + width)
    perimeter = 2 * (length_ft + width_ft)
    wall_area = perimeter * height_ft
    
    return {
        'floor_area': round(floor_area, 2),
        'ceiling_area': round(ceiling_area, 2),
        'wall_area': round(wall_area, 2),
        'total_area': round(floor_area + ceiling_area + wall_area, 2)
    }


@app.route('/api/calculate', methods=['POST'])
def calculate_estimate():
    """
    Calculate estimate for multiple rooms.
    
    Expected JSON payload:
    [
        {
            "id": 1,
            "name": "Landing",
            "width_ft": 4, "width_in": 5,
            "length_ft": 4, "length_in": 7,
            "height_ft": 8, "height_in": 0
        },
        ...
    ]
    """
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid payload. Expected an array of rooms.'}), 400
        
        if len(data) == 0:
            return jsonify({'error': 'At least one room is required.'}), 400
        
        results = []
        total_floor_area = 0
        total_ceiling_area = 0
        total_wall_area = 0
        total_area = 0
        
        for room in data:
            # Validate required fields
            required_fields = ['name', 'length_ft', 'length_in', 'width_ft', 'width_in', 'height_ft', 'height_in']
            if not all(field in room for field in required_fields):
                return jsonify({
                    'error': f'Room "{room.get("name", "Unknown")}" is missing required fields.'
                }), 400
            
            # Convert to decimal feet
            length_decimal = to_decimal_feet(room['length_ft'], room['length_in'])
            width_decimal = to_decimal_feet(room['width_ft'], room['width_in'])
            height_decimal = to_decimal_feet(room['height_ft'], room['height_in'])
            
            # Calculate areas
            areas = calculate_room_areas(length_decimal, width_decimal, height_decimal)
            
            # Build result for this room
            room_result = {
                'id': room.get('id'),
                'name': room['name'],
                'dimensions': {
                    'length': {
                        'feet': room['length_ft'],
                        'inches': room['length_in'],
                        'decimal': round(length_decimal, 2)
                    },
                    'width': {
                        'feet': room['width_ft'],
                        'inches': room['width_in'],
                        'decimal': round(width_decimal, 2)
                    },
                    'height': {
                        'feet': room['height_ft'],
                        'inches': room['height_in'],
                        'decimal': round(height_decimal, 2)
                    }
                },
                'areas': areas
            }
            
            results.append(room_result)
            
            # Accumulate totals
            total_floor_area += areas['floor_area']
            total_ceiling_area += areas['ceiling_area']
            total_wall_area += areas['wall_area']
            total_area += areas['total_area']
        
        # Return comprehensive results
        response = {
            'rooms': results,
            'totals': {
                'floor_area': round(total_floor_area, 2),
                'ceiling_area': round(total_ceiling_area, 2),
                'wall_area': round(total_wall_area, 2),
                'total_area': round(total_area, 2)
            },
            'room_count': len(results)
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Estimation API is running'}), 200


if __name__ == '__main__':
    import os
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')

