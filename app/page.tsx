'use client';

import { useState, useEffect } from 'react';
import { Hobby, Session } from './types';

export default function Home() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState<string | null>(null);
  const [newHobby, setNewHobby] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [newSession, setNewSession] = useState({
    duration: '',
    notes: '',
  });

  // Load hobbies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hobbies');
    if (saved) {
      setHobbies(JSON.parse(saved));
    }
  }, []);

  // Save hobbies to localStorage whenever they change
  useEffect(() => {
    if (hobbies.length > 0) {
      localStorage.setItem('hobbies', JSON.stringify(hobbies));
    }
  }, [hobbies]);

  const addHobby = () => {
    if (!newHobby.name.trim()) return;

    const hobby: Hobby = {
      id: Date.now().toString(),
      name: newHobby.name,
      description: newHobby.description,
      category: newHobby.category,
      timeSpent: 0,
      sessions: [],
      createdAt: new Date().toISOString(),
    };

    setHobbies([...hobbies, hobby]);
    setNewHobby({ name: '', description: '', category: '' });
    setShowAddForm(false);
  };

  const deleteHobby = (id: string) => {
    setHobbies(hobbies.filter(h => h.id !== id));
    // Update localStorage
    const updated = hobbies.filter(h => h.id !== id);
    if (updated.length === 0) {
      localStorage.removeItem('hobbies');
    }
  };

  const addSession = (hobbyId: string) => {
    const duration = parseInt(newSession.duration);
    if (!duration || duration <= 0) return;

    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      notes: newSession.notes,
    };

    setHobbies(hobbies.map(h => {
      if (h.id === hobbyId) {
        return {
          ...h,
          timeSpent: h.timeSpent + duration,
          sessions: [...h.sessions, session],
        };
      }
      return h;
    }));

    setNewSession({ duration: '', notes: '' });
    setShowSessionForm(null);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Hobby Tracker</h1>
            <p className="text-lg text-gray-600 mt-2">
              Track your hobbies and time spent on each activity
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {showAddForm ? 'Cancel' : '+ Add Hobby'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add New Hobby</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hobby Name *
                </label>
                <input
                  type="text"
                  value={newHobby.name}
                  onChange={(e) => setNewHobby({ ...newHobby, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Guitar, Painting, Running"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newHobby.category}
                  onChange={(e) => setNewHobby({ ...newHobby, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Music, Arts, Sports"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newHobby.description}
                  onChange={(e) => setNewHobby({ ...newHobby, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="What do you enjoy about this hobby?"
                />
              </div>
              <button
                onClick={addHobby}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Hobby
              </button>
            </div>
          </div>
        )}

        {hobbies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hobbies yet</h3>
            <p className="text-gray-500">Click "Add Hobby" to start tracking your activities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hobbies.map((hobby) => (
              <div key={hobby.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{hobby.name}</h3>
                    {hobby.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                        {hobby.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHobby(hobby.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {hobby.description && (
                  <p className="text-gray-600 mb-4">{hobby.description}</p>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600">Total Time Spent</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatTime(hobby.timeSpent)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {hobby.sessions.length} session{hobby.sessions.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {showSessionForm === hobby.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        value={newSession.duration}
                        onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        value={newSession.notes}
                        onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="What did you work on?"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSession(hobby.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Session
                      </button>
                      <button
                        onClick={() => {
                          setShowSessionForm(null);
                          setNewSession({ duration: '', notes: '' });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSessionForm(hobby.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Log Time
                  </button>
                )}

                {hobby.sessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Sessions</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {hobby.sessions.slice(-5).reverse().map((session) => (
                        <div key={session.id} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{formatTime(session.duration)}</span>
                            <span className="text-gray-500">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          {session.notes && (
                            <div className="text-gray-600 text-xs mt-1">{session.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
