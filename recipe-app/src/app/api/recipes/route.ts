import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, createRecipe, searchRecipes, getRecipesByCreatorId } from '@/lib/database';
import { ensureDatabaseInitialized } from '@/lib/server-init';
import { auth } from '@clerk/nextjs/server';

// GET /api/recipes - Get all recipes with optional query parameters
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const limit = searchParams.get('limit');

  // Log extracted query parameters
  console.log('[GET /api/recipes] Query params:', {
    search: search || null,
    creatorId: userId,
    category: category || null,
    limit: limit || null
  });

  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    let recipes;

    // Use search function if search query is provided
    if (search) {
      // If search is provided, search all recipes and then filter by creator if needed
      recipes = await searchRecipes(search);
      console.log('[GET /api/recipes] After search:', recipes.length, 'recipes found');
      // Filter by creator if userId is provided
      if (userId) {
        const beforeCount = recipes.length;
        recipes = recipes.filter(recipe => recipe.creatorId === userId);
        console.log(`[GET /api/recipes] After filtering by creator (${userId}):`,
          `${beforeCount} -> ${recipes.length} recipes`);
      }
    } else if (userId) {
      recipes = await getRecipesByCreatorId(userId);
      console.log('[GET /api/recipes] After getRecipesByCreatorId:', recipes.length, 'recipes found');
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
    const parsedRecipes = recipes.map(recipe => {
      let ingredients = recipe.ingredients;
      let instructions = recipe.instructions;
      
      if (typeof recipe.ingredients === 'string') {
        try {
          ingredients = JSON.parse(recipe.ingredients);
        } catch (e) {
          console.error(`[GET /api/recipes] Failed to parse ingredients for recipe ${recipe.id}:`, e);
          ingredients = [];
        }
      }
      
      if (typeof recipe.instructions === 'string') {
        try {
          instructions = JSON.parse(recipe.instructions);
        } catch (e) {
          console.error(`[GET /api/recipes] Failed to parse instructions for recipe ${recipe.id}:`, e);
          instructions = [];
        }
      }
      
      return {
        ...recipe,
        ingredients,
        instructions
      };
    });

    console.log('[GET /api/recipes] Final result:', parsedRecipes.length, 'recipes');

    // Return successful response
    return NextResponse.json({
      success: true,
      data: parsedRecipes,
      count: parsedRecipes.length,
      // Include query parameters in response for debugging
      query: {
        search: search || null,
        creatorId: userId || null,
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

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validate required fields
  if (!body.title || !body.description) {
    return NextResponse.json(
      {
        success: false,
        error: 'Title and description are required'
      },
      { status: 400 }
    );
  }

  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    const createdRecipe = await createRecipe({
      title: body.title,
      creatorId: userId,
      recipeUrl: body.recipeUrl || null,
      description: body.description,
      ingredients: body.ingredients || [],
      instructions: body.instructions || [],
      image: body.image || null,
      category: body.category || null
    });

    return NextResponse.json({
      success: true,
      data: createdRecipe,
      message: 'Recipe created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/recipes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
