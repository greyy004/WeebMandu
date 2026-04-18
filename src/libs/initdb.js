import {createFavouriteTable} from '../models/favouriteModel.js';
import {createPokemonTable} from '../models/pokemonModel.js';
import {createUserTable} from '../models/userModel.js';

const initdb = async () => {
    try {
        await createUserTable();
        await createPokemonTable();
        await createFavouriteTable();
        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
};

export default initdb;