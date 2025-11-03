import { createRecipe } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseInitialized } from "@/lib/server-init";
import { parseUrlToRecipeDataUsingRecipeScraper } from "@/lib/scrapers/recipeScraper";
import { parseUrlToRecipeDataUsingJsonLdParser } from "@/lib/parsers/jsonLdParser";

async function parseRecipe(url: string) {
    console.log(url);
    try {
        // TODO: Add validation for the URL (Valid URL and also allowed domains for recipeScraper), not sure if still supported
        const recipe = await parseUrlToRecipeDataUsingRecipeScraper(url);
        console.log(recipe);
        return recipe;
    } catch (error) {
        console.error('Error in parseRecipe:', error);
        const recipeJsonLd = await parseUrlToRecipeDataUsingJsonLdParser(url);
        console.log(recipeJsonLd);
        return recipeJsonLd;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Ensure database is initialized before attempting to create a recipe
        await ensureDatabaseInitialized();

        const body = await request.json();

        const parsedRecipe = await parseRecipe(body.url);

        console.log(parsedRecipe);

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