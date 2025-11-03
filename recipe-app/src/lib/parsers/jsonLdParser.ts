import { Ingredient, Instruction, Recipe } from '@/data/recipes';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

/**
 * Parse recipe from URL using JSON-LD structured data.
 * Falls back to HTML parsing if no JSON-LD Recipe schema is found.
 * 
 * @param url - The URL of the recipe page to parse
 * @returns Parsed Recipe object, or null if parsing fails
 */
export async function parseUrlToRecipeDataUsingJsonLdParser(url: string): Promise<Recipe | null> {
    const $ = await getCheerioFromUrl(url);
    if (!$) {
        console.error('[JSON-LD Parser] Failed to fetch HTML from URL:', url);
        return null;
    }

    const scripts = $('script[type="application/ld+json"]');
    let recipe: Recipe | null = null;

    // Loop through all JSON-LD scripts until we find a Recipe
    scripts.each((index, element) => {
        const scriptContent = $(element).html();
        if (!scriptContent) return;

        try {
            const data = JSON.parse(scriptContent);
            const recipeData = findRecipeInJsonLd(data);

            if (recipeData) {
                recipe = parseJsonLdRecipe(recipeData, $);
                return false; // Stop iteration
            }
        } catch (error) {
            // Silently skip malformed JSON-LD scripts
            // Only log if it's a non-JSON parsing error
            if (error instanceof SyntaxError) {
                return; // Continue to next script
            }
            console.error('[JSON-LD Parser] Error parsing script:', error instanceof Error ? error.message : String(error));
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
 * 
 * @param url - The URL to fetch
 * @returns Cheerio API instance, or null if fetch fails
 */
async function getCheerioFromUrl(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
        return await cheerio.fromURL(url);
    } catch (error) {
        console.error('[JSON-LD Parser] Failed to fetch URL:', url, error instanceof Error ? error.message : String(error));
        return null;
    }
}

/**
 * Find a Recipe object in JSON-LD data structure.
 * Handles various structures: single objects, arrays, @graph properties, and nested objects.
 * 
 * @param data - The JSON-LD data to search
 * @returns Recipe object if found, null otherwise
 */
function findRecipeInJsonLd(data: any): any | null {
    if (!data) return null;

    // Direct match
    if (isRecipeType(data['@type'])) return data;

    // Array form
    if (Array.isArray(data)) {
        for (const item of data) {
            const found = findRecipeInJsonLd(item);
            if (found) return found;
        }
    }

    // @graph property
    if (Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
            const found = findRecipeInJsonLd(item);
            if (found) return found;
        }
    }

    // Nested objects (mainEntity, itemListElement, etc.)
    if (typeof data === 'object') {
        for (const key in data) {
            const val = data[key];
            if (val && typeof val === 'object') {
                const found = findRecipeInJsonLd(val);
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
    return {
        id: Date.now().toString(),
        title: extractTitle(data),
        description: extractDescription(data),
        image: extractImage(data),
        ingredients: extractIngredients(data),
        instructions: extractInstructions(data)
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
    const ingredients = extractHtmlIngredients($);
    const instructions = extractHtmlInstructions($);

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