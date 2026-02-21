import { SsiSnapshot, Recommendation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function generateRecommendations(snapshot: SsiSnapshot): Recommendation[] {
  const recs: Recommendation[] = [];

  // Helper to add recommendation
  const addRec = (
    priority: number,
    component: Recommendation['component'],
    title: string,
    subtitle: string,
    actions: string[],
    timeEstimate: string
  ) => {
    recs.push({
      id: uuidv4(),
      priority,
      component,
      title,
      subtitle,
      actions,
      timeEstimate,
    });
  };

  // 1. Engage with Insights
  if (snapshot.engageInsights < 5) {
    addRec(
      0, // Priority placeholder, will sort later
      'engageInsights',
      'Start commenting on industry posts',
      'Engage with Insights • Expected: +5-8 points',
      [
        "Comment on 5 posts daily",
        "Write 2-3 sentences, not just 'Great post'",
        "Focus on posts from industry leaders"
      ],
      '15 min/day'
    );
  } else if (snapshot.engageInsights < 10) {
    addRec(
      0,
      'engageInsights',
      'Increase engagement frequency',
      'Engage with Insights • Expected: +3-5 points',
      [
        "Share 1 post per week with your own insight",
        "React to 10 posts daily"
      ],
      '10 min/day'
    );
  }

  // 2. Build Relationships
  if (snapshot.buildRelationships < 5) {
    addRec(
      0,
      'buildRelationships',
      "You're not building conversations",
      'Build Relationships • Expected: +4-6 points',
      [
        "After every new connection, send a follow-up message within 24 hours",
        "Ask one question about their work"
      ],
      '10 min/day'
    );
  } else if (snapshot.buildRelationships < 10) {
    addRec(
      0,
      'buildRelationships',
      'Deepen existing connections',
      'Build Relationships • Expected: +2-4 points',
      [
        "Message 3 existing connections per week",
        "Congratulate people on job changes and achievements"
      ],
      '15 min/week'
    );
  }

  // 3. Find the Right People
  if (snapshot.findPeople < 10) {
    addRec(
      0,
      'findPeople',
      'Expand your network strategically',
      'Find the Right People • Expected: +5-7 points',
      [
        "Send 10-15 targeted connection requests daily with personalized notes",
        "Search for people in your target role and industry"
      ],
      '20 min/day'
    );
  } else if (snapshot.findPeople < 15) {
    addRec(
      0,
      'findPeople',
      'Refine your search',
      'Find the Right People • Expected: +2-4 points',
      [
        "Use LinkedIn's advanced search to find decision-makers",
        "Join 3-5 relevant LinkedIn groups"
      ],
      '15 min/week'
    );
  }

  // 4. Establish Professional Brand
  if (snapshot.establishBrand < 10) {
    addRec(
      0,
      'establishBrand',
      'Your profile needs work',
      'Establish Professional Brand • Expected: +3-5 points',
      [
        "Complete all profile sections",
        "Add a professional headline with keywords",
        "Write an About section with achievements and metrics"
      ],
      '30 min (one-time)'
    );
  } else if (snapshot.establishBrand < 15) {
    addRec(
      0,
      'establishBrand',
      'Boost your content presence',
      'Establish Professional Brand • Expected: +2-4 points',
      [
        "Publish 2-3 posts per week",
        "Add a Featured section with your best work",
        "Get 2-3 recommendations"
      ],
      '20 min/week'
    );
  } else if (snapshot.establishBrand < 20) {
    addRec(
      0,
      'establishBrand',
      'Fine-tune your brand',
      'Establish Professional Brand • Expected: +1-3 points',
      [
        "Create original long-form content",
        "Engage in LinkedIn newsletters",
        "Speak at virtual events and share recordings"
      ],
      '1 hour/week'
    );
  }

  // Sort by score (weakest first) to assign priority
  // We need to know the score of the component for each rec to sort them
  const getScore = (component: string) => {
    return snapshot[component as keyof SsiSnapshot] as number;
  };

  recs.sort((a, b) => getScore(a.component) - getScore(b.component));

  // Assign priority badges (P1, P2, etc.)
  return recs.map((rec, index) => ({
    ...rec,
    priority: index + 1
  }));
}
