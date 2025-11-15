import { Ingredient, Instruction } from '@/data/recipes';
import sanitizeHtml from 'sanitize-html';

/**
 * Common category/navigation items that should be filtered from ingredients
 */
const INGREDIENT_CATEGORY_FILTERS = [
    'view all',
    'view more',
    'see all',
    'all categories',
    'categories',
    'browse',
    'search',
    'filter',
    'sort',
];

/**
 * Common category names that appear in navigation but aren't actual ingredients
 */
const NAVIGATION_CATEGORIES = [
    'chicken',
    'beef',
    'pork',
    'seafood',
    'pasta',
    'fruits',
    'vegetables',
    'desserts',
    'appetizers',
    'salads',
    'soups',
    'beverages',
    'breakfast',
    'lunch',
    'dinner',
];

/**
 * Common attribution text patterns that should be removed from instructions
 */
const ATTRIBUTION_PATTERNS = [
    /dotdash\s+meredith\s+food\s+studios/gi,
    /allrecipes\s+test\s+kitchen/gi,
    /photo\s+by/gi,
    /image\s+by/gi,
    /credit:/gi,
    /source:/gi,
];

/**
 * Patterns that indicate tips/hints rather than actual instructions
 */
const TIP_PATTERNS = [
    /^(for|tip|note|hint|variation|substitution|storage|make-ahead|you can|i usually|keep|remember|don't forget)/i,
];

/**
 * Filter unwanted items from ingredients array
 * Removes navigation items, category names, and other non-ingredient content
 */
export function filterIngredients(ingredients: string[]): Ingredient[] {
    if (!Array.isArray(ingredients)) return [];

    const filtered: Ingredient[] = [];
    const seen = new Set<string>();
    
    // Track if we've seen navigation categories to detect navigation sections
    let navigationCategoryCount = 0;
    const firstFewItems = ingredients.slice(0, Math.min(10, ingredients.length));

    // Check if the first few items are mostly navigation categories
    for (const item of firstFewItems) {
        if (typeof item === 'string') {
            const lower = item.trim().toLowerCase();
            if (NAVIGATION_CATEGORIES.includes(lower) || INGREDIENT_CATEGORY_FILTERS.some(f => lower.includes(f))) {
                navigationCategoryCount++;
            }
        }
    }

    // If more than 3 of the first 10 items are navigation categories, it's likely a navigation section
    const isNavigationSection = navigationCategoryCount >= 3;

    for (const ing of ingredients) {
        if (!ing || typeof ing !== 'string') continue;

        const trimmed = ing.trim();
        if (!trimmed) continue;

        // Check if it's a category filter keyword
        const lowerTrimmed = trimmed.toLowerCase();
        if (INGREDIENT_CATEGORY_FILTERS.some(filter => lowerTrimmed.includes(filter))) {
            continue;
        }

        // Check if it's a navigation category
        if (NAVIGATION_CATEGORIES.includes(lowerTrimmed)) {
            // If we detected a navigation section, filter out all category items
            // Otherwise, only filter if it's a single word without quantities
            const hasQuantity = /\d|cup|tablespoon|teaspoon|ounce|pound|gram|kg|ml|l|piece|slice|clove|head|bunch|can|package|box|bag|bottle|inch|cm|lb|oz|tbsp|tsp/i.test(trimmed);
            if (isNavigationSection || !hasQuantity) {
                continue;
            }
        }

        // Remove HTML tags and clean the text
        const cleaned = sanitizeHtml(trimmed, { allowedTags: [] }).trim();
        if (!cleaned || cleaned.length < 2) continue;

        // Skip items that are just single category words (already filtered, but double-check)
        if (cleaned.split(/\s+/).length === 1 && NAVIGATION_CATEGORIES.includes(cleaned.toLowerCase())) {
            continue;
        }

        // Avoid duplicates
        const normalized = cleaned.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        filtered.push({ name: cleaned });
    }

    return filtered;
}

/**
 * Clean instruction text by removing HTML, attribution, and unwanted content
 */
function cleanInstructionText(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // Remove HTML tags and clean (including img tags and their content)
    let cleaned = sanitizeHtml(text, { 
        allowedTags: [],
        // Remove img tags and their attributes completely
        allowedAttributes: {}
    });

    // Remove any remaining HTML-like patterns (img tags that might have been missed)
    cleaned = cleaned.replace(/<img[^>]*>/gi, '');
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Remove attribution patterns
    for (const pattern of ATTRIBUTION_PATTERNS) {
        cleaned = cleaned.replace(pattern, '').trim();
    }

    // Remove repeated attribution text (case-insensitive)
    cleaned = cleaned.replace(/dotdash\s+meredith\s+food\s+studios/gi, '');

    // Remove extra whitespace, newlines, and multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove leading/trailing punctuation that might be left over
    cleaned = cleaned.replace(/^[.,;:\s]+|[.,;:\s]+$/g, '').trim();

    return cleaned;
}

/**
 * Check if an instruction is likely a tip/hint rather than an actual step
 */
function isLikelyTip(text: string): boolean {
    if (!text || text.length < 10) return false;

    // Check against tip patterns
    for (const pattern of TIP_PATTERNS) {
        if (pattern.test(text)) {
            return true;
        }
    }

    // Very short instructions that are likely tips
    if (text.length < 30 && !/[.!?]/.test(text)) {
        return true;
    }

    return false;
}

/**
 * Filter unwanted items from instructions array
 * Removes HTML tags, attribution text, tips, and empty instructions
 */
export function filterInstructions(instructions: (string | Instruction)[]): Instruction[] {
    if (!Array.isArray(instructions)) return [];

    const filtered: Instruction[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < instructions.length; i++) {
        const item = instructions[i];
        let text = '';
        let title = '';

        // Handle both string and Instruction object formats
        if (typeof item === 'string') {
            text = item;
            title = `Step ${filtered.length + 1}`;
        } else if (item && typeof item === 'object') {
            text = item.description || '';
            title = item.title || `Step ${filtered.length + 1}`;
        } else {
            continue;
        }

        if (!text) continue;

        // Clean the text
        const cleaned = cleanInstructionText(text);
        if (!cleaned || cleaned.length < 10) continue;

        // Skip if it's just attribution text
        if (cleaned.toLowerCase().trim() === 'dotdash meredith food studios') {
            continue;
        }

        // Skip if it's likely a tip (especially if it appears after multiple real instructions)
        // Allow tips if they're the first few items (might be part of instructions)
        if (filtered.length > 2 && isLikelyTip(cleaned)) {
            continue;
        }

        // Skip very short items that are likely fragments or noise
        if (cleaned.length < 15 && !/[.!?]/.test(cleaned)) {
            continue;
        }

        // Avoid duplicates (with some tolerance for minor variations)
        const normalized = cleaned.toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        filtered.push({
            title: sanitizeHtml(title, { allowedTags: [] }),
            description: cleaned
        });
    }

    return filtered;
}

/**
 * Filter both ingredients and instructions from a recipe-like object
 */
export function filterRecipeData(data: {
    ingredients?: string[] | Ingredient[];
    instructions?: string[] | Instruction[];
}): {
    ingredients: Ingredient[];
    instructions: Instruction[];
} {
    let ingredients: Ingredient[] = [];
    let instructions: Instruction[] = [];

    if (data.ingredients) {
        if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
            // Check if it's already Ingredient[] or string[]
            if (typeof data.ingredients[0] === 'string') {
                ingredients = filterIngredients(data.ingredients as string[]);
            } else {
                // Convert Ingredient[] to string[] for filtering, then back
                const stringIngredients = (data.ingredients as Ingredient[]).map(ing => ing.name);
                ingredients = filterIngredients(stringIngredients);
            }
        }
    }

    if (data.instructions) {
        if (Array.isArray(data.instructions) && data.instructions.length > 0) {
            instructions = filterInstructions(data.instructions);
        }
    }

    return { ingredients, instructions };
}

