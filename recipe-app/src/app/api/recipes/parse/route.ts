import { createRecipe, Recipe } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseInitialized } from "@/lib/server-init";
import { normalizeUrl, parseUrl } from "@/lib/parsers/urlParser";

async function parseRecipe(url: string): Promise<Recipe | null> {
    const normalizedUrl = normalizeUrl(url);
    const strategy = await parseUrl(normalizedUrl);
    
    if (strategy) {
        for (const scraper of strategy.scrapers) {
            const recipe = await scraper(normalizedUrl);
            if (recipe !== null) {
                return recipe;
            }
        }
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

        const createdRecipe = await createRecipe({
            title: parsedRecipe?.title || '',
            creatorId: parsedRecipe?.creatorId || 'placeholder',
            recipeUrl: body.url || '',
            description: parsedRecipe?.description || '',
            ingredients: parsedRecipe?.ingredients || [],
            instructions: parsedRecipe?.instructions || [],
            image: parsedRecipe?.image || ''
        });


        return NextResponse.json({
            success: true,
            data: createdRecipe,
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