import React, { useState, useEffect } from 'react';
import { FolderPlus, FolderOpen, Trash2, Plus, X } from 'lucide-react';

const ProjectManager = ({ onProjectSelect, selectedProjectId, apiPort }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`http://localhost:${apiPort}/api/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch(`http://localhost:${apiPort}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadProjects();
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDescription('');
        // Auto-select the new project
        if (onProjectSelect) {
          onProjectSelect(data.project);
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All estimates will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:${apiPort}/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProjects();
        // If deleted project was selected, clear selection
        if (selectedProjectId === projectId && onProjectSelect) {
          onProjectSelect(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onProjectSelect && onProjectSelect(project)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProjectId === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FolderOpen
                      size={20}
                      className={selectedProjectId === project.id ? 'text-blue-600' : 'text-gray-400'}
                    />
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {formatDate(project.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Smith Residence Renovation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Add a description for this project..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;

