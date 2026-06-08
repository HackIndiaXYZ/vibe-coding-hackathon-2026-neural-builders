export interface CareerRecommendation {
  career: string;
  match: number;
  reasoning: string;
}

export interface ScholarshipMatch {
  name: string;
  coverage: string;
  match: number;
  eligibility: string;
}

export interface UserProfile {
  fullName: string;
  educationLevel: string;
  major: string;
  skills: string[];
  targetCountry: string;
  opportunityScore?: number;
  completedSteps?: string[];
  isAnalyzing?: boolean;
  careerRecommendations?: CareerRecommendation[];
  scholarshipMatches?: ScholarshipMatch[];
}
