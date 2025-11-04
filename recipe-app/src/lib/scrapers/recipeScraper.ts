import recipeScraper from 'recipe-scraper';
import { Recipe } from '@/data/recipes';

export async function parseUrlToRecipeDataUsingRecipeScraper(url: string): Promise<Recipe | null> {
    console.log('Parsing URL using Recipe Scraper:', url);
    try {
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
    } catch (error) {
        console.error('Error with recipeScraper:', error);
        return null;
    }
}