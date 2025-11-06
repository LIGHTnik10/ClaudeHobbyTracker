export interface Hobby {
  id: string;
  name: string;
  description: string;
  category: string;
  timeSpent: number; // in minutes
  sessions: Session[];
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in minutes
  notes?: string;
}
