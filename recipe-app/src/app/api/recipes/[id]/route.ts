import { NextRequest, NextResponse } from 'next/server';
import { deleteRecipe, getRecipeById, updateRecipe } from '@/lib/database';
import { ensureDatabaseInitialized } from '@/lib/server-init';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
    try {
        await ensureDatabaseInitialized();

        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const recipeId = resolvedParams.id;

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        // Check ownership - handle both camelCase and snake_case field names
        const recipeCreatorId = (recipe as any).creatorId || (recipe as any).creator_id;
        if (recipeCreatorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: You do not have access to this recipe' },
                { status: 403 }
            );
        }

        let ingredients = recipe.ingredients;
        let instructions = recipe.instructions;
        
        if (typeof recipe.ingredients === 'string') {
            try {
                ingredients = JSON.parse(recipe.ingredients);
            } catch (e) {
                console.error(`[GET /api/recipes/[id]] Failed to parse ingredients for recipe ${recipeId}:`, e);
                ingredients = [];
            }
        }
        
        if (typeof recipe.instructions === 'string') {
            try {
                instructions = JSON.parse(recipe.instructions);
            } catch (e) {
                console.error(`[GET /api/recipes/[id]] Failed to parse instructions for recipe ${recipeId}:`, e);
                instructions = [];
            }
        }

        const parsedRecipe = {
            ...recipe,
            ingredients,
            instructions
        };

        // Return successful response
        return NextResponse.json({
            success: true,
            data: parsedRecipe,
        });

    } catch (error) {
        console.error('Error in GET /api/recipes/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const recipeId = resolvedParams.id;

    try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        // Check if recipe exists and user owns it
        const recipe = await getRecipeById(recipeId);
        
        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        const recipeCreatorId = recipe.creatorId;
        if (recipeCreatorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: You do not own this recipe' },
                { status: 403 }
            );
        }

        const success = await deleteRecipe(recipeId);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /api/recipes/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const recipeId = resolvedParams.id;

    try {
        const body = await request.json();
        
        // Validate request body
        if (!body || typeof body !== 'object') {
            return NextResponse.json({
                success: false,
                error: 'Invalid request body'
            }, { status: 400 });
        }

        // Validate that at least one field is being updated
        const allowedFields = ['title', 'description', 'category', 'ingredients', 'instructions', 'image', 'recipeUrl'];
        const hasValidField = Object.keys(body).some(key => allowedFields.includes(key));
        
        if (!hasValidField) {
            return NextResponse.json({
                success: false,
                error: 'No valid fields provided for update'
            }, { status: 400 });
        }

        // Validate field types if provided
        if (body.title !== undefined && typeof body.title !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Title must be a string'
            }, { status: 400 });
        }

        if (body.description !== undefined && typeof body.description !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Description must be a string'
            }, { status: 400 });
        }

        if (body.ingredients !== undefined && !Array.isArray(body.ingredients)) {
            return NextResponse.json({
                success: false,
                error: 'Ingredients must be an array'
            }, { status: 400 });
        }

        if (body.instructions !== undefined && !Array.isArray(body.instructions)) {
            return NextResponse.json({
                success: false,
                error: 'Instructions must be an array'
            }, { status: 400 });
        }

        // Ensure database is initialized
        await ensureDatabaseInitialized();

        // Check if recipe exists and user owns it
        const recipe = await getRecipeById(recipeId);
        
        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        // Check ownership
        const recipeCreatorId = recipe.creatorId;
        if (recipeCreatorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: You do not own this recipe' },
                { status: 403 }
            );
        }

        const updatedRecipe = await updateRecipe(recipeId, body);

        if (!updatedRecipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedRecipe,
            message: 'Recipe updated successfully'
        });
    } catch (error) {
        console.error('Error in PUT /api/recipes/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}