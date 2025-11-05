import { createRecipe, Recipe } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseInitialized } from "@/lib/server-init";
import { parseUrlToRecipeDataUsingRecipeScraper } from "@/lib/scrapers/recipeScraper";
import { parseUrlToRecipeDataUsingJsonLdScraper } from "@/lib/scrapers/jsonLdScraper";
import { parseUrlToRecipeDataUsingMetaScraper } from "@/lib/scrapers/metaScraper";

async function parseRecipe(url: string): Promise<Recipe | null> {
    console.log(url);
    // TODO: Add validation for the URL (Valid URL and also allowed domains for recipeScraper), not sure if still supported
    const recipe = await parseUrlToRecipeDataUsingRecipeScraper(url);
    if (recipe !== null) {
        console.log(recipe);
        return recipe;
    }
    
    console.log('Recipe scraper returned null, falling back to JSON-LD scraper');
    const recipeJsonLd = await parseUrlToRecipeDataUsingJsonLdScraper(url);
    if (recipeJsonLd !== null) {
        console.log(recipeJsonLd);
        return recipeJsonLd;
    }

    const recipeMeta = await parseUrlToRecipeDataUsingMetaScraper(url);
    if (recipeMeta !== null) {
        console.log(recipeMeta);
        return recipeMeta;
    }

    console.log('No recipe found');
    return null;
}

export async function POST(request: NextRequest) {
    try {
        // Ensure database is initialized before attempting to create a recipe
        await ensureDatabaseInitialized();

        const body = await request.json();

        const parsedRecipe = await parseRecipe(body.url);

        if (parsedRecipe === null) {
            return NextResponse.json({
                success: false,
                error: 'No recipe found'
            }, { status: 404 });
        }

        await createRecipe({
            title: parsedRecipe?.title || '',
            description: parsedRecipe?.description || '',
            ingredients: parsedRecipe?.ingredients || [],
            instructions: parsedRecipe?.instructions || [],
            image: parsedRecipe?.image || ''
        });
        

        return NextResponse.json({
            success: true,
            data: parsedRecipe,
            message: 'Recipe parsed successfully'
        });
    } catch (error) {
        console.error('Error in POST /api/recipes/parse:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to parse recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}