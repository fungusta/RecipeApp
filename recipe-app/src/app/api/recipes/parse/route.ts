import { createRecipe } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseInitialized } from "@/lib/server-init";
import recipeScraper from 'recipe-scraper';

async function parseRecipe(url: string) {
    console.log(url);
    // TODO: Add validation for the URL (Valid URL and also allowed domains for recipeScraper)
    const recipe = await recipeScraper(url);
   
    console.log(recipe);
    return recipe;
}

export async function POST(request: NextRequest) {
    try {
        // Ensure database is initialized before attempting to create a recipe
        await ensureDatabaseInitialized();

        const body = await request.json();

        const parsedRecipe = await parseRecipe(body.url);

        console.log(parsedRecipe);

        // await createRecipe(parsedRecipe);

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