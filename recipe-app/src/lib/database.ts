import { Ingredient, Instruction } from '@/data/recipes';
import mysql from 'mysql2/promise';

// Function to get database configuration
function getDbConfig() {
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbName = process.env.DB_NAME || 'recipe_db';
  const dbPort = parseInt(process.env.DB_PORT || '3306');

  // Warn if password might have issues
  if (dbPassword && (dbPassword.startsWith(' ') || dbPassword.endsWith(' '))) {
    console.warn('⚠️ WARNING: DB_PASSWORD appears to have leading or trailing spaces!');
  }
  if (dbPassword && dbPassword.length === 0) {
    console.warn('⚠️ WARNING: DB_PASSWORD is empty string!');
  }
  
  return {
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

// Create connection pool lazily
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    const dbConfig = getDbConfig();
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Recipe interface
export interface Recipe {
  id: string;
  title: string;
  description: string;
  category?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  image?: string;
  creatorId?: string;
  recipeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    // Create recipes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id VARCHAR(255) PRIMARY KEY,
        creator_id VARCHAR(255) NOT NULL,
        recipe_url VARCHAR(500),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        ingredients JSON,
        instructions JSON,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get all recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM recipes ORDER BY created_at DESC'
    );
    return rows as Recipe[];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

// Get recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );
    const recipes = rows as Recipe[];
    return recipes.length > 0 ? recipes[0] : null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}

// Get Recipes of a certain creator
export async function getRecipesByCreatorId(creatorId: string): Promise<Recipe[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM recipes WHERE creator_id = ?',
      [creatorId]
    );
    const recipes = rows as Recipe[];
    return recipes;
  } catch (error) {
    console.error(`Error fetching recipes for creator: ${creatorId}`, error);
    throw error;
  }
}

// Create new recipe
export async function createRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
  try {
    const pool = getPool();
    const id = Date.now().toString();
    const now = new Date();
    
    await pool.execute(
      `INSERT INTO recipes (id, creator_id, recipe_url, title, description, category, ingredients, instructions, image, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        recipeData.creatorId || 'placeholder',
        recipeData.recipeUrl || null,
        recipeData.title,
        recipeData.description,
        recipeData.category || null,
        JSON.stringify(recipeData.ingredients),
        JSON.stringify(recipeData.instructions),
        recipeData.image || null,
        now,
        now
      ]
    );
    
    return {
      id,
      ...recipeData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
}

// Update recipe
export async function updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> {
  try {
    const pool = getPool();
    const now = new Date();
    
    // Build dynamic query
    const updateFields = [];
    const values = [];
    
    if (recipeData.title) {
      updateFields.push('title = ?');
      values.push(recipeData.title);
    }
    if (recipeData.description) {
      updateFields.push('description = ?');
      values.push(recipeData.description);
    }
    if (recipeData.category !== undefined) {
      updateFields.push('category = ?');
      values.push(recipeData.category);
    }
    if (recipeData.ingredients) {
      updateFields.push('ingredients = ?');
      values.push(JSON.stringify(recipeData.ingredients));
    }
    if (recipeData.instructions) {
      updateFields.push('instructions = ?');
      values.push(JSON.stringify(recipeData.instructions));
    }
    if (recipeData.image !== undefined) {
      updateFields.push('image = ?');
      values.push(recipeData.image);
    }
    
    updateFields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Check if any rows were affected
    if ((result as any).affectedRows === 0) {
      return null; // Recipe not found
    }
    
    // Return updated recipe
    return await getRecipeById(id);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}

// Delete recipe
export async function deleteRecipe(id: string): Promise<boolean> {
  try {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM recipes WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Search recipes
export async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    const pool = getPool();
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM recipes 
       WHERE title LIKE ? OR description LIKE ? OR JSON_SEARCH(ingredients, 'one', ?) IS NOT NULL
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm]
    );
    return rows as Recipe[];
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
