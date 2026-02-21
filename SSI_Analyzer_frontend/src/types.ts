export interface User {
  id: string;
  email: string;
  linkedInUrl?: string;
  industry?: string;
  role?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface SsiSnapshot {
  id: string;
  userId: string;
  recordedAt: string; // ISO date from backend
  establishBrand: number;
  findPeople: number;
  engageInsights: number;
  buildRelationships: number;
  totalScore: number;
  industryAverage: number;
  networkAverage: number;
  industryRankPercentile: number;
  networkRankPercentile: number;
  recommendations?: Recommendation[];
}

/** Payload sent to POST /api/ssi/snapshot */
export interface CreateSnapshotRequest {
  recordedAt: string;
  establishBrand: number;
  findPeople: number;
  engageInsights: number;
  buildRelationships: number;
  industryAverage: number;
  networkAverage: number;
  industryRankPercentile: number;
  networkRankPercentile: number;
}

export interface Recommendation {
  id: string;
  snapshotId: string;
  component: 'EstablishBrand' | 'FindPeople' | 'EngageInsights' | 'BuildRelationships';
  priority: number;
  title: string;
  description: string;
  actionStepsJson: string; // JSON string of string[]
  expectedImpact: string;
  timeEstimate: string;
  isCompleted: boolean;
}

/** Parsed recommendation for UI use */
export interface ParsedRecommendation extends Omit<Recommendation, 'actionStepsJson'> {
  actions: string[];
  /** Maps PascalCase backend component to camelCase frontend key */
  componentKey: 'establishBrand' | 'findPeople' | 'engageInsights' | 'buildRelationships';
}

export interface ActionItem {
  id: string;
  userId: string;
  component: string;
  task: string;
  frequency: string;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
}

export interface StreakInfo {
  currentStreak: number;
  totalCompletedActions: number;
}

export interface TrendDataPoint {
  recordedAt: string;
  establishBrand: number;
  findPeople: number;
  engageInsights: number;
  buildRelationships: number;
  totalScore: number;
}

// Keep old type for backward compat with recommendations.ts fallback
export interface ActionLog {
  date: string;
  userId: string;
  completedActions: string[];
}

/** Maps PascalCase backend component values to camelCase frontend keys */
export function componentToKey(component: string): 'establishBrand' | 'findPeople' | 'engageInsights' | 'buildRelationships' {
  const map: Record<string, 'establishBrand' | 'findPeople' | 'engageInsights' | 'buildRelationships'> = {
    EstablishBrand: 'establishBrand',
    FindPeople: 'findPeople',
    EngageInsights: 'engageInsights',
    BuildRelationships: 'buildRelationships',
  };
  return map[component] || 'establishBrand';
}

/** Parse a Recommendation into a UI-friendly ParsedRecommendation */
export function parseRecommendation(rec: Recommendation): ParsedRecommendation {
  let actions: string[] = [];
  try {
    actions = JSON.parse(rec.actionStepsJson);
  } catch {
    actions = [];
  }
  return {
    ...rec,
    actions,
    componentKey: componentToKey(rec.component),
  };
}
