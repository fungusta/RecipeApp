import OpenAI from "openai";

const OPENAI_MODEL = 'gpt-5-nano'; 

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


export async function callOpenAI(
    prompt: string,
    options?: {
        format?: {
            type: 'json_schema'
            name: string
            schema: { [key: string]: unknown }
            strict?: boolean
        }
    }): Promise<string | null> {

    console.log('[OpenAI API] ========================================');
    console.log('[OpenAI API] Starting OpenAI API call');
    console.log('[OpenAI API] Model:', OPENAI_MODEL);
    console.log('[OpenAI API] Using JSON schema format:', !!options?.format);
    console.log('[OpenAI API] Prompt length:', prompt.length, 'characters');

    try {
        const response = await openai.responses.create({
            model: OPENAI_MODEL,
            input: prompt,
            text: {
                format: options?.format
            },
        });

        console.log('[OpenAI API] ✓ API call successful');
        console.log('[OpenAI API] Response length:', response.output_text?.length || 0, 'characters');
        console.log('[OpenAI API] Response preview:', response.output_text?.substring(0, 200) + '...');
        console.log('[OpenAI API] ========================================');
        
        return response.output_text || null;
    } catch (error) {
        console.error('[OpenAI API] ✗ API call failed:');
        console.error('[OpenAI API]   - Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('[OpenAI API]   - Message:', error instanceof Error ? error.message : String(error));
        console.log('[OpenAI API] ========================================');
        throw error;
    }
}