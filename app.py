from flask import Flask, request, jsonify
from flask_cors import CORS
import database

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Predefined room names
ROOM_NAMES = [
    "Bedroom",
    "Kitchen",
    "Living Room",
    "Dining Room",
    "Bathroom",
    "Master Bedroom",
    "Master Bathroom",
    "Guest Bedroom",
    "Guest Bathroom",
    "Office",
    "Study",
    "Library",
    "Family Room",
    "Den",
    "Basement",
    "Attic",
    "Garage",
    "Laundry Room",
    "Mud Room",
    "Pantry",
    "Closet",
    "Walk-in Closet",
    "Hallway",
    "Foyer",
    "Entryway",
    "Stairway",
    "Under Stairs",
    "Electrical Room",
    "Mechanical Room",
    "Utility Room",
    "Craft Room",
    "Sport Room",
    "Game Room",
    "Home Theater",
    "Wine Cellar",
    "Sunroom",
    "Porch",
    "Deck",
    "Patio",
    "Other"
]

# Material Library - Standard items with unit costs
MATERIAL_LIBRARY = {
    "Lifeproof Vinyl": {
        "unit_cost": 3.97,
        "unit": "SF",
        "applies_to": "floor_area"
    },
    "Vinyl Pad": {
        "unit_cost": 0.63,
        "unit": "SF",
        "applies_to": "floor_area"
    },
    "Paint Walls (1 coat)": {
        "unit_cost": 1.12,
        "unit": "SF",
        "applies_to": "wall_area"
    },
    "Baseboard (5 1/4 inch)": {
        "unit_cost": 8.37,
        "unit": "LF",
        "applies_to": "floor_perimeter"
    },
    "Paint Baseboard": {
        "unit_cost": 2.43,
        "unit": "LF",
        "applies_to": "floor_perimeter"
    },
    "1/2 in Drywall": {
        "unit_cost": 3.31,
        "unit": "SF",
        "applies_to": "wall_area"
    },
    "Interior Door Install": {
        "unit_cost": 345.46,
        "unit": "EA",
        "applies_to": "door_count"
    }
}


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


def calculate_room_geometry(length_ft, width_ft, height_ft):
    """
    Calculate geometric properties of a room.
    
    Args:
        length_ft (float): Room length in decimal feet
        width_ft (float): Room width in decimal feet
        height_ft (float): Room height in decimal feet
    
    Returns:
        dict: Dictionary containing calculated geometry
    """
    # Floor area (length × width)
    floor_area = length_ft * width_ft
    
    # Ceiling area (same as floor area)
    ceiling_area = floor_area
    
    # Wall area (perimeter × height)
    # Perimeter = 2 × (length + width)
    floor_perimeter = 2 * (length_ft + width_ft)
    wall_area = floor_perimeter * height_ft
    
    return {
        'floor_area': round(floor_area, 2),
        'ceiling_area': round(ceiling_area, 2),
        'wall_area': round(wall_area, 2),
        'floor_perimeter': round(floor_perimeter, 2)
    }


def calculate_cost(qty, unit_cost):
    """
    Calculate cost breakdown for a line item.
    
    Args:
        qty (float): Quantity
        unit_cost (float): Cost per unit
    
    Returns:
        dict: Dictionary containing base, tax, op, and rcv
    """
    base = qty * unit_cost
    tax = base * 0.07  # 7% tax
    op = base * 0.20   # 20% Overhead & Profit
    rcv = base + tax + op  # Replacement Cost Value
    
    return {
        'base': round(base, 2),
        'tax': round(tax, 2),
        'op': round(op, 2),
        'rcv': round(rcv, 2)
    }


def generate_standard_items(geometry, door_count):
    """
    Generate standard line items based on room geometry and door count.
    
    Args:
        geometry (dict): Room geometry (floor_area, wall_area, floor_perimeter)
        door_count (int): Number of doors
    
    Returns:
        list: List of standard line items with costs
    """
    standard_items = []
    
    for item_name, item_data in MATERIAL_LIBRARY.items():
        applies_to = item_data['applies_to']
        unit_cost = item_data['unit_cost']
        unit = item_data['unit']
        
        # Determine quantity based on what the item applies to
        if applies_to == 'floor_area':
            qty = geometry['floor_area']
        elif applies_to == 'wall_area':
            qty = geometry['wall_area']
        elif applies_to == 'floor_perimeter':
            qty = geometry['floor_perimeter']
        elif applies_to == 'door_count':
            qty = door_count
        else:
            continue  # Skip if applies_to is not recognized
        
        # Skip items with zero quantity
        if qty == 0:
            continue
        
        # Calculate costs
        costs = calculate_cost(qty, unit_cost)
        
        standard_items.append({
            'description': item_name,
            'qty': round(qty, 2),
            'unit': unit,
            'unit_cost': unit_cost,
            'base': costs['base'],
            'tax': costs['tax'],
            'op': costs['op'],
            'rcv': costs['rcv']
        })
    
    return standard_items


@app.route('/api/room-names', methods=['GET'])
def get_room_names():
    """Get list of predefined room names."""
    return jsonify({'room_names': ROOM_NAMES}), 200


@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects."""
    try:
        projects = database.get_all_projects()
        return jsonify({'projects': projects}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project."""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        
        if not name:
            return jsonify({'error': 'Project name is required.'}), 400
        
        project_id = database.create_project(name, description)
        project = database.get_project(project_id)
        
        return jsonify({'project': project}), 201
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project."""
    try:
        project = database.get_project(project_id)
        if not project:
            return jsonify({'error': 'Project not found.'}), 404
        return jsonify({'project': project}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project."""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        
        database.update_project(project_id, name, description)
        project = database.get_project(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found.'}), 404
        
        return jsonify({'project': project}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project."""
    try:
        database.delete_project(project_id)
        return jsonify({'message': 'Project deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects/<int:project_id>/estimates', methods=['GET'])
def get_estimates(project_id):
    """Get all estimates for a project."""
    try:
        estimates = database.get_project_estimates(project_id)
        return jsonify({'estimates': estimates}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/projects/<int:project_id>/estimates/latest', methods=['GET'])
def get_latest_estimate(project_id):
    """Get the most recent estimate for a project."""
    try:
        estimate = database.get_latest_estimate(project_id)
        if not estimate:
            return jsonify({'error': 'No estimates found for this project.'}), 404
        return jsonify({'estimate': estimate}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/calculate', methods=['POST'])
def calculate_estimate():
    """
    Calculate renovation estimate for multiple rooms.
    Optionally save to database if project_id is provided.
    
    Expected JSON payload:
    {
        "rooms": [...],
        "project_id": 1 (optional),
        "save": true (optional)
    }
    """
    try:
        data = request.get_json()
        
        # Handle both old format (array) and new format (object with rooms)
        if isinstance(data, list):
            rooms = data
            project_id = None
            save = False
        else:
            rooms = data.get('rooms', [])
            project_id = data.get('project_id')
            save = data.get('save', False)
        
        if not rooms or not isinstance(rooms, list):
            return jsonify({'error': 'Invalid payload. Expected an array of rooms.'}), 400
        
        if len(rooms) == 0:
            return jsonify({'error': 'At least one room is required.'}), 400
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid payload. Expected an array of rooms.'}), 400
        
        if len(data) == 0:
            return jsonify({'error': 'At least one room is required.'}), 400
        
        results = []
        project_totals = {
            'base': 0,
            'tax': 0,
            'op': 0,
            'rcv': 0
        }
        
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
            
            # Calculate geometry
            geometry = calculate_room_geometry(length_decimal, width_decimal, height_decimal)
            
            # Get door count (default to 0)
            door_count = room.get('door_count', 0)
            
            # Generate standard items
            standard_items = generate_standard_items(geometry, door_count)
            
            # Process manual items
            manual_items = []
            for manual_item in room.get('manual_items', []):
                qty = float(manual_item.get('qty', 0))
                unit_cost = float(manual_item.get('unit_cost', 0))
                costs = calculate_cost(qty, unit_cost)
                
                manual_items.append({
                    'description': manual_item.get('description', ''),
                    'qty': round(qty, 2),
                    'unit': manual_item.get('unit', 'EA'),
                    'unit_cost': round(unit_cost, 2),
                    'base': costs['base'],
                    'tax': costs['tax'],
                    'op': costs['op'],
                    'rcv': costs['rcv']
                })
            
            # Merge standard and manual items
            line_items = standard_items + manual_items
            
            # Calculate room totals
            room_totals = {
                'base': sum(item['base'] for item in line_items),
                'tax': sum(item['tax'] for item in line_items),
                'op': sum(item['op'] for item in line_items),
                'rcv': sum(item['rcv'] for item in line_items)
            }
            
            # Round room totals
            room_totals = {k: round(v, 2) for k, v in room_totals.items()}
            
            # Accumulate project totals
            project_totals['base'] += room_totals['base']
            project_totals['tax'] += room_totals['tax']
            project_totals['op'] += room_totals['op']
            project_totals['rcv'] += room_totals['rcv']
            
            # Build result for this room
            room_result = {
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
                'geometry': geometry,
                'door_count': door_count,
                'line_items': line_items,
                'totals': room_totals
            }
            
            results.append(room_result)
        
        # Round project totals
        project_totals = {k: round(v, 2) for k, v in project_totals.items()}
        
        # Build response
        response = {
            'rooms': results,
            'project_totals': project_totals,
            'room_count': len(results)
        }
        
        # Save to database if requested
        if save and project_id:
            try:
                estimate_id = database.save_estimate(project_id, response)
                response['estimate_id'] = estimate_id
                response['saved'] = True
            except Exception as e:
                # Don't fail the request if save fails, just log it
                response['save_error'] = str(e)
                response['saved'] = False
        
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
