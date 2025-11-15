import { Recipe } from "@/data/recipes";

export function isRecipeComplete(recipe: Recipe): boolean {
    if (!recipe) {
        return false;
    }
    
    if (!recipe.id || !recipe.id.trim()) return false;
    if (!recipe.title || !recipe.title.trim()) return false;
    if (!recipe.description || !recipe.description.trim()) return false;

    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        return false;
    }

    for (const ingredient of recipe.ingredients) {
        if (!ingredient.name || !ingredient.name.trim()) {
            return false;
        }
    }

    if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
        return false;
    }

    for (const instruction of recipe.instructions) {
        if (!instruction.title || !instruction.title.trim()) {
            return false;
        }
        if (!instruction.description || !instruction.description.trim()) {
            return false;
        }
    }

    return true;
}