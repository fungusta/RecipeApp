import { NextRequest, NextResponse } from 'next/server';
import { deleteRecipe, getRecipeById, updateRecipe } from '@/lib/database';
import { ensureDatabaseInitialized } from '@/lib/server-init';

export async function GET({ params }: { params: { id: string } }) {
    try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();

        const recipeId = params.id;

        const recipe = await getRecipeById(recipeId);

        const parsedRecipe = recipe ? {
            ...recipe,
            ingredients: typeof recipe.ingredients === 'string'
                ? JSON.parse(recipe.ingredients)
                : recipe.ingredients,
            instructions: typeof recipe.instructions === 'string'
                ? JSON.parse(recipe.instructions)
                : recipe.instructions
        } : null;

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

export async function DELETE({ params }: { params: { id: string } }) {
    try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();        

        const recipeId = params.id;

        const success = await deleteRecipe(recipeId);

        return NextResponse.json({
            success: success,
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Ensure database is initialized
        await ensureDatabaseInitialized();
        
        const recipeId = params.id;
        const body = await request.json();

        const success = await updateRecipe(recipeId, body);

        return NextResponse.json({
            success: success,
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