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
        profile_image_url TEXT,
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

// ACHIEVEMENT DEFINITIONS TABLE
export const createAchievementsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,

        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon_url TEXT,

        condition_type VARCHAR(50) NOT NULL,
        target_value INTEGER NOT NULL,

        reward_coins INTEGER DEFAULT 0,
        reward_pokeballs INTEGER DEFAULT 0,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating achievements table:", err);
  }
};

// USER ACHIEVEMENTS TABLE
export const createUserAchievementsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

        progress INTEGER NOT NULL DEFAULT 0,
        unlocked BOOLEAN NOT NULL DEFAULT FALSE,
        unlocked_at TIMESTAMP,

        PRIMARY KEY (user_id, achievement_id)
      )
    `;

    await pool.query(query);
  } catch (err) {
    console.error("Error creating user_achievements table:", err);
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

// INDEX FOR FAST LOOKUPS
export const createAchievementIndexes = async () => {
  try {
    const query = `
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user
      ON user_achievements(user_id)
    `;
    await pool.query(query);
  } catch (err) {
    console.error("Error creating achievement index:", err);
  }
};

// RUN ALL TABLES TOGETHER
export const initTables = async () => {
  await createUserTable();
  await createDailyPokemonTable();
  await createUserPokemonTable();
  await createDailyRewardsTable();
  await createAchievementsTable();
  await createUserAchievementsTable();
  await createAchievementIndexes();
  await createIndexes();

  console.log("All tables created successfully");
};
