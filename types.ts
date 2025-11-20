export interface MovieSuggestion {
  title: string;
  year: number;
  rtScore: string; // e.g. "94%"
  description: string;
  reasoning: string;
  wikipediaTitle: string; // For fetching images
}

export enum AppStep {
  INPUT_MOVIES = 0,
  SELECT_TAGS = 1,
  SELECT_YEARS = 2,
  RESULTS = 3,
}

export interface TagResponse {
  tags: string[];
}

export interface SuggestionResponse {
  suggestions: MovieSuggestion[];
}