// Run this once to remove duplicate categories
import { getDatabase } from './db';

export const removeDuplicateCategories = async () => {
  try {
    const db = await getDatabase();

    // Keep only the first occurrence of each category name
    await db.execAsync(`
      DELETE FROM categories
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM categories
        GROUP BY name
      );
    `);

    console.log('Duplicate categories removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing duplicates:', error);
    return false;
  }
};
