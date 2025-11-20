import { uploadRecipeImage } from '@/lib/apis/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Accept data and extract image
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        // Enforce file validation for type and size
        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No image file provided'
                },
                { status: 400 }
            );
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
                },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'File size exceeds 5MB limit. Please upload a smaller image.'
                },
                { status: 400 }
            );
        }

        // upload image to supabase
        const publicUrl = await uploadRecipeImage(file);

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload image'
            },
            { status: 500 }
        );
    }
}

