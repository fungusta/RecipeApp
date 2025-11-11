import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, createRecipe, searchRecipes, getRecipesByCreatorId } from '@/lib/database';
import { ensureDatabaseInitialized } from '@/lib/server-init';

// GET /api/recipes - Get all recipes with optional query parameters
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const creatorId = searchParams.get('creatorId');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // Log extracted query parameters
    console.log('[GET /api/recipes] Query params:', {
      search: search || null,
      creatorId: creatorId || null,
      category: category || null,
      limit: limit || null
    });

    let recipes;

    // Use search function if search query is provided
    if (creatorId) {
      recipes = await getRecipesByCreatorId(creatorId);
      console.log('[GET /api/recipes] After getRecipesByCreatorId:', recipes.length, 'recipes found');
    } else if (search) {
      recipes = await searchRecipes(search);
      console.log('[GET /api/recipes] After search:', recipes.length, 'recipes found');
    } else {
      recipes = await getAllRecipes();
      console.log('[GET /api/recipes] After getAllRecipes:', recipes.length, 'recipes found');
    }

    // Apply category filter if provided
    if (category) {
      const beforeCount = recipes.length;
      recipes = recipes.filter(recipe => 
        recipe.category === category
      );
      console.log(`[GET /api/recipes] After category filter (${category}):`, 
        `${beforeCount} -> ${recipes.length} recipes`);
    }

    // Apply limit if provided
    if (limit) {
      const beforeCount = recipes.length;
      const limitNum = parseInt(limit);
      recipes = recipes.slice(0, limitNum);
      console.log(`[GET /api/recipes] After limit (${limitNum}):`, 
        `${beforeCount} -> ${recipes.length} recipes`);
    }

    // Parse JSON fields for response
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: typeof recipe.ingredients === 'string' 
        ? JSON.parse(recipe.ingredients) 
        : recipe.ingredients,
      instructions: typeof recipe.instructions === 'string' 
        ? JSON.parse(recipe.instructions) 
        : recipe.instructions
    }));

    console.log('[GET /api/recipes] Final result:', parsedRecipes.length, 'recipes');

    // Return successful response
    return NextResponse.json({
      success: true,
      data: parsedRecipes,
      count: parsedRecipes.length,
      // Include query parameters in response for debugging
      query: {
        search: search || null,
        creatorId: creatorId || null,
        category: category || null,
        limit: limit || null
      }
    });

  } catch (error) {
    console.error('Error in GET /api/recipes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}