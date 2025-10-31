import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { Project, Task } from '../types';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [scheduleHours, setScheduleHours] = useState('');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleResult, setScheduleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.getById(Number(id));
      setProject(data);
    } catch (err) {
      alert('Failed to load project');
      navigate('/dashboard');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectsAPI.createTask(Number(id), {
        title: taskTitle,
        dueDate: taskDueDate || undefined,
      });
      setTaskTitle('');
      setTaskDueDate('');
      setShowTaskModal(false);
      loadProject();
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await projectsAPI.updateTask(Number(id), task.id, {
        ...task,
        isCompleted: !task.isCompleted,
      });
      loadProject();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Delete this task?')) {
      try {
        await projectsAPI.deleteTask(Number(id), taskId);
        loadProject();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await projectsAPI.scheduleTasks(Number(id), {
        totalHoursAvailable: Number(scheduleHours),
        startDate: scheduleStart,
      });
      setScheduleResult(result);
    } catch (err) {
      alert('Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <div>
          <h1>{project.title}</h1>
          <p style={styles.description}>{project.description}</p>
          <p style={styles.date}>
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={() => setShowTaskModal(true)} style={styles.addTaskBtn}>
          + Add Task
        </button>
        <button onClick={() => setShowScheduleModal(true)} style={styles.scheduleBtn}>
          🗓️ Smart Schedule
        </button>
      </div>

      <div style={styles.tasksSection}>
        <h2>Tasks ({project.tasks.length})</h2>
        {project.tasks.length === 0 ? (
          <p style={styles.emptyState}>No tasks yet. Add your first task!</p>
        ) : (
          <div style={styles.tasksList}>
            {project.tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskInfo}>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleUpdateTask(task)}
                    style={styles.checkbox}
                  />
                  <div>
                    <h3
                      style={{
                        ...styles.taskTitle,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </h3>
                    {task.dueDate && (
                      <p style={styles.dueDate}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={styles.deleteTaskBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Smart Scheduler</h2>
            <form onSubmit={handleSchedule}>
              <input
                type="number"
                placeholder="Total hours available"
                value={scheduleHours}
                onChange={(e) => setScheduleHours(e.target.value)}
                required
                min="1"
                style={styles.input}
              />
              <input
                type="date"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                required
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleResult(null);
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>

            {scheduleResult && (
              <div style={styles.scheduleResult}>
                <h3>{scheduleResult.message}</h3>
                {scheduleResult.scheduledTasks.map((st: any) => (
                  <div key={st.taskId} style={styles.scheduledTask}>
                    <strong>{st.title}</strong>
                    <p>
                      {new Date(st.suggestedStartDate).toLocaleString()} →{' '}
                      {new Date(st.suggestedEndDate).toLocaleString()}
                    </p>
                    <p>Estimated: {st.estimatedHours} hours</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  loading: { textAlign: 'center' as const, padding: '3rem', fontSize: '1.2rem' },
  backBtn: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' },
  header: { marginBottom: '2rem' },
  description: { color: '#666', marginTop: '0.5rem' },
  date: { color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' },
  actions: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  addTaskBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  scheduleBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  tasksSection: { marginTop: '2rem' },
  emptyState: { textAlign: 'center' as const, color: '#666', padding: '2rem' },
  tasksList: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  taskCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  taskInfo: { display: 'flex', gap: '1rem', alignItems: 'center' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  taskTitle: { margin: 0 },
  dueDate: { color: '#888', fontSize: '0.9rem', margin: '0.25rem 0 0 0' },
  deleteTaskBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '1rem' },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  submitBtn: { flex: 1, padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '0.75rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  scheduleResult: { marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' },
  scheduledTask: { padding: '1rem', backgroundColor: 'white', marginTop: '0.5rem', borderRadius: '4px' },
};
