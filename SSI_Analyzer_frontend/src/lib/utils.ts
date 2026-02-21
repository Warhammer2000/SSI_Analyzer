import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGrade(score: number): { grade: string; color: string; bg: string; hex: string } {
  if (score >= 20) return { grade: 'A', color: 'text-[#057642]', bg: 'bg-[#057642]', hex: '#057642' };
  if (score >= 15) return { grade: 'B', color: 'text-[#0a66c2]', bg: 'bg-[#0a66c2]', hex: '#0a66c2' };
  if (score >= 10) return { grade: 'C', color: 'text-[#c37d16]', bg: 'bg-[#c37d16]', hex: '#c37d16' };
  if (score >= 5) return { grade: 'D', color: 'text-[#cc1016]', bg: 'bg-[#cc1016]', hex: '#cc1016' };
  return { grade: 'F', color: 'text-[#cc1016]', bg: 'bg-[#cc1016]', hex: '#cc1016' };
}

export function getTotalScoreColor(score: number): string {
  if (score >= 70) return '#057642';
  if (score >= 50) return '#0a66c2';
  if (score >= 30) return '#c37d16';
  return '#cc1016';
}

export const COMPONENT_LABELS = {
  establishBrand: 'Establish Professional Brand',
  findPeople: 'Find the Right People',
  engageInsights: 'Engage with Insights',
  buildRelationships: 'Build Relationships',
};

export const COMPONENT_COLORS = {
  establishBrand: '#c37d16', // Orange-ish
  findPeople: '#0a66c2', // Blue
  engageInsights: '#057642', // Green
  buildRelationships: '#704ca2', // Purple (custom for variety, or stick to palette)
};
