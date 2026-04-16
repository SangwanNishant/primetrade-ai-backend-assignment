import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getUsers, updateUserRole, deleteUser } from '../api/users';
import { getTasks } from '../api/tasks';
import Navbar from '../components/Navbar';

export default function AdminPanel() {
  const { user }     = useAuth();
  const { addToast } = useToast();

  const [users,     setUsers]     = useState([]);
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([getUsers(), getTasks()])
      .then(([usersRes, tasksRes]) => {
        setUsers(usersRes.data.data.users);
        setTasks(tasksRes.data.data.tasks);
      })
      .catch(() => addToast('Failed to load admin data', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data.data.user : u)));
      addToast(`Role updated to ${newRole}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and all their tasks? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTasks((prev) => prev.filter((t) => t.user_id !== userId));
      addToast(`User "${userName}" deleted.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Stats
  const stats = {
    totalUsers:  users.length,
    admins:      users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
    totalTasks:  tasks.length,
    done:        tasks.filter((t) => t.status === 'done').length,
    inProgress:  tasks.filter((t) => t.status === 'in_progress').length,
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-state" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">🛡️ Admin Panel</h1>
              <p className="page-subtitle">System overview and user management</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.admins}</div>
              <div className="stat-label">Admins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-value">{stats.done}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              id="tab-users"
              className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users ({stats.totalUsers})
            </button>
            <button
              id="tab-tasks"
              className={`tab ${activeTab === 'tasks' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              📋 All Tasks ({stats.totalTasks})
            </button>
          </div>

          {/* ── Users Tab ─────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="table-container card">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tasks</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const taskCount = tasks.filter((t) => t.user_id === u.id).length;
                    const isSelf    = u.id === user.id;
                    const isUpdating = updatingId === u.id;

                    return (
                      <tr key={u.id} className={isSelf ? 'current-user-row' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{u.name[0].toUpperCase()}</div>
                            <div>
                              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{u.name}</div>
                              {isSelf && <div className="you-tag" style={{ display: 'inline-block', marginTop: 2 }}>You</div>}
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role}`}>{u.role}</span>
                        </td>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{taskCount}</td>
                        <td>
                          {new Date(u.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td>
                          {!isSelf ? (
                            <div className="action-btns">
                              <button
                                id={`role-btn-${u.id}`}
                                className="btn btn-secondary btn-sm"
                                disabled={isUpdating}
                                onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                              >
                                {isUpdating
                                  ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                  : u.role === 'admin' ? '↓ Demote' : '↑ Make Admin'}
                              </button>
                              <button
                                id={`delete-user-${u.id}`}
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No users yet</h3>
                </div>
              )}
            </div>
          )}

          {/* ── Tasks Tab ─────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="table-container card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="task-title-cell">
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{task.title}</span>
                          {task.description && (
                            <span className="task-desc-preview">
                              {task.description.slice(0, 70)}
                              {task.description.length > 70 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="user-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                            {task.user_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          {task.user_name || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status}`}>
                          {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </td>
                      <td>
                        {task.due_date
                          ? new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                            })
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {new Date(task.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No tasks created yet</h3>
                  <p>Tasks will appear here once users start creating them.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
