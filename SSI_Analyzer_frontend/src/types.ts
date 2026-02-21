export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface SsiSnapshot {
  id: string;
  userId: string;
  date: string; // ISO date
  establishBrand: number;
  findPeople: number;
  engageInsights: number;
  buildRelationships: number;
  industryAverage: number;
  networkAverage: number;
  industryRankPercentile: number;
  networkRankPercentile: number;
  source: 'manual' | 'paste' | 'extension';
}

export interface ActionLog {
  date: string;
  userId: string;
  completedActions: string[];
}

export interface Recommendation {
  id: string;
  priority: number;
  title: string;
  subtitle: string;
  component: 'establishBrand' | 'findPeople' | 'engageInsights' | 'buildRelationships';
  actions: string[];
  timeEstimate: string;
}
