export const createTables = async (db) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        monthly_budget REAL DEFAULT 0,
        exclude_from_limits INTEGER DEFAULT 0
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        tags TEXT,
        receipt_uri TEXT,
        is_recurring INTEGER DEFAULT 0,
        frequency TEXT,
        next_run_date TEXT,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const migrateExistingTables = async (db) => {
  try {
    // Migrate transactions table
    const transactionsResult = await db.getAllAsync('PRAGMA table_info(transactions);');
    const transactionsColumns = transactionsResult.map(col => col.name);

    if (!transactionsColumns.includes('tags')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN tags TEXT;');
    }
    if (!transactionsColumns.includes('receipt_uri')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN receipt_uri TEXT;');
    }
    if (!transactionsColumns.includes('is_recurring')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN is_recurring INTEGER DEFAULT 0;');
    }
    if (!transactionsColumns.includes('frequency')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN frequency TEXT;');
    }
    if (!transactionsColumns.includes('next_run_date')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN next_run_date TEXT;');
    }
    if (!transactionsColumns.includes('exclude_from_limits')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN exclude_from_limits INTEGER DEFAULT 0;');
      console.log('Added exclude_from_limits column to transactions table');
    }

    // Migrate categories table
    const categoriesResult = await db.getAllAsync('PRAGMA table_info(categories);');
    const categoriesColumns = categoriesResult.map(col => col.name);

    if (!categoriesColumns.includes('exclude_from_limits')) {
      await db.execAsync('ALTER TABLE categories ADD COLUMN exclude_from_limits INTEGER DEFAULT 0;');
      console.log('Added exclude_from_limits column to categories table');
    }

    // Always mark fixed expense categories (in case column existed but categories weren't marked)
    const fixedExpenseCategories = ['Rent', 'Mortgage', 'Insurance', 'Utilities', 'Loan Payment'];
    for (const categoryName of fixedExpenseCategories) {
      const result = await db.runAsync(
        'UPDATE categories SET exclude_from_limits = 1 WHERE LOWER(TRIM(name)) = LOWER(?)',
        [categoryName]
      );
      console.log(`Updated ${categoryName} category, rows affected:`, result.changes);
    }
    console.log('Marked fixed expense categories to exclude from limits');

    console.log('Table migration completed');
  } catch (error) {
    console.error('Error migrating tables:', error);
  }
};

export const seedDefaultCategories = async () => {
  // No default categories - users will create their own when adding transactions
  console.log('No default categories to seed - users create categories as needed');
};
