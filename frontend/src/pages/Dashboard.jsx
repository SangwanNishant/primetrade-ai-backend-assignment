import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_COLORS = { low: 'var(--info)', medium: 'var(--warning)', high: 'var(--danger)' };
const NEXT_STATUS = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
const STATUS_BTN_LABEL = { todo: 'Start →', in_progress: 'Complete ✓', done: 'Reopen ↩' };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { addToast }      = useToast();

  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filters,     setFilters]     = useState({ status: '', priority: '', search: '' });
  const [showModal,   setShowModal]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);

  // ─── Fetch tasks ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority  = filters.priority;
      if (filters.search)   params.search    = filters.search;
      const res = await getTasks(params);
      setTasks(res.data.data.tasks);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ─── CRUD handlers ────────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    const res = await createTask(data);
    setTasks((prev) => [res.data.data.task, ...prev]);
    setShowModal(false);
    addToast('Task created!', 'success');
  };

  const handleUpdate = async (data) => {
    const res = await updateTask(editingTask.id, data);
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data.data.task : t)));
    setEditingTask(null);
    setShowModal(false);
    addToast('Task updated!', 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast('Task deleted.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete task', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (task) => {
    const next = NEXT_STATUS[task.status];
    try {
      const res = await updateTask(task.id, { status: next });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data.data.task : t)));
      addToast(`Moved to "${STATUS_LABELS[next]}"`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const openCreate = () => { setEditingTask(null); setShowModal(true); };
  const openEdit   = (task) => { setEditingTask(task); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingTask(null); };

  // ─── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total:      tasks.length,
    todo:       tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done:       tasks.filter((t) => t.status === 'done').length,
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {isAdmin ? '📋 All Tasks' : '📋 My Tasks'}
              </h1>
              <p className="page-subtitle">
                {isAdmin
                  ? `Managing tasks for all ${stats.total} items`
                  : `Welcome back, ${user?.name}! You have ${stats.todo} task${stats.todo !== 1 ? 's' : ''} to do.`}
              </p>
            </div>
            <button id="create-task-btn" className="btn btn-primary" onClick={openCreate}>
              + New Task
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card stat-card-warning">
              <div className="stat-value">{stats.todo}</div>
              <div className="stat-label">To Do</div>
            </div>
            <div className="stat-card stat-card-info">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-value">{stats.done}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <input
              id="task-search"
              className="form-input filter-search"
              type="text"
              placeholder="🔍 Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
            <select
              id="filter-status"
              className="form-select filter-select"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              id="filter-priority"
              className="form-select filter-select"
              value={filters.priority}
              onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {hasFilters && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Task list / loading / empty */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="tasks-grid">
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
                <p>
                  {hasFilters
                    ? 'Try clearing your filters to see all tasks.'
                    : 'Create your first task to get started!'}
                </p>
                {!hasFilters && (
                  <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ marginTop: 8 }}>
                    + Create Task
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onEdit={() => openEdit(task)}
                  onDelete={() => handleDelete(task.id)}
                  onStatusToggle={() => handleStatusToggle(task)}
                  isDeleting={deletingId === task.id}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <TaskModal
        isOpen={showModal}
        task={editingTask}
        onClose={closeModal}
        onSubmit={editingTask ? handleUpdate : handleCreate}
      />
    </div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, isAdmin, onEdit, onDelete, onStatusToggle, isDeleting }) {
  const formattedDue = task.due_date
    ? new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className={`task-card card card-hover ${task.status === 'done' ? 'task-done' : ''} fade-in`}>
      {/* Header: priority dot + badges + actions */}
      <div className="task-card-header">
        <div
          className="task-priority-dot"
          style={{ background: PRIORITY_COLORS[task.priority] }}
          title={`Priority: ${task.priority}`}
        />
        <div className="task-badges">
          <span className={`badge badge-${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-actions">
          <button
            className="btn btn-icon btn-sm"
            onClick={onEdit}
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            ✏️
          </button>
          <button
            className="btn btn-icon btn-sm"
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete task"
            aria-label={`Delete ${task.title}`}
            style={{ color: 'var(--danger)' }}
          >
            {isDeleting ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '🗑️'}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="task-title">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* Footer */}
      <div className="task-footer">
        {isAdmin && task.user_name && (
          <span className="task-user" title={task.user_email}>👤 {task.user_name}</span>
        )}
        {formattedDue && (
          <span
            className="task-due"
            style={{ color: isOverdue ? 'var(--danger)' : undefined }}
            title={isOverdue ? 'Overdue!' : undefined}
          >
            📅 {isOverdue && '⚠ '}{formattedDue}
          </span>
        )}
        <button
          className="task-status-btn"
          onClick={onStatusToggle}
          title={`Move to: ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
        >
          {STATUS_BTN_LABEL[task.status]}
        </button>
      </div>
    </div>
  );
}
