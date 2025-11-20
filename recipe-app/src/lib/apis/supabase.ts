import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadRecipeImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `recipes/${fileName}`;

    const { error } = await supabase.storage
        .from("recipe-images")  
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
}