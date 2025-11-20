import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TagResponse, SuggestionResponse, MovieSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTagsFromMovies = async (movies: string[]): Promise<string[]> => {
  const prompt = `
    I love the following three movies: ${movies.join(", ")}.
    Analyze these films and generate a list of 15 distinct, short, and descriptive tags, genres, tropes, or stylistic elements that connect them (e.g., "Dystopian Future", "Non-linear Narrative", "Synthwave Score", "Psychological Horror").
    Return strictly the tags.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of 15 descriptive tags.",
      },
    },
    required: ["tags"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text) as TagResponse;
    return data.tags || [];
  } catch (error) {
    console.error("Error generating tags:", error);
    return ["Sci-Fi", "Action", "Drama", "Thriller", "Comedy", "Romance", "Indie", "Classic"]; // Fallback
  }
};

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    year: { type: Type.INTEGER },
    rtScore: { type: Type.STRING, description: "Percentage string like '85%'" },
    description: { type: Type.STRING },
    reasoning: { type: Type.STRING },
    wikipediaTitle: { type: Type.STRING, description: "The exact title of the English Wikipedia page for this movie (e.g. 'The_Matrix', 'Avatar_(2009_film)'). Used to fetch the poster." },
  },
  required: ["title", "year", "rtScore", "description", "reasoning", "wikipediaTitle"],
};

export const getMovieSuggestions = async (
  likedMovies: string[],
  selectedTags: string[],
  yearRange: [number, number]
): Promise<SuggestionResponse['suggestions']> => {
  const prompt = `
    I liked these movies: ${likedMovies.join(", ")}.
    I specifically enjoyed these aspects of them: ${selectedTags.join(", ")}.
    
    Please suggest 5 NEW movies for me to watch.
    Constraint 1: The movies must be released between the years ${yearRange[0]} and ${yearRange[1]}.
    Constraint 2: Do not suggest the movies I listed as liked.
    Constraint 3: Take into account general consensus from Reddit threads and Rotten Tomatoes critic/audience scores.
    
    For each movie, provide:
    1. Title
    2. Year
    3. An estimated Rotten Tomatoes Score (e.g., "92%") based on real historical data.
    4. A short, engaging description (2 sentences max).
    5. A "Why You'll Like It" reasoning section.
    6. The EXACT title of the Wikipedia page for this movie to help me fetch an image (e.g. 'Seven_(1995_film)' instead of just 'Seven').
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        items: movieSchema,
      },
    },
    required: ["suggestions"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text) as SuggestionResponse;
    return data.suggestions || [];
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
};

export const getReplacementSuggestion = async (
  excludedMovies: string[],
  selectedTags: string[],
  yearRange: [number, number]
): Promise<MovieSuggestion | null> => {
  const prompt = `
    I need a single movie recommendation.
    I specifically enjoyed these aspects: ${selectedTags.join(", ")}.
    
    Constraints:
    1. Year between ${yearRange[0]} and ${yearRange[1]}.
    2. DO NOT suggest any of these movies (I have already seen them or they are currently suggested): ${excludedMovies.join(", ")}.
    3. High Reddit/Rotten Tomatoes sentiment.
    
    Provide the details for ONE movie.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        suggestion: movieSchema
    },
    required: ["suggestion"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Slightly higher temperature for variety
      },
    });

    const text = response.text;
    if (!text) return null;
    const data = JSON.parse(text) as { suggestion: MovieSuggestion };
    return data.suggestion || null;
  } catch (error) {
    console.error("Error getting replacement:", error);
    return null;
  }
};