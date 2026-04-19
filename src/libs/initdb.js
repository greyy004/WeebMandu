import pool from "../libs/db.js";

//USERS TABLE
export const createUserTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        coins INTEGER NOT NULL DEFAULT 100,
        pokeballs INTEGER NOT NULL DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

//DAILY POKEMONS TABLE
export const createDailyPokemonTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS daily_pokemons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,

        pokemons JSONB NOT NULL,

        created_at TIMESTAMP DEFAULT NOW(),

        UNIQUE (user_id, date)
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating daily_pokemons table:", err);
  }
};



//USER POKÉMON COLLECTION TABLE
export const createUserPokemonTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS user_pokemons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        pokemon_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        types TEXT[],

        caught_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating user_pokemons table:", err);
  }
};



//DAILY REWARDS TABLE
export const createDailyRewardsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS daily_rewards (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,

        coins INTEGER NOT NULL DEFAULT 20,
        pokeballs INTEGER NOT NULL DEFAULT 1,

        claimed BOOLEAN NOT NULL DEFAULT FALSE,

        PRIMARY KEY (user_id, date)
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating daily_rewards table:", err);
  }
};

export const ensureDailyRewardsDefaults = async () => {
  try {
    await pool.query(`ALTER TABLE daily_rewards ALTER COLUMN coins SET DEFAULT 20`);
    await pool.query(`ALTER TABLE daily_rewards ALTER COLUMN pokeballs SET DEFAULT 1`);
  } catch (err) {
    console.error("Error ensuring daily_rewards defaults:", err);
  }
};



//OPTIONAL INDEX (FAST QUERIES)
export const createIndexes = async () => {
  try {
    const query = `
      CREATE INDEX IF NOT EXISTS idx_daily_pokemons_user_date
      ON daily_pokemons(user_id, date)
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating index:", err);
  }
};



// 6️⃣ RUN ALL TABLES TOGETHER
export const initTables = async () => {
  await createUserTable();
  await createDailyPokemonTable();
  await createUserPokemonTable();
  await createDailyRewardsTable();
  await ensureDailyRewardsDefaults();
  await createIndexes();

  console.log("All tables created successfully");
};
