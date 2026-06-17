// Run this once to remove duplicate categories
import { getDatabase } from './db';

export const removeDuplicateCategories = async () => {
  try {
    const db = await getDatabase();

    // Before deleting duplicate categories, re-point any transactions that
    // reference a duplicate onto the surviving (lowest-id) category of the same
    // name. Without this, deleting duplicates orphans transactions
    // (category_id points to a deleted row -> category_name shows as null).
    await db.execAsync(`
      UPDATE transactions
      SET category_id = (
        SELECT MIN(c2.id)
        FROM categories c2
        WHERE c2.name = (
          SELECT c1.name FROM categories c1 WHERE c1.id = transactions.category_id
        )
      )
      WHERE category_id IS NOT NULL
        AND category_id NOT IN (
          SELECT MIN(id) FROM categories GROUP BY name
        );
    `);

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
