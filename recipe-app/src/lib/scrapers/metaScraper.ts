import { Ingredient, Instruction, Recipe, RECIPE_TEXT_FORMAT } from "@/data/recipes";
import { fetchHtml, FetchError } from "@/lib/utils/fetchHtml";
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import { isInstagramURL } from "@/lib/parsers/urlParser";
import { callOpenAI } from "@/lib/apis/openai";
import customRules from "../utils/customRules";


export async function scrapeRecipeFromMetaTags(url: string): Promise<Recipe | null> {
    console.log('[Meta Scraper] Starting scrape for URL:', url);

    if (isInstagramURL(url)) {
        console.log('[Meta Scraper] ✓ Detected Instagram URL, routing to Instagram parser');
        return scrapeInstagramMetaTags(url);
    }
    console.log('[Meta Scraper] Using regular meta scraper');
    return scrapeRegularMetaTags(url);
}

async function scrapeInstagramMetaTags(url: string): Promise<Recipe | null> {
    console.log('[Instagram Parser] ========================================');
    console.log('[Instagram Parser] Starting Instagram meta tag scraping');
    console.log('[Instagram Parser] URL:', url);

    try {
        console.log('[Instagram Parser] Step 1: Fetching HTML...');
        const html = await fetchHtml(url);
        console.log('[Instagram Parser] ✓ HTML fetched, length:', html.length, 'characters');

        console.log('[Instagram Parser] Step 2: Extracting meta tags...');
        const metascraperInstance = metascraper([
            metascraperTitle(),
            metascraperDescription(),
            metascraperImage(),
        ]);

        const meta = await metascraperInstance({ html, url });
        console.log('[Instagram Parser] ✓ Meta tags extracted:');
        console.log('[Instagram Parser]   - Title:', meta.title || '(not found)');
        console.log('[Instagram Parser]   - Description:', meta.description ? `${meta.description.substring(0, 100)}...` : '(not found)');
        console.log('[Instagram Parser]   - Image:', meta.image ? `${meta.image.substring(0, 80)}...` : '(not found)');

        console.log('[Instagram Parser] Step 3: Extracting recipe from caption...');
        const caption = meta.title || meta.description;
        console.log('[Instagram Parser] Using caption source:', meta.title ? 'title' : 'description');
        console.log('[Instagram Parser] Caption length:', caption?.length || 0);

        if (!caption) {
            console.warn('[Instagram Parser] ⚠️ No caption found in meta tags');
            return null;
        }

        const recipe = await extractRecipeFromInstagramCaption(caption);

        if (!recipe) {
            console.error('[Instagram Parser] ✗ Failed to extract recipe from caption');
            return null;
        }

        console.log('[Instagram Parser] ✓ Recipe extracted successfully:');
        console.log('[Instagram Parser]   - Title:', recipe.title);
        console.log('[Instagram Parser]   - Ingredients count:', recipe.ingredients?.length || 0);
        console.log('[Instagram Parser]   - Instructions count:', recipe.instructions?.length || 0);
        console.log('[Instagram Parser]   - Has image:', !!recipe.image);

        const finalRecipe = {
            id: Date.now().toString(),
            title: recipe.title || '',
            description: recipe.description || meta.description || '',
            image: recipe.image || meta.image || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
        };

        console.log('[Instagram Parser] ✓ Final recipe constructed');
        console.log('[Instagram Parser] ========================================');
        return finalRecipe;
    } catch (error) {
        console.error('[Instagram Parser] ✗ Error during parsing:');
        if (error instanceof FetchError) {
            console.error('[Instagram Parser]   - Type: FetchError');
            console.error('[Instagram Parser]   - Message:', error.message);
            console.error('[Instagram Parser]   - URL:', error.url);
        } else {
            console.error('[Instagram Parser]   - Type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[Instagram Parser]   - Message:', error instanceof Error ? error.message : String(error));
        }
        console.log('[Instagram Parser] ========================================');
        return null;
    }
}

async function scrapeRegularMetaTags(url: string): Promise<Recipe | null> {
    console.log('Parsing URL using Regular Meta Scraper:', url);
    try {
        const html = await fetchHtml(url);
        const metascraperInstance = metascraper([
            metascraperTitle(),
            metascraperDescription(),
            metascraperImage(),
            customRules,
        ]);

        const meta = await metascraperInstance({ html, url });
        console.log(meta);

        // Parse ingredients and instructions from description
        const ingredients: Ingredient[] = [];
        const instructions: Instruction[] = [];

        return {
            id: Date.now().toString(),
            title: meta.title || '',
            description: meta.description || '',
            image: meta.image || '',
            ingredients,
            instructions
        };
    } catch (error) {
        if (error instanceof FetchError) {
            console.error('[Meta Scraper] Failed to fetch URL:', url, error.message);
            return null;
        }
        console.error('[Meta Scraper] Error processing recipe:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

async function extractRecipeFromInstagramCaption(caption?: string): Promise<Recipe | null> {
    console.log('[Caption Parser] Starting recipe extraction from caption');

    if (!caption) {
        console.warn('[Caption Parser] ⚠️ No caption provided');
        return null;
    }

    console.log('[Caption Parser] Caption preview:', caption.substring(0, 150) + (caption.length > 150 ? '...' : ''));
    console.log('[Caption Parser] Caption length:', caption.length, 'characters');

    try {
        console.log('[Caption Parser] Step 1: Crafting OpenAI prompt...');
        const prompt = craftOpenAIPrompt(caption);
        console.log('[Caption Parser] ✓ Prompt created, length:', prompt.length, 'characters');
        console.log('[Caption Parser] Prompt preview:', prompt.substring(0, 200) + '...');

        console.log('[Caption Parser] Step 2: Calling OpenAI API...');
        const response = await callOpenAI(
            prompt,
            { format: RECIPE_TEXT_FORMAT }
        );

        if (!response) {
            console.error('[Caption Parser] ✗ OpenAI returned null response');
            return null;
        }

        console.log('[Caption Parser] ✓ OpenAI response received');
        console.log('[Caption Parser] Response length:', response.length, 'characters');
        console.log('[Caption Parser] Response preview:', response.substring(0, 200) + '...');

        console.log('[Caption Parser] Step 3: Parsing JSON response...');
        const parsed = JSON.parse(response);
        console.log('[Caption Parser] ✓ JSON parsed successfully');
        console.log('[Caption Parser] Parsed structure:', {
            hasRecipe: !!parsed.recipe,
            recipeCount: Array.isArray(parsed.recipe) ? parsed.recipe.length : 0
        });

        // Extract first recipe from array (based on your schema)
        const recipe = Array.isArray(parsed.recipe) && parsed.recipe.length > 0
            ? parsed.recipe[0]
            : parsed.recipe;

        if (!recipe) {
            console.error('[Caption Parser] ✗ No recipe found in parsed response');
            return null;
        }

        console.log('[Caption Parser] ✓ Recipe extracted from response');
        return recipe;
    } catch (error) {
        console.error('[Caption Parser] ✗ Error during extraction:');
        if (error instanceof SyntaxError) {
            console.error('[Caption Parser]   - Type: JSON Parse Error');
            console.error('[Caption Parser]   - Message:', error.message);
            console.error('[Caption Parser]   - This usually means OpenAI returned invalid JSON');
        } else {
            console.error('[Caption Parser]   - Type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[Caption Parser]   - Message:', error instanceof Error ? error.message : String(error));
        }
        return null;
    }
}

function craftOpenAIPrompt(caption: string): string {
    const prompt = `
        Extract a structured recipe from the following text. 
        The output must strictly follow the provided JSON schema.
        
        Input:
        ${caption}
        
        Guidelines:
        - Infer a clear, descriptive title and a short, engaging description of the dish.
        - Extract all ingredients mentioned.
        - Each ingredient should include its quantity and unit if available.
        - Include short notes (e.g. “smoked”, “optional”, “cut into cubes”) only if relevant.
        - Break the preparation process into **clear, numbered steps**.
        - Each step should describe one main action but may include brief clarifiers such as tools, times, or sensory cues.
        - Avoid merging multiple unrelated actions in a single step.
        - Avoid unnecessary storytelling or commentary, but do not oversimplify to the point that context is lost.
        - Example: Instead of "Mix spices, coat salmon, and bake", write separate but informative steps like:
            1. "Combine all spices in a small bowl to make the Cajun mix."
            2. "Coat the salmon cubes evenly with the spice mix."
            3. "Bake for 12 minutes at 240°C (460°F) until golden and flaky."
        - When specifying temperatures, always include **both Celsius and Fahrenheit** formats in parentheses, e.g. “Bake at 180°C (350°F)” or “Chill at 4°C (39°F)”.
        - Write the recipe as if for a home cook — friendly, practical, and clear.
        - Output must be valid JSON following the schema exactly — no extra text outside JSON.
        `;
    


    console.log('[Prompt Crafting] Created prompt for caption');
    return prompt;
}