import { NextRequest, NextResponse } from "next/server";
import { Ingredient, Instruction } from "@/data/recipes";
import { callOpenAI } from "@/lib/apis/openai";
import { RECIPE_TEXT_FORMAT, removeDuplicateInstructionDescriptions } from "@/data/recipes";
import { auth } from "@clerk/nextjs/server";

/**
 * Request body interface for format endpoint
 */
interface FormatRecipeRequest {
    title: string;
    description: string;
    ingredients: Ingredient[];
    instructions: Instruction[];
}

/**
 * Craft OpenAI prompt for formatting a recipe
 */
function craftFormattingPrompt(data: FormatRecipeRequest): string {
    const recipeData = {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions
    };
    const recipeJson = JSON.stringify(recipeData, null, 2);

    return `
        Rewrite the recipe data below. Clean it, dedupe it, and improve clarity.
        Return ONLY valid JSON that follows the schema. No text outside JSON.

        Input:
        ${recipeJson}

        RULES:
        - Do NOT add or invent ingredients, steps, notes, quantities, times, or temperatures.
        - Keep existing meaning. Only rewrite or clean text already present.
        - If a field is empty in the input, keep it empty.

        REMOVE:
        - Meta text ("Recipe video above", "See notes", etc.)
        - Parentheses with non-cooking info (e.g., "(Note 1)", "(Note 2)", "(I used X brand)")
        - URLs, ads, disclaimers, social media references
        - Duplicate ingredients or duplicate instructions
        - Repeated blocks or repeated sentences
        - Parentheses that don't describe preparation (remove "(optional - note 3)" but keep "(melted)")

        TITLE:
        - Use the given title only. Fix capitalization if needed.

        DESCRIPTION:
        - Rewrite into a short, clear description using only info already in the input.
        - Remove noise, marketing text, or meta references.
        - If the description is identical to the title, nearly identical, or provides no additional information,
        set description to an empty string instead of rewriting.
        - Do NOT invent any new context beyond what already exists.

        INGREDIENTS:
        - Keep the same ingredients; do NOT create new ones.
        - Remove irrelevant parentheses.
        - Keep preparation notes only if they describe cooking (e.g., chopped, melted, shredded).
        - Format consistently: "quantity unit ingredient notes".

        INSTRUCTIONS:
        - Use only the steps already present.
        - Remove duplicates and repeated lines.
        - Remove meta text ("see notes", "watch video", "as above").
        - Keep each step as a single action with clarifiers already in the input.

        OUTPUT:
        - JSON only.
        - No explanations, no prose, no commentary.
        - Missing fields = empty strings or empty arrays.

        `;
}

export async function POST(request: NextRequest) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const requestData: FormatRecipeRequest = body;

    if (!requestData || typeof requestData !== 'object') {
        return NextResponse.json({
            success: false,
            error: 'Invalid request body'
        }, { status: 400 });
    }

    if (!requestData.title || typeof requestData.title !== 'string') {
        return NextResponse.json({
            success: false,
            error: 'Title is required and must be a string'
        }, { status: 400 });
    }

    if (!requestData.description || typeof requestData.description !== 'string') {
        return NextResponse.json({
            success: false,
            error: 'Description is required and must be a string'
        }, { status: 400 });
    }

    if (!Array.isArray(requestData.ingredients)) {
        return NextResponse.json({
            success: false,
            error: 'Ingredients is required and must be an array'
        }, { status: 400 });
    }

    if (!Array.isArray(requestData.instructions)) {
        return NextResponse.json({
            success: false,
            error: 'Instructions is required and must be an array'
        }, { status: 400 });
    }

    console.log('[Format API] Formatting recipe:', requestData.title);

    const prompt = craftFormattingPrompt(requestData);

    try {
        console.log('[Format API] Calling OpenAI for formatting...');
        const response = await callOpenAI(prompt, {
            format: RECIPE_TEXT_FORMAT
        });

        if (!response) {
            return NextResponse.json({
                success: false,
                error: 'OpenAI API returned null response'
            }, { status: 500 });
        }

        let formattedData: any;
        try {
            formattedData = JSON.parse(response);
        } catch (parseError) {
            console.error('[Format API] Failed to parse OpenAI response:', parseError);
            console.error('[Format API] Response was:', response.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: 'Failed to parse formatted recipe from OpenAI response',
                message: parseError instanceof Error ? parseError.message : 'Invalid JSON'
            }, { status: 500 });
        }

        let formattedRecipe = null;
        if (formattedData.recipe) {
            // If it's an array, take the first recipe
            formattedRecipe = Array.isArray(formattedData.recipe)
                ? formattedData.recipe[0]
                : formattedData.recipe;
        } else if (formattedData.title) {
            // If it's already a recipe object
            formattedRecipe = formattedData;
        }

        // Validate the formatted recipe has required fields
        if (!formattedRecipe || !formattedRecipe.title) {
            return NextResponse.json({
                success: false,
                error: 'Formatted recipe is missing required fields'
            }, { status: 500 });
        }

        // Post-process instructions: remove description if it matches the title
        if (formattedRecipe.instructions && Array.isArray(formattedRecipe.instructions)) {
            formattedRecipe.instructions = removeDuplicateInstructionDescriptions(formattedRecipe.instructions);
        }

        console.log('[Format API] ✓ Recipe formatted successfully');

        return NextResponse.json({
            success: true,
            data: {
                title: formattedRecipe.title,
                description: formattedRecipe.description || '',
                ingredients: formattedRecipe.ingredients || [],
                instructions: formattedRecipe.instructions || []
            },
            message: 'Recipe formatted successfully'
        });

    } catch (error) {
        console.error('[Format API] Error in POST /api/recipes/format:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to format recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
