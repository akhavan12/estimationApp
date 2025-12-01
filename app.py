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

# Pricing Database with Markup Flags (Xactimate Standard)
PRICING_DB = {
    # --- NO MARKUP ITEMS (Services/Labor only) ---
    "SVC_CON": {
        "desc": "Contents - move out then reset",
        "unit": "EA",
        "price": 134.29,
        "cat": "GEN",
        "waste": 0.0,
        "markup": False,
        "applies_to": None,  # Manual item only
        "life_expectancy": 0  # Not applicable
    },
    "ELC_HTR": {
        "desc": "Baseboard electric heater - Detach & reset",
        "unit": "EA",
        "price": 98.91,
        "cat": "ELC",
        "waste": 0.0,
        "markup": False,
        "applies_to": None,  # Manual item only
        "life_expectancy": 20
    },
    
    # --- STANDARD ITEMS (With Markup) ---
    "DRY_12": {
        "desc": "1/2\" Drywall - Hung, Taped, Texture",
        "unit": "SF",
        "price": 3.31,
        "cat": "DRY",
        "waste": 0.0,
        "markup": True,
        "applies_to": "wall_area",
        "life_expectancy": 50
    },
    "PNT_WL": {
        "desc": "Paint Walls (2 coats)",
        "unit": "SF",
        "price": 1.12,
        "cat": "PNT",
        "waste": 0.0,
        "markup": True,
        "applies_to": "wall_area",
        "life_expectancy": 5
    },
    "FLR_VNL": {
        "desc": "Lifeproof Vinyl Plank Flooring",
        "unit": "SF",
        "price": 3.97,
        "cat": "FCV",
        "waste": 0.15,
        "markup": True,
        "applies_to": "floor_area",
        "life_expectancy": 25
    },
    "FLR_PAD": {
        "desc": "Vinyl flooring pad - Standard grade",
        "unit": "SF",
        "price": 0.63,
        "cat": "FCV",
        "waste": 0.15,
        "markup": True,
        "applies_to": "floor_area",
        "life_expectancy": 10
    },
    "BSB_5": {
        "desc": "Baseboard - 5 1/4\" Stain Grade",
        "unit": "LF",
        "price": 8.37,
        "cat": "FNH",
        "waste": 0.10,
        "markup": True,
        "applies_to": "floor_perimeter",
        "life_expectancy": 30
    },
    "DOR_INT": {
        "desc": "Interior Door Unit - Detach & Reset",
        "unit": "EA",
        "price": 345.46,
        "cat": "DOR",
        "waste": 0.0,
        "markup": True,
        "applies_to": "door_count",
        "life_expectancy": 30
    },
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


def calculate_cost(qty, unit_cost, waste_factor=0.0, markup=True, age=0, life_expectancy=50):
    """
    Calculate professional cost breakdown for a line item (Xactimate standard).
    
    Args:
        qty (float): Base quantity (area, length, or count)
        unit_cost (float): Cost per unit
        waste_factor (float): Waste percentage (e.g., 0.15 for 15%)
        markup (bool): Whether to apply O&P markup (20%)
        age (int): Age of item in years
        life_expectancy (int): Expected life of item in years
    
    Returns:
        dict: Dictionary containing all cost breakdown values
    """
    # Step 1: Calculate quantity billed (with waste)
    quantity_billed = qty * (1 + waste_factor)
    
    # Step 2: Calculate base cost
    base_cost = quantity_billed * unit_cost
    
    # Step 3: Calculate tax (7%)
    tax = base_cost * 0.07
    
    # Step 4: Calculate overhead & profit (20% - conditional based on markup flag)
    if markup:
        overhead_profit = base_cost * 0.20
    else:
        overhead_profit = 0.00
    
    # Step 5: Calculate RCV (Replacement Cost Value)
    rcv_total = base_cost + tax + overhead_profit
    
    # Step 6: Calculate depreciation percentage (capped at 100%)
    if life_expectancy > 0:
        depreciation_pct = min(1.0, age / life_expectancy)
    else:
        depreciation_pct = 0.0
    
    # Step 7: Calculate ACV (Actual Cash Value)
    acv_total = rcv_total * (1 - depreciation_pct)
    
    return {
        'quantity': round(qty, 2),
        'quantity_billed': round(quantity_billed, 2),
        'unit_cost': round(unit_cost, 2),
        'base_cost': round(base_cost, 2),
        'tax': round(tax, 2),
        'overhead_profit': round(overhead_profit, 2),
        'rcv': round(rcv_total, 2),
        'depreciation_pct': round(depreciation_pct * 100, 2),  # As percentage
        'depreciation_amount': round(rcv_total * depreciation_pct, 2),
        'acv': round(acv_total, 2)
    }


def generate_standard_items(geometry, door_count, age=0, condition='Average'):
    """
    Generate standard line items based on room geometry and door count.
    
    Args:
        geometry (dict): Room geometry (floor_area, wall_area, floor_perimeter)
        door_count (int): Number of doors
        age (int): Age of room/items in years
        condition (str): Condition of room (Average, Good, Poor)
    
    Returns:
        list: List of standard line items with costs
    """
    standard_items = []
    
    for item_code, item_data in PRICING_DB.items():
        applies_to = item_data.get('applies_to')
        
        # Skip items that don't apply to geometry (manual items only)
        if applies_to is None:
            continue
        
        price = item_data['price']
        unit = item_data['unit']
        waste = item_data.get('waste', 0.0)
        markup = item_data.get('markup', True)
        life_expectancy = item_data.get('life_expectancy', 50)
        
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
        
        # Calculate costs with waste, markup, depreciation, and ACV
        costs = calculate_cost(qty, price, waste, markup, age, life_expectancy)
        
        standard_items.append({
            'code': item_code,
            'description': item_data['desc'],
            'qty': costs['quantity'],
            'qty_billed': costs['quantity_billed'],
            'unit': unit,
            'unit_cost': costs['unit_cost'],
            'base_cost': costs['base_cost'],
            'tax': costs['tax'],
            'op': costs['overhead_profit'],
            'rcv': costs['rcv'],
            'depreciation_pct': costs['depreciation_pct'],
            'depreciation_amount': costs['depreciation_amount'],
            'acv': costs['acv']
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
        
        results = []
        project_totals = {
            'base_cost': 0,
            'tax': 0,
            'op': 0,
            'rcv': 0,
            'depreciation_amount': 0,
            'acv': 0
        }
        
        for room in rooms:
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
            
            # Get age and condition (defaults)
            age = room.get('age', 0)
            condition = room.get('condition', 'Average')
            
            # Generate standard items with age and condition
            standard_items = generate_standard_items(geometry, door_count, age, condition)
            
            # Process manual items (use room age for manual items too)
            manual_items = []
            for manual_item in room.get('manual_items', []):
                qty = float(manual_item.get('qty', 0))
                unit_cost = float(manual_item.get('unit_cost', 0))
                markup = manual_item.get('markup', True)  # Default to True, but user can uncheck
                waste_factor = manual_item.get('waste_factor', 0.0)  # Allow custom waste
                # Manual items: default life expectancy of 20 years
                life_expectancy = manual_item.get('life_expectancy', 20)
                
                costs = calculate_cost(qty, unit_cost, waste_factor, markup, age, life_expectancy)
                
                manual_items.append({
                    'code': manual_item.get('code', 'MANUAL'),
                    'description': manual_item.get('description', ''),
                    'qty': costs['quantity'],
                    'qty_billed': costs['quantity_billed'],
                    'unit': manual_item.get('unit', 'EA'),
                    'unit_cost': costs['unit_cost'],
                    'base_cost': costs['base_cost'],
                    'tax': costs['tax'],
                    'op': costs['overhead_profit'],
                    'rcv': costs['rcv'],
                    'depreciation_pct': costs['depreciation_pct'],
                    'depreciation_amount': costs['depreciation_amount'],
                    'acv': costs['acv']
                })
            
            # Merge standard and manual items
            line_items = standard_items + manual_items
            
            # Calculate room totals
            room_totals = {
                'base_cost': sum(item.get('base_cost', 0) for item in line_items),
                'tax': sum(item.get('tax', 0) for item in line_items),
                'op': sum(item.get('op', 0) for item in line_items),
                'rcv': sum(item.get('rcv', 0) for item in line_items),
                'depreciation_amount': sum(item.get('depreciation_amount', 0) for item in line_items),
                'acv': sum(item.get('acv', 0) for item in line_items)
            }
            
            # Round room totals
            room_totals = {k: round(v, 2) for k, v in room_totals.items()}
            
            # Accumulate project totals
            project_totals['base_cost'] += room_totals['base_cost']
            project_totals['tax'] += room_totals['tax']
            project_totals['op'] += room_totals['op']
            project_totals['rcv'] += room_totals['rcv']
            project_totals['depreciation_amount'] += room_totals['depreciation_amount']
            project_totals['acv'] += room_totals['acv']
            
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
                'age': age,
                'condition': condition,
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
