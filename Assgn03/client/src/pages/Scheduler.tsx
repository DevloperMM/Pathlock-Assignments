import { useState } from 'react';
import { postSchedule } from '../api/scheduler';

export default function Scheduler() {
  const [tasks, setTasks] = useState([
    { title: '', estimatedHours: 1, dueDate: '', dependencies: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (idx: number, field: string, value: string) => {
    const copy = [...tasks];
    // For dependencies, split value by comma
    copy[idx][field] = field === 'dependencies'
      ? value
      : value;
    setTasks(copy);
  };

  const handleAdd = () => setTasks([...tasks, { title: '', estimatedHours: 1, dueDate: '', dependencies: '' }]);
  const handleRemove = (idx: number) => setTasks(tasks.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);

    try {
      // Map dependencies from string to array
      const tasksInput = tasks.map(t => ({
        ...t,
        estimatedHours: Number(t.estimatedHours),
        dependencies: t.dependencies.split(',').map(x => x.trim()).filter(Boolean),
        dueDate: t.dueDate
      }));
      const res = await postSchedule('demo', tasksInput);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1>Smart Scheduler</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.map((t, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }}>
            <input
              style={inputStyle}
              placeholder="Task Title"
              value={t.title}
              required
              onChange={e => handleChange(idx, 'title', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Estimated Hours"
              type="number"
              min={1}
              value={t.estimatedHours}
              required
              onChange={e => handleChange(idx, 'estimatedHours', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Due Date"
              type="date"
              value={t.dueDate}
              required
              onChange={e => handleChange(idx, 'dueDate', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Dependencies (comma separated task titles)"
              value={t.dependencies}
              onChange={e => handleChange(idx, 'dependencies', e.target.value)}
            />
            {tasks.length > 1 && (
              <button type="button" onClick={() => handleRemove(idx)} style={removeBtnStyle}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAdd} style={addBtnStyle}>+ Add Task</button>
        <button type="submit" disabled={loading} style={submitBtnStyle}>
          {loading ? 'Calculating...' : 'Get Schedule'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {loading && <div style={{ marginTop: 16 }}>Loading...</div>}
      {result && (
        <div style={{ marginTop: 16, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <b>{result.message}</b>
          <pre>
            {JSON.stringify(result.recommendedOrder, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: 8, margin: '4px 0', borderRadius: 4, border: '1px solid #ccc' };
const addBtnStyle = { margin: '8px 0', padding: 8, borderRadius: 4, border: 'none', background: '#2196f3', color: 'white' };
const submitBtnStyle = { padding: 10, borderRadius: 4, background: '#4caf50', color: 'white', border: 'none' };
const removeBtnStyle = { padding: 4, background: '#f44336', color: 'white', border: 'none', borderRadius: 4, float: 'right' };
