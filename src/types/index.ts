// TheMealDB API response types
export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

// Simplified meal type for our app
export interface Meal {
  id: string;
  name: string;
  category: string;
  area: string;
  image: string;
  ingredients: string[];
  instructions: string;
  tags: string[];
  youtubeUrl?: string;
}

// Swipe action types
export type SwipeAction = 'like' | 'nope' | 'superlike';

// Individual swipe record
export interface SwipeRecord {
  mealId: string;
  action: SwipeAction;
  timestamp: number;
}

// User preferences stored in localStorage
export interface UserPreferences {
  likes: Meal[];
  dislikes: Meal[];
  superLikes: Meal[];
  history: SwipeRecord[];
  selectedCuisines: string[];
  lastSessionDate: string;
}

// Recommendation with score breakdown
export interface RecommendationScore {
  meal: Meal;
  totalScore: number;
  breakdown: {
    cuisineScore: number;
    ingredientScore: number;
    dietScore: number;
    timeScore: number;
  };
  matchReasons: string[];
}

// Category/Area from API
export interface Category {
  strCategory: string;
  strCategoryThumb?: string;
  strCategoryDescription?: string;
}

export interface Area {
  strArea: string;
}

// Card state for animations
export interface CardState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Helper to extract ingredients from MealDB response
export function extractIngredients(meal: MealDBMeal): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBMeal];
    if (ingredient && typeof ingredient === 'string' && ingredient.trim()) {
      ingredients.push(ingredient.trim().toLowerCase());
    }
  }
  return ingredients;
}

// Convert MealDB response to our Meal type
export function toMeal(mealDB: MealDBMeal): Meal {
  return {
    id: mealDB.idMeal,
    name: mealDB.strMeal,
    category: mealDB.strCategory,
    area: mealDB.strArea,
    image: mealDB.strMealThumb,
    ingredients: extractIngredients(mealDB),
    instructions: mealDB.strInstructions,
    tags: mealDB.strTags ? mealDB.strTags.split(',').map(t => t.trim()) : [],
    youtubeUrl: mealDB.strYoutube || undefined,
  };
}
