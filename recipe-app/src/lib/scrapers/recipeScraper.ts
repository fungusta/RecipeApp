import recipeScraper from 'recipe-scraper';
import { Recipe } from '@/data/recipes';

export async function parseUrlToRecipeDataUsingRecipeScraper(url: string): Promise<Recipe> {
    const recipe = await recipeScraper(url);
    return {
        id: Date.now().toString(),
        title: recipe.title,
        description: recipe.description || '',
        image: recipe.image || '',
        ingredients: recipe.ingredients.map((ingredient: any) => ({
            name: ingredient.name,
            // amount: ingredient.amount
        })),
        instructions: recipe.instructions.map((instruction: any) => ({
            title: instruction.title,
            description: instruction.description
        }))
    };
}