import { SsiSnapshot, ActionLog, User } from '../types';

const KEYS = {
  TOKEN: 'ssi_token',
  USER: 'ssi_user',
  SNAPSHOTS: 'ssi_snapshots',
  ACTIONS: 'ssi_actions',
};

// Auth Helpers
export function getAuthToken(): string | null {
  return localStorage.getItem(KEYS.TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(KEYS.TOKEN, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(KEYS.TOKEN);
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function removeCurrentUser(): void {
  localStorage.removeItem(KEYS.USER);
}

// Data Helpers
export function getSnapshots(userId: string): SsiSnapshot[] {
  try {
    const data = localStorage.getItem(KEYS.SNAPSHOTS);
    const allSnapshots: SsiSnapshot[] = data ? JSON.parse(data) : [];
    return allSnapshots
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading snapshots', error);
    return [];
  }
}

export function addSnapshot(snapshot: SsiSnapshot): void {
  try {
    const data = localStorage.getItem(KEYS.SNAPSHOTS);
    const allSnapshots: SsiSnapshot[] = data ? JSON.parse(data) : [];
    allSnapshots.push(snapshot);
    localStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(allSnapshots));
  } catch (error) {
    console.error('Error saving snapshot', error);
  }
}

export function deleteSnapshot(id: string): void {
  try {
    const data = localStorage.getItem(KEYS.SNAPSHOTS);
    let allSnapshots: SsiSnapshot[] = data ? JSON.parse(data) : [];
    allSnapshots = allSnapshots.filter((s) => s.id !== id);
    localStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(allSnapshots));
  } catch (error) {
    console.error('Error deleting snapshot', error);
  }
}

export function getActionLogs(userId: string): ActionLog[] {
  try {
    const data = localStorage.getItem(KEYS.ACTIONS);
    const allLogs: ActionLog[] = data ? JSON.parse(data) : [];
    return allLogs.filter((l) => l.userId === userId);
  } catch (error) {
    console.error('Error reading action logs', error);
    return [];
  }
}

export function toggleDailyAction(userId: string, actionId: string, date: string): void {
  try {
    const data = localStorage.getItem(KEYS.ACTIONS);
    const allLogs: ActionLog[] = data ? JSON.parse(data) : [];
    
    let logEntry = allLogs.find((l) => l.userId === userId && l.date === date);

    if (!logEntry) {
      logEntry = { date, userId, completedActions: [] };
      allLogs.push(logEntry);
    }

    if (logEntry.completedActions.includes(actionId)) {
      logEntry.completedActions = logEntry.completedActions.filter((id) => id !== actionId);
    } else {
      logEntry.completedActions.push(actionId);
    }

    localStorage.setItem(KEYS.ACTIONS, JSON.stringify(allLogs));
  } catch (error) {
    console.error('Error toggling action', error);
  }
}

export function markActionsAsDone(userId: string, actionIds: string[], date: string): void {
  try {
    const data = localStorage.getItem(KEYS.ACTIONS);
    const allLogs: ActionLog[] = data ? JSON.parse(data) : [];
    
    let logEntry = allLogs.find((l) => l.userId === userId && l.date === date);

    if (!logEntry) {
      logEntry = { date, userId, completedActions: [] };
      allLogs.push(logEntry);
    }

    const newIds = actionIds.filter(id => !logEntry!.completedActions.includes(id));
    if (newIds.length > 0) {
      logEntry.completedActions.push(...newIds);
      localStorage.setItem(KEYS.ACTIONS, JSON.stringify(allLogs));
    }
  } catch (error) {
    console.error('Error marking actions as done', error);
  }
}

export function getCompletedActionsForDate(userId: string, date: string): string[] {
  const logs = getActionLogs(userId);
  const logEntry = logs.find((l) => l.date === date);
  return logEntry ? logEntry.completedActions : [];
}

// Migration helper (optional, to migrate old data if needed, but for now we can start fresh or assume empty)
export function migrateDataIfNeeded(userId: string) {
  // Logic to migrate old 'ssi_analyzer_data' to new structure if it exists and hasn't been migrated
  // For this exercise, we'll assume we start fresh or the user manually re-enters data.
  // But to be nice, we could check if old data exists and assign it to the first user who logs in.
  const oldDataStr = localStorage.getItem('ssi_analyzer_data');
  if (oldDataStr) {
    try {
      const oldData = JSON.parse(oldDataStr);
      if (oldData.snapshots && oldData.snapshots.length > 0) {
        // Check if these are already migrated (have userId)
        // If not, assign to current userId
        const snapshots = oldData.snapshots.map((s: any) => ({
          ...s,
          userId: s.userId || userId,
          source: s.source || 'manual'
        }));
        
        // Merge with existing new snapshots
        const currentSnapshotsStr = localStorage.getItem(KEYS.SNAPSHOTS);
        const currentSnapshots = currentSnapshotsStr ? JSON.parse(currentSnapshotsStr) : [];
        const merged = [...currentSnapshots, ...snapshots];
        // Deduplicate by ID
        const unique = Array.from(new Map(merged.map((item: any) => [item.id, item])).values());
        
        localStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(unique));
        localStorage.removeItem('ssi_analyzer_data'); // Clear old data
      }
    } catch (e) {
      console.error('Migration failed', e);
    }
  }
}
