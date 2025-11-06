'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface Hobby {
  id: number;
  name: string;
  description: string;
  category: string;
  total_time_spent: number;
  session_count: number;
  created_at: string;
}

interface Session {
  id: number;
  hobby_id: number;
  duration: number;
  notes: string;
  date: string;
}

export default function DashboardPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [sessions, setSessions] = useState<{ [key: number]: Session[] }>({});
  const [loading, setLoading] = useState(true);
  const [showAddHobby, setShowAddHobby] = useState(false);
  const [showAddSession, setShowAddSession] = useState<number | null>(null);
  const [expandedHobby, setExpandedHobby] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const router = useRouter();

  // Form states
  const [newHobby, setNewHobby] = useState({
    name: '',
    description: '',
    category: '',
  });

  const [newSession, setNewSession] = useState({
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    checkAuth();
    fetchHobbies();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUsername(data.user.username);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchHobbies = async () => {
    try {
      const response = await fetch('/api/hobbies');
      if (response.ok) {
        const data = await response.json();
        setHobbies(data.hobbies);
      }
    } catch (error) {
      console.error('Error fetching hobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (hobbyId: number) => {
    try {
      const response = await fetch(`/api/hobbies/${hobbyId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(prev => ({ ...prev, [hobbyId]: data.sessions }));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddHobby = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHobby),
      });

      if (response.ok) {
        setNewHobby({ name: '', description: '', category: '' });
        setShowAddHobby(false);
        fetchHobbies();
      }
    } catch (error) {
      console.error('Error adding hobby:', error);
    }
  };

  const handleAddSession = async (e: React.FormEvent, hobbyId: number) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/hobbies/${hobbyId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: parseInt(newSession.duration),
          notes: newSession.notes,
          date: newSession.date,
        }),
      });

      if (response.ok) {
        setNewSession({
          duration: '',
          notes: '',
          date: new Date().toISOString().split('T')[0],
        });
        setShowAddSession(null);
        fetchHobbies();
        fetchSessions(hobbyId);
      }
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleDeleteHobby = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hobby?')) return;

    try {
      const response = await fetch(`/api/hobbies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHobbies();
      }
    } catch (error) {
      console.error('Error deleting hobby:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const toggleHobbyExpand = (hobbyId: number) => {
    if (expandedHobby === hobbyId) {
      setExpandedHobby(null);
    } else {
      setExpandedHobby(hobbyId);
      if (!sessions[hobbyId]) {
        fetchSessions(hobbyId);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Hobby Tracker</h1>
          <p>Welcome, {username}!</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h2>My Hobbies</h2>
          <button
            onClick={() => setShowAddHobby(true)}
            className={styles.addBtn}
          >
            + Add Hobby
          </button>
        </div>

        {showAddHobby && (
          <div className={styles.modal} onClick={() => setShowAddHobby(false)}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Add New Hobby</h3>
              <form onSubmit={handleAddHobby} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={newHobby.name}
                    onChange={(e) =>
                      setNewHobby({ ...newHobby, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Description</label>
                  <textarea
                    value={newHobby.description}
                    onChange={(e) =>
                      setNewHobby({ ...newHobby, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <input
                    type="text"
                    value={newHobby.category}
                    onChange={(e) =>
                      setNewHobby({ ...newHobby, category: e.target.value })
                    }
                    placeholder="e.g., Sports, Creative, Learning"
                  />
                </div>

                <div className={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setShowAddHobby(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Add Hobby
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {hobbies.length === 0 ? (
          <div className={styles.empty}>
            <p>No hobbies yet. Add your first hobby to get started!</p>
          </div>
        ) : (
          <div className={styles.hobbiesGrid}>
            {hobbies.map((hobby) => (
              <div key={hobby.id} className={styles.hobbyCard}>
                <div className={styles.hobbyHeader}>
                  <div>
                    <h3>{hobby.name}</h3>
                    {hobby.category && (
                      <span className={styles.category}>{hobby.category}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteHobby(hobby.id)}
                    className={styles.deleteBtn}
                    title="Delete hobby"
                  >
                    ×
                  </button>
                </div>

                {hobby.description && (
                  <p className={styles.description}>{hobby.description}</p>
                )}

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Time</span>
                    <span className={styles.statValue}>
                      {formatMinutes(hobby.total_time_spent)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Sessions</span>
                    <span className={styles.statValue}>
                      {hobby.session_count}
                    </span>
                  </div>
                </div>

                <div className={styles.hobbyActions}>
                  <button
                    onClick={() => setShowAddSession(hobby.id)}
                    className={styles.actionBtn}
                  >
                    + Log Session
                  </button>
                  <button
                    onClick={() => toggleHobbyExpand(hobby.id)}
                    className={styles.actionBtn}
                  >
                    {expandedHobby === hobby.id ? 'Hide' : 'View'} Sessions
                  </button>
                </div>

                {expandedHobby === hobby.id && (
                  <div className={styles.sessionsContainer}>
                    <h4>Recent Sessions</h4>
                    {sessions[hobby.id] && sessions[hobby.id].length > 0 ? (
                      <div className={styles.sessionsList}>
                        {sessions[hobby.id].map((session) => (
                          <div key={session.id} className={styles.sessionItem}>
                            <div className={styles.sessionInfo}>
                              <span className={styles.sessionDate}>
                                {new Date(session.date).toLocaleDateString()}
                              </span>
                              <span className={styles.sessionDuration}>
                                {formatMinutes(session.duration)}
                              </span>
                            </div>
                            {session.notes && (
                              <p className={styles.sessionNotes}>
                                {session.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noSessions}>No sessions yet</p>
                    )}
                  </div>
                )}

                {showAddSession === hobby.id && (
                  <div
                    className={styles.modal}
                    onClick={() => setShowAddSession(null)}
                  >
                    <div
                      className={styles.modalContent}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3>Log Session for {hobby.name}</h3>
                      <form
                        onSubmit={(e) => handleAddSession(e, hobby.id)}
                        className={styles.form}
                      >
                        <div className={styles.inputGroup}>
                          <label>Duration (minutes) *</label>
                          <input
                            type="number"
                            value={newSession.duration}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                duration: e.target.value,
                              })
                            }
                            required
                            min="1"
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Date *</label>
                          <input
                            type="date"
                            value={newSession.date}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                date: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Notes</label>
                          <textarea
                            value={newSession.notes}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                notes: e.target.value,
                              })
                            }
                            rows={3}
                            placeholder="What did you work on?"
                          />
                        </div>

                        <div className={styles.modalButtons}>
                          <button
                            type="button"
                            onClick={() => setShowAddSession(null)}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                          <button type="submit" className={styles.submitBtn}>
                            Log Session
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
