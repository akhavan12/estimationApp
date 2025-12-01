# Estimation App

A full-stack application for calculating room area estimates for home insurance purposes. The app allows users to input multiple rooms with dimensions in feet and inches, and calculates floor area, ceiling area, wall area, and total area for each room.

## Features

- **Room Input Form**: Clean, user-friendly interface for entering room dimensions
- **Feet & Inches Input**: Separate input fields for feet and inches for each dimension
- **Multiple Rooms**: Add and remove multiple rooms in a single estimate
- **Real-time Calculations**: Backend calculates areas automatically
- **Auto Port Detection**: Server automatically finds an available port
- **RESTful API**: Clean API endpoints for calculations

## Project Structure

```
estimationApp/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── bin/
│   ├── start-server       # Bash script to start server
│   └── start-server.py    # Python script to start server (recommended)
└── src/
    └── components/
        └── RoomForm.jsx   # React component for room input form
```

## Prerequisites

- Python 3.7 or higher
- Node.js and npm (for React frontend)
- pip (Python package manager)

## Backend Setup

### 1. Create a Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Server

You can start the server using either script:

**Option A: Using Python script (Recommended)**
```bash
./bin/start-server.py
```

**Option B: Using Bash script**
```bash
./bin/start-server
```

**Option C: Manual start**
```bash
python app.py
```

The server will automatically find an available port starting from 5000. If port 5000 is in use, it will try 5001, 5002, etc.

The API will be available at `http://localhost:<port>` where `<port>` is the detected available port.

## Frontend Setup

### 1. Install Dependencies

If you're using this in a React project, make sure you have the required dependencies:

```bash
npm install lucide-react
```

### 2. Using the RoomForm Component

Import and use the `RoomForm` component in your React app:

```jsx
import RoomForm from './components/RoomForm';

function App() {
  const handleSubmit = async (rooms) => {
    try {
      const response = await fetch('http://localhost:5000/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate estimate');
      }
      
      const data = await response.json();
      console.log('Estimate results:', data);
      // Handle the results (display, redirect, etc.)
    } catch (error) {
      console.error('Error calculating estimate:', error);
      // Handle error (show notification, etc.)
    }
  };

  return <RoomForm onSubmit={handleSubmit} />;
}
```

**Note**: Make sure to update the API URL in the fetch call to match the port your Flask server is running on.

## API Documentation

### Base URL

```
http://localhost:<port>
```

The port is automatically detected (default: 5000).

### Endpoints

#### 1. Calculate Estimate

**POST** `/api/calculate`

Calculate area estimates for multiple rooms.

**Request Body:**
```json
[
  {
    "id": 1,
    "name": "Landing",
    "length_ft": 4,
    "length_in": 7,
    "width_ft": 4,
    "width_in": 5,
    "height_ft": 8,
    "height_in": 0
  },
  {
    "id": 2,
    "name": "Kitchen",
    "length_ft": 12,
    "length_in": 6,
    "width_ft": 10,
    "width_in": 3,
    "height_ft": 8,
    "height_in": 0
  }
]
```

**Response (200 OK):**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Landing",
      "dimensions": {
        "length": {
          "feet": 4,
          "inches": 7,
          "decimal": 4.58
        },
        "width": {
          "feet": 4,
          "inches": 5,
          "decimal": 4.42
        },
        "height": {
          "feet": 8,
          "inches": 0,
          "decimal": 8.0
        }
      },
      "areas": {
        "floor_area": 20.25,
        "ceiling_area": 20.25,
        "wall_area": 144.0,
        "total_area": 184.5
      }
    }
  ],
  "totals": {
    "floor_area": 20.25,
    "ceiling_area": 20.25,
    "wall_area": 144.0,
    "total_area": 184.5
  },
  "room_count": 1
}
```

**Error Responses:**

- **400 Bad Request**: Invalid payload or missing required fields
- **500 Internal Server Error**: Server error during calculation

#### 2. Health Check

**GET** `/api/health`

Check if the API is running.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "Estimation API is running"
}
```

## Room Data Structure

Each room object contains:

- `id` (number): Unique identifier for the room
- `name` (string): Room name (e.g., "Landing", "Kitchen")
- `length_ft` (number): Length in feet (min: 0)
- `length_in` (number): Length in inches (min: 0, max: 11)
- `width_ft` (number): Width in feet (min: 0)
- `width_in` (number): Width in inches (min: 0, max: 11)
- `height_ft` (number): Height in feet (min: 0, default: 8)
- `height_in` (number): Height in inches (min: 0, max: 11, default: 0)

## Calculations

The backend performs the following calculations for each room:

- **Floor Area**: `length × width` (in square feet)
- **Ceiling Area**: Same as floor area
- **Wall Area**: `perimeter × height` where `perimeter = 2 × (length + width)`
- **Total Area**: Sum of floor, ceiling, and wall areas

All dimensions are converted from feet and inches to decimal feet before calculation:
```
decimal_feet = feet + (inches / 12)
```

## Dependencies

### Backend
- **Flask** (3.0.0): Web framework
- **flask-cors** (4.0.0): Cross-Origin Resource Sharing support

### Frontend
- **React**: UI library
- **lucide-react**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

## Development

### Running in Development Mode

The Flask server runs in debug mode by default, which provides:
- Automatic reloading on code changes
- Detailed error messages
- Interactive debugger

### Port Management

The server scripts automatically detect available ports. If you need to specify a port manually:

```bash
export FLASK_PORT=5000
python app.py
```

## Troubleshooting

### Port Already in Use

If you see a port conflict error:
- The start scripts will automatically try the next available port
- Check which port the server is using in the startup message
- Update your frontend API URL to match the detected port

### CORS Issues

If you encounter CORS errors:
- Make sure `flask-cors` is installed
- Verify the Flask server is running
- Check that the frontend is making requests to the correct port

### Module Not Found Errors

If you see import errors:
- Make sure you're in a virtual environment
- Run `pip install -r requirements.txt`
- Verify you're using Python 3.7 or higher

## License

See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Author

Created for home insurance estimation purposes.
