import { useState, useEffect } from 'react';

const STATUSES   = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const DEFAULT_FORM = {
  title:       '',
  description: '',
  status:      'todo',
  priority:    'medium',
  due_date:    '',
};

export default function TaskModal({ isOpen, onClose, task, onSubmit }) {
  const [form, setForm]     = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'todo',
        priority:    task.priority    || 'medium',
        due_date:    task.due_date    ? task.due_date.split('T')[0] : '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 200) errs.title = 'Title too long (max 200 chars)';
    if (form.description && form.description.length > 2000) errs.description = 'Description too long';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        status:      form.status,
        priority:    form.priority,
        due_date:    form.due_date || null,
      };
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEditing ? '✏️ Edit Task' : '➕ New Task'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add more details (optional)..."
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Status + Priority */}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="task-status">Status</label>
                <select id="task-status" className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                className="form-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
              ) : (
                isEditing ? '✓ Save Changes' : '+ Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
