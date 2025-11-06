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

  const categoryColors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
  ];

  const getGradientForHobby = (id: string) => {
    const index = parseInt(id) % categoryColors.length;
    return categoryColors[index];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
              Hobby Tracker
            </h1>
            <p className="text-lg text-purple-200/80">
              Track your passions, measure your progress
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              {showAddForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Hobby
                </>
              )}
            </span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">Create New Hobby</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">
                    Hobby Name *
                  </label>
                  <input
                    type="text"
                    value={newHobby.name}
                    onChange={(e) => setNewHobby({ ...newHobby, name: e.target.value })}
                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="e.g., Guitar, Painting, Running"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newHobby.category}
                    onChange={(e) => setNewHobby({ ...newHobby, category: e.target.value })}
                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="e.g., Music, Arts, Sports"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newHobby.description}
                    onChange={(e) => setNewHobby({ ...newHobby, description: e.target.value })}
                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all resize-none"
                    rows={3}
                    placeholder="What do you enjoy about this hobby?"
                  />
                </div>
                <button
                  onClick={addHobby}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  Create Hobby
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hobbies Grid */}
        {hobbies.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-16 text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Your Journey Awaits</h3>
            <p className="text-purple-200/70 text-lg">Start tracking your first hobby and watch your progress grow!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((hobby, index) => (
              <div
                key={hobby.id}
                className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${getGradientForHobby(hobby.id)} p-4 rounded-2xl mb-4 shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{hobby.name}</h3>
                      {hobby.category && (
                        <span className="inline-block bg-white/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                          {hobby.category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteHobby(hobby.id)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {hobby.description && (
                  <p className="text-purple-100/80 mb-4 text-sm leading-relaxed">{hobby.description}</p>
                )}

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 mb-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-200/70 text-sm font-medium">Total Time</span>
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-1">
                    {formatTime(hobby.timeSpent)}
                  </div>
                  <div className="flex items-center gap-2 text-purple-200/60 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {hobby.sessions.length} session{hobby.sessions.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Session Form or Button */}
                {showSessionForm === hobby.id ? (
                  <div className="space-y-3 animate-in slide-in-from-top duration-300">
                    <div>
                      <label className="block text-sm font-semibold text-purple-200 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        value={newSession.duration}
                        onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="30"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-200 mb-2">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        value={newSession.notes}
                        onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="What did you work on?"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSession(hobby.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all hover:scale-[1.02]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowSessionForm(null);
                          setNewSession({ duration: '', notes: '' });
                        }}
                        className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSessionForm(hobby.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Log Time
                  </button>
                )}

                {/* Recent Sessions */}
                {hobby.sessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold text-purple-200 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Recent Sessions
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {hobby.sessions.slice(-5).reverse().map((session) => (
                        <div key={session.id} className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-100">{formatTime(session.duration)}</span>
                            <span className="text-purple-200/60 text-xs">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          {session.notes && (
                            <div className="text-purple-200/70 text-xs mt-2 italic">{session.notes}</div>
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

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom {
          animation-name: slide-in-from-bottom;
        }
        .slide-in-from-top {
          animation-name: slide-in-from-top;
        }
        .duration-300 {
          animation-duration: 300ms;
        }
        .duration-500 {
          animation-duration: 500ms;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </main>
  );
}
