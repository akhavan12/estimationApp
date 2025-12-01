import React, { useState } from 'react';
import RoomForm from './components/RoomForm';
import EstimateTable from './components/EstimateTable';
import ProjectManager from './components/ProjectManager';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiPort, setApiPort] = useState(5001); // Default to 5001, can be updated
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSubmit = async (rooms) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Try to detect the API port by checking health endpoint
      let port = apiPort;
      let healthCheck = false;
      
      // Try common ports
      for (let p of [5001, 5000, 5002, 5003]) {
        try {
          const healthResponse = await fetch(`http://localhost:${p}/api/health`);
          if (healthResponse.ok) {
            port = p;
            healthCheck = true;
            setApiPort(p);
            break;
          }
        } catch (e) {
          // Continue to next port
        }
      }

      if (!healthCheck) {
        throw new Error('Could not connect to API. Make sure the Flask server is running.');
      }

      // Prepare request payload with project_id if selected
      const payload = {
        rooms: rooms,
        project_id: selectedProject?.id || null,
        save: selectedProject ? true : false,
      };

      const response = await fetch(`http://localhost:${port}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate estimate');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred while calculating the estimate');
      console.error('Error calculating estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Home Insurance Estimation App
          </h1>
          <p className="text-gray-600">
            Generate renovation estimates with automatic material calculations
          </p>
        </header>

        {error && (
          <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 font-medium">Error: {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Project Manager */}
        <div className="max-w-6xl mx-auto mb-6">
          <ProjectManager
            onProjectSelect={setSelectedProject}
            selectedProjectId={selectedProject?.id}
            apiPort={apiPort}
          />
        </div>

        {selectedProject && (
          <div className="max-w-6xl mx-auto mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Project:</p>
                <p className="font-semibold text-gray-800">{selectedProject.name}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {!selectedProject && !results && (
          <div className="max-w-6xl mx-auto mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> Select or create a project to save your estimates to the database.
            </p>
          </div>
        )}

        {!results ? (
          <RoomForm onSubmit={handleSubmit} apiPort={apiPort} />
        ) : (
          <EstimateTable results={results} onReset={handleReset} />
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Calculating estimate...</span>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>API running on port: {apiPort}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

