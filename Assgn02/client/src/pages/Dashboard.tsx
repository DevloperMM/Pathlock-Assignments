import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import type { Project } from '../types';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await projectsAPI.create({ title, description });
      setTitle('');
      setDescription('');
      setShowModal(false);
      loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        loadProjects();
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Dashboard</h1>
        <div style={styles.userSection}>
          <span>Welcome, {user?.username}!</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          + Create New Project
        </button>
      </div>

      <div style={styles.projectsGrid}>
        {projects.length === 0 ? (
          <p style={styles.emptyState}>
            No projects yet. Create your first project!
          </p>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <h3>{project.title}</h3>
              <p style={styles.description}>{project.description || 'No description'}</p>
              <p style={styles.taskCount}>
                Tasks: {project.tasks.length} (
                {project.tasks.filter((t) => t.isCompleted).length} completed)
              </p>
              <div style={styles.cardActions}>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={styles.viewBtn}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              {error && <div style={styles.error}>{error}</div>}
              <input
                type="text"
                placeholder="Project Title (3-100 characters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                style={styles.input}
              />
              <textarea
                placeholder="Description (optional, max 500 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                style={styles.textarea}
              />
              <div style={styles.modalActions}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  userSection: { display: 'flex', gap: '1rem', alignItems: 'center' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  actions: { marginBottom: '2rem' },
  createBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  projectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center' as const, color: '#666', padding: '3rem' },
  projectCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  description: { color: '#666', marginTop: '0.5rem' },
  taskCount: { color: '#888', fontSize: '0.9rem', marginTop: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  viewBtn: { flex: 1, padding: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { flex: 1, padding: '0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '1rem' },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '1rem', minHeight: '100px' },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  submitBtn: { flex: 1, padding: '0.75rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '0.75rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginTop: '1rem' },
};
