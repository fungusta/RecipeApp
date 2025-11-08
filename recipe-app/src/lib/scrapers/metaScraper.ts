import { Recipe } from "@/data/recipes";
import { fetchHtml, FetchError } from "@/lib/utils/fetchHtml";
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import customRules from "@/lib/utils/customRules";
import { filterRecipeData } from "@/lib/utils/filterRecipeData";

export async function scrapeUrlMeta(url: string): Promise<Recipe | null> {
    console.log('Parsing URL using Meta Scraper:', url);
    try {
        const html = await fetchHtml(url);
        const metascraperInstance = metascraper([
            metascraperDescription(),
            metascraperImage(),
            metascraperTitle(),
            customRules,
        ]);

        const meta = await metascraperInstance({ html, url });
        console.log(meta);

        // Parse raw ingredients and instructions
        const rawIngredients = meta.ingredients ? JSON.parse(meta.ingredients) : [];
        const rawInstructions = meta.instructions ? JSON.parse(meta.instructions) : [];

        // Filter unwanted content
        const { ingredients, instructions } = filterRecipeData({
            ingredients: rawIngredients,
            instructions: rawInstructions
        });

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