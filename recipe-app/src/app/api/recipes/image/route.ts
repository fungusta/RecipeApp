import { uploadRecipeImage } from '@/lib/apis/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let formData;
    try {
        formData = await request.formData();
    } catch (error) {
        console.error('Error parsing form data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid form data'
            },
            { status: 400 }
        );
    }

    const file = formData.get('image') as File | null;

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
    try {
        const publicUrl = await uploadRecipeImage(file);

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload image',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

