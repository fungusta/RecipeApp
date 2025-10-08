import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, createRecipe, searchRecipes } from '@/lib/database';
import { ensureDatabaseInitialized } from '@/lib/server-init';

// GET /api/recipes - Get all recipes with optional query parameters
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    let recipes;

    // Use search function if search query is provided
    if (search) {
      recipes = await searchRecipes(search);
    } else {
      recipes = await getAllRecipes();
    }

    // Apply category filter if provided
    if (category) {
      recipes = recipes.filter(recipe => 
        recipe.category === category
      );
    }

    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit);
      recipes = recipes.slice(0, limitNum);
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

    // Return successful response
    return NextResponse.json({
      success: true,
      data: parsedRecipes,
      count: parsedRecipes.length,
      // Include query parameters in response for debugging
      query: {
        search: search || null,
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

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    // Parse the request body
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and description are required' 
        },
        { status: 400 }
      );
    }

    // Create recipe in database
    const newRecipe = await createRecipe({
      title: body.title,
      description: body.description,
      category: body.category,
      ingredients: body.ingredients || [],
      instructions: body.instructions || [],
      image: body.image
    });

    // Parse JSON fields for response
    const parsedRecipe = {
      ...newRecipe,
      ingredients: typeof newRecipe.ingredients === 'string' 
        ? JSON.parse(newRecipe.ingredients) 
        : newRecipe.ingredients,
      instructions: typeof newRecipe.instructions === 'string' 
        ? JSON.parse(newRecipe.instructions) 
        : newRecipe.instructions
    };

    // Return successful response
    return NextResponse.json({
      success: true,
      data: parsedRecipe,
      message: 'Recipe created successfully'
    }, { status: 201 });

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
