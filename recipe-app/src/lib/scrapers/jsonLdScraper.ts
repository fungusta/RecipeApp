import { Ingredient, Instruction, Recipe } from '@/data/recipes';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { filterRecipeData } from '@/lib/utils/recipe/filterRecipeData';
import { fetchHtml, FetchError } from '@/lib/utils/fetchHtml';

/**
 * Scrape recipe from URL using JSON-LD structured data.
 * Falls back to HTML parsing if no JSON-LD Recipe schema is found.
 * 
 * @param url - The URL of the recipe page to scrape
 * @returns Scraped Recipe object, or null if scraping fails
 */
export async function scrapeRecipeFromJsonLd(url: string): Promise<Recipe | null> {
    console.log('Scraping URL using JSON-LD Scraper:', url);
    const $ = await getCheerioFromUrl(url);
    if (!$) {
        console.error('[JSON-LD Scraper] Failed to fetch HTML from URL:', url);
        return null;
    }

    const scripts = $('script[type="application/ld+json"]');
    let recipe: Recipe | null = null;

    console.log(`[JSON-LD Scraper] Found ${scripts.length} JSON-LD script(s)`);

    // Loop through all JSON-LD scripts until we find a Recipe
    scripts.each((index, element) => {
        const scriptContent = $(element).html();
        if (!scriptContent) return;

        try {
            const data = JSON.parse(scriptContent);
            console.log(`[JSON-LD Scraper] Successfully parsed JSON, searching for recipe...`);
            const recipeData = findRecipeInJsonLd(data);

            if (recipeData) {
                console.log(`[JSON-LD Scraper] Found recipe data!`);
                recipe = parseJsonLdRecipe(recipeData, $);
                return false; // Stop iteration
            } else {
                console.log(`[JSON-LD Scraper] No recipe found in script ${index + 1}`);
            }
        } catch (error) {
            // Log JSON parsing errors for debugging
            if (error instanceof SyntaxError) {
                console.error(`[JSON-LD Scraper] JSON syntax error in script ${index + 1}:`, error.message);
                console.error(`[JSON-LD Scraper] First 200 chars of content:`, scriptContent.substring(0, 200));
                return; // Continue to next script
            }
            console.error('[JSON-LD Scraper] Error parsing script:', error instanceof Error ? error.message : String(error));
        }
    });

    // Fallback to HTML parsing if no Recipe found in JSON-LD
    if (!recipe) {
        recipe = parseHtmlRecipe($, url);
    }

    return recipe;
}

/**
 * Fetch HTML from URL and return Cheerio instance.
 * Uses fetchHtml utility with got for better header control and reliability.
 * 
 * @param url - The URL to fetch
 * @returns Cheerio API instance, or null if fetch fails
 */
async function getCheerioFromUrl(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
        const html = await fetchHtml(url);
        return cheerio.load(html);
    } catch (error) {
        if (error instanceof FetchError) {
            console.error('[JSON-LD Scraper] Failed to fetch URL:', url, error.message);
            return null;
        }
        throw error;
    }
}

/**
 * Find a Recipe object in JSON-LD data structure.
 * Handles various structures: single objects, arrays, @graph properties, and nested objects.
 * 
 * @param data - The JSON-LD data to search
 * @returns Recipe object if found, null otherwise
 */
function findRecipeInJsonLd(data: any, depth: number = 0): any | null {
    if (!data) return null;
    
    // Prevent infinite recursion
    if (depth > 10) return null;

    // Direct match - check if this object itself is a Recipe
    if (isRecipeType(data['@type'])) {
        console.log(`[JSON-LD Scraper] Found recipe at depth ${depth}, type:`, data['@type']);
        return data;
    }

    // Array form
    if (Array.isArray(data)) {
        console.log(`[JSON-LD Scraper] Processing array with ${data.length} items at depth ${depth}`);
        for (const item of data) {
            const found = findRecipeInJsonLd(item, depth + 1);
            if (found) return found;
        }
    }

    // @graph property
    if (Array.isArray(data['@graph'])) {
        console.log(`[JSON-LD Scraper] Processing @graph with ${data['@graph'].length} items at depth ${depth}`);
        for (const item of data['@graph']) {
            const found = findRecipeInJsonLd(item, depth + 1);
            if (found) return found;
        }
    }

    // Nested objects (mainEntity, itemListElement, etc.)
    if (typeof data === 'object' && !Array.isArray(data)) {
        for (const key in data) {
            const val = data[key];
            if (val && typeof val === 'object') {
                const found = findRecipeInJsonLd(val, depth + 1);
                if (found) return found;
            }
        }
    }

    return null;
}

function isRecipeType(type: any): boolean {
    if (!type) return false;
    const types = Array.isArray(type) ? type : [type];
    return types.some(t => typeof t === 'string' && t.toLowerCase().includes('recipe'));
}


/**
 * Parse Recipe object from JSON-LD into Recipe interface.
 * Orchestrates extraction of all recipe properties.
 * 
 * @param data - The Recipe JSON-LD object
 * @param $ - Cheerio instance (currently unused, kept for potential future use)
 * @returns Parsed Recipe object
 */
function parseJsonLdRecipe(data: any, $: cheerio.CheerioAPI): Recipe {
    const rawIngredients = extractIngredients(data);
    const rawInstructions = extractInstructions(data);

    // Filter unwanted content
    const { ingredients, instructions } = filterRecipeData({
        ingredients: rawIngredients.map(ing => ing.name),
        instructions: rawInstructions
    });

    return {
        id: Date.now().toString(),
        title: extractTitle(data),
        description: extractDescription(data),
        image: extractImage(data),
        ingredients,
        instructions
    };
}

/**
 * Extract image URL from Recipe data.
 * Handles string, object with url property, or array of images.
 * 
 * @param data - The Recipe data object
 * @returns Image URL string, or empty string if not found
 */
function extractImage(data: any): string {
    if (!data.image) return '';

    // String format
    if (typeof data.image === 'string') {
        return data.image;
    }

    // Object with url property
    if (data.image.url) {
        return data.image.url;
    }

    // Array of images - take the first one
    if (Array.isArray(data.image) && data.image.length > 0) {
        const firstImage = data.image[0];
        if (typeof firstImage === 'string') {
            return firstImage;
        }
        if (firstImage.url) {
            return firstImage.url;
        }
    }

    return '';
}

/**
 * Extract title from Recipe data.
 * Tries name, headline, title in that order.
 * 
 * @param data - The Recipe data object
 * @returns Recipe title, or 'Untitled Recipe' as fallback
 */
function extractTitle(data: any): string {
    return sanitizeHtml(data.name || data.headline || data.title || 'Untitled Recipe');
}

/**
 * Extract description from Recipe data.
 * 
 * @param data - The Recipe data object
 * @returns Recipe description, or empty string if not found
 */
function extractDescription(data: any): string {
    return sanitizeHtml(data.description || '');
}

/**
 * Extract ingredients from Recipe data.
 * Uses recipeIngredient (Recipe schema property) or falls back to ingredients.
 * Stores full ingredient text as name without parsing amounts.
 * 
 * @param data - The Recipe data object
 * @returns Array of Ingredient objects
 */
function extractIngredients(data: any): Ingredient[] {
    const ingredients: Ingredient[] = [];
    const ingredientData = data.recipeIngredient || data.ingredients;

    if (!ingredientData) return ingredients;

    const ingredientList = Array.isArray(ingredientData) ? ingredientData : [ingredientData];

    ingredientList.forEach((ing: any) => {
        let ingredientText = '';

        // Handle different ingredient formats
        if (typeof ing === 'string') {
            ingredientText = ing;
        } else if (ing.text) {
            ingredientText = ing.text;
        } else if (ing.name) {
            ingredientText = ing.name;
        }

        // Store full ingredient text as name, without parsing
        if (ingredientText) {
            ingredients.push({
                name: sanitizeHtml(ingredientText.trim())
            });
        }
    });

    return ingredients;
}

/**
 * Extract instructions from Recipe data.
 * Uses recipeInstructions (Recipe schema property) or falls back to instructions.
 * Handles string arrays, objects with text property, and HowToSection format.
 * 
 * @param data - The Recipe data object
 * @returns Array of Instruction objects
 */
function extractInstructions(data: any): Instruction[] {
    const instructions: Instruction[] = [];
    const instructionData = data.recipeInstructions || data.instructions;

    if (!instructionData) return instructions;

    const steps = Array.isArray(instructionData) ? instructionData : [instructionData];

    steps.forEach((step: any, index: number) => {
        // String format
        if (typeof step === 'string') {
            instructions.push({
                title: `Step ${index + 1}`,
                description: sanitizeHtml(step)
            });
        }
        // Object with text property
        else if (step.text) {
            instructions.push({
                title: step.name || step.text.slice(0, 50) || `Step ${index + 1}`,
                description: sanitizeHtml(step.text)
            });
        }
        // HowToSection format with itemListElement
        else if (step.itemListElement) {
            step.itemListElement.forEach((item: any, idx: number) => {
                if (item.text) {
                    instructions.push({
                        title: item.name || `Step ${idx + 1}`,
                        description: sanitizeHtml(item.text)
                    });
                }
            });
        }
    });

    return instructions;
}

/**
 * Fallback: Parse recipe from HTML elements directly.
 * Uses microdata, common CSS selectors, and meta tags.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @param url - Original URL for resolving relative image URLs
 * @returns Parsed Recipe object, or null if title cannot be found
 */
function parseHtmlRecipe($: cheerio.CheerioAPI, url: string): Recipe | null {
    const title = extractHtmlTitle($);
    if (!title) {
        return null;
    }

    const description = extractHtmlDescription($);
    const image = extractHtmlImage($, url);
    const rawIngredients = extractHtmlIngredients($);
    const rawInstructions = extractHtmlInstructions($);

    // Filter unwanted content
    const { ingredients, instructions } = filterRecipeData({
        ingredients: rawIngredients.map(ing => ing.name),
        instructions: rawInstructions
    });

    return {
        id: Date.now().toString(),
        title,
        description,
        image,
        ingredients,
        instructions
    };
}

/**
 * Extract title from HTML using various selectors.
 * Tries microdata, common CSS classes, and meta tags in order of preference.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @returns Recipe title, or empty string if not found
 */
function extractHtmlTitle($: cheerio.CheerioAPI): string {
    // Try multiple selectors in order of preference
    const selectors = [
        'h1',
        '[itemprop="name"]',
        '.recipe-title',
        '.recipe-name',
        'h1.recipe-title',
        'h1[itemprop="name"]',
        'meta[property="og:title"]'
    ];

    for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length > 0) {
            // For meta tags, get content attribute
            if (selector.includes('meta')) {
                const content = element.attr('content');
                if (content) return sanitizeHtml(content.trim());
            } else {
                const text = element.text();
                if (text) return sanitizeHtml(text.trim());
            }
        }
    }

    return '';
}

/**
 * Extract description from HTML using various selectors.
 * Tries microdata, common CSS classes, and meta tags.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @returns Recipe description, or empty string if not found
 */
function extractHtmlDescription($: cheerio.CheerioAPI): string {
    const selectors = [
        '[itemprop="description"]',
        '.recipe-description',
        '.recipe-summary',
        'meta[property="og:description"]',
        'meta[name="description"]'
    ];

    for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length > 0) {
            if (selector.includes('meta')) {
                const content = element.attr('content');
                if (content) return sanitizeHtml(content.trim());
            } else {
                const text = element.text();
                if (text) return sanitizeHtml(text.trim());
            }
        }
    }

    return '';
}

/**
 * Extract image URL from HTML using various selectors.
 * Converts relative URLs to absolute using the source URL.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @param url - Original URL for resolving relative paths
 * @returns Image URL string, or empty string if not found
 */
function extractHtmlImage($: cheerio.CheerioAPI, url: string): string {
    const selectors = [
        '[itemprop="image"]',
        '.recipe-image img',
        '.recipe-photo img',
        'meta[property="og:image"]',
        'img[itemprop="image"]'
    ];

    for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length > 0) {
            let imageUrl = '';

            if (selector.includes('meta')) {
                imageUrl = element.attr('content') || '';
            } else if (selector.includes('img')) {
                imageUrl = element.attr('src') || element.attr('content') || '';
            } else {
                imageUrl = element.attr('content') || element.attr('src') || '';
            }

            if (imageUrl) {
                // Make URL absolute if it's relative
                if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
                    try {
                        const urlObj = new URL(url);
                        imageUrl = new URL(imageUrl, urlObj.origin).href;
                    } catch (e) {
                        // Invalid URL, leave as is
                    }
                }
                return sanitizeHtml(imageUrl);
            }
        }
    }

    return '';
}

/**
 * Extract ingredients from HTML using various selectors.
 * Uses the first matching selector that finds ingredients.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @returns Array of Ingredient objects
 */
function extractHtmlIngredients($: cheerio.CheerioAPI): Ingredient[] {
    const ingredients: Ingredient[] = [];
    const selectors = [
        '[itemprop="recipeIngredient"]',
        '.ingredient',
        '.recipe-ingredient',
        'ul.ingredients li',
        'ol.ingredients li',
        'li[itemprop="recipeIngredient"]'
    ];

    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            elements.each((_, el) => {
                const text = $(el).text().trim();
                if (text) {
                    ingredients.push({
                        name: sanitizeHtml(text)
                    });
                }
            });
            break; // Use first selector that finds ingredients
        }
    }

    return ingredients;
}

/**
 * Extract instructions from HTML using various selectors.
 * Uses the first matching selector that finds instructions.
 * 
 * @param $ - Cheerio instance with parsed HTML
 * @returns Array of Instruction objects
 */
function extractHtmlInstructions($: cheerio.CheerioAPI): Instruction[] {
    const instructions: Instruction[] = [];
    const selectors = [
        '[itemprop="recipeInstructions"] li',
        '[itemprop="recipeInstructions"] p',
        '.instruction',
        '.recipe-instruction',
        '.step',
        'ol.instructions li',
        'ul.instructions li',
        'li[itemprop="recipeInstructions"]'
    ];

    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            elements.each((index, el) => {
                const text = $(el).text().trim();
                if (text) {
                    instructions.push({
                        title: `Step ${index + 1}`,
                        description: sanitizeHtml(text)
                    });
                }
            });
            break; // Use first selector that finds instructions
        }
    }

    return instructions;
}

function craftOpenAIPrompt(recipe: Recipe): string {
    const recipeJson = JSON.stringify(recipe, null, 2);
    
    const prompt = `
        Rewrite and format the following recipe object according to the guidelines below.
        The output must strictly follow the provided JSON schema.
        
        Input Recipe:
        ${recipeJson}
        
        Guidelines:
        - Maintain the core recipe information but improve clarity and formatting.
        - Ensure the title is clear, descriptive, and properly capitalized.
        - Write a short, engaging description that captures the essence of the dish.
        - Format ingredients clearly with quantities and units when available.
        - Include relevant preparation notes (e.g., "chopped", "optional", "at room temperature") when they add value.
        - Break instructions into clear, numbered steps.
        - Each step should describe one main action but may include brief clarifiers such as tools, times, or sensory cues.
        - Avoid merging multiple unrelated actions in a single step.
        - Avoid unnecessary storytelling or commentary, but maintain helpful context.
        - Example: Instead of "Mix spices, coat salmon, and bake", write separate but informative steps like:
            1. "Combine all spices in a small bowl to make the Cajun mix."
            2. "Coat the salmon cubes evenly with the spice mix."
            3. "Bake for 12 minutes at 240°C (460°F) until golden and flaky."
        - When specifying temperatures, always include **both Celsius and Fahrenheit** formats in parentheses, e.g. "Bake at 180°C (350°F)" or "Chill at 4°C (39°F)".
        - Standardize ingredient names (e.g., use consistent terminology).
        - Ensure instructions are in logical order and flow naturally.
        - Write the recipe as if for a home cook — friendly, practical, and clear.
        - Preserve all essential information from the input recipe.
        - Output must be valid JSON following the schema exactly — no extra text outside JSON.
        `;
    
    console.log('[Prompt Crafting] Created prompt for recipe object');
    return prompt;
}

