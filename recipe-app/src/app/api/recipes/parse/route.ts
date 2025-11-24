import { Recipe } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        
        if (!url) {
            return NextResponse.json({
                success: false,
                error: 'URL parameter is required'
            }, { status: 400 });
        }

        const parsedRecipe = await parseRecipe(url);

        if (parsedRecipe === null) {
            return NextResponse.json({
                success: false,
                error: 'No recipe found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: parsedRecipe,
            message: 'Recipe parsed successfully'
        });
    } catch (error) {
        console.error('Error in GET /api/recipes/parse:', error);
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