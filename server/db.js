const pg = require('pg');
const client = new pg.Client('postgres://localhost/the_acme_store_db');
const uuid = require('uuid');

const createTables = async () => {
    const SQL = /*sql*/ `
        DROP TABLE IF EXISTS favorite;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS product;

        CREATE TABLE users (
            id UUID PRIMARY KEY,
            username VARCHAR(15) UNIQUE NOT NULL,
            password VARCHAR(15) NOT NULL
        );
        CREATE TABLE product (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
        CREATE TABLE Favorite (
            id UUID PRIMARY KEY NOT NULL,
            product_id UUID REFERENCES Product(id) NOT NULL,
            user_id UUID REFERENCES users(id) NOT NULL,
            CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
        );
    `;

    const response = await client.query(SQL);
    return response.rows;
};

const createUsers = async (username, password) => {
    const SQL = `INSERT INTO users VALUES($1, $2, $3) RETURNING *;`;

    const response = await client.query(SQL, [uuid.v4(), username, password]);
    return response.rows[0];
};

const createProduct = async (name) => {
    const SQL = `INSERT INTO product VALUES($1, $2) RETURNING *;`;

    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createFavorite = async ({user_id, product_id}) => {
    const SQL = `
        INSERT INTO favorite(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *;
    `;

    const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
    return response.rows;
};

const fetchUsers = async () => {
    const SQL = `SELECT * FROM users;`;

    const response = await client.query(SQL);
    return response.rows;
};

const fetchProducts = async () => {
    const SQL = `SELECT * FROM product;`;

    const response = await client.query(SQL);
    return response.rows;
};

const fetchFavorites = async (user_id) => {
    const SQL = `SELECT * FROM favorite WHERE user_id = $1;`;

    const response = await client.query(SQL, [user_id]);
    return response.rows[0];
};

const destroyFavorite = async ({user_id, id}) => {
    const SQL = `DELETE FROM favorite WHERE id=$1 AND user_id=$2;`;

    const response = await client.query(SQL, [user_id, id]);
    return response;
};

const seed = async () => {
    const brett = await createUsers('Brett', 'brett123');
    const meagan = await createUsers('Meagan', 'meagan123');
    const shirt = await createProduct('Shirt');
    const hat = await createProduct('Hat');
    
    const [fav1, fav2] = await Promise.all([
        createFavorite({
            user_id: brett.id,
            product_id: hat.id
        }),
        createFavorite({
            user_id: meagan.id,
            product_id: shirt.id
        })
    ]);
    const brettFav = await fetchFavorites(brett.id);
    console.log('brettFav: ', brettFav.id, brettFav.user_id);

    console.log('Users are: ', await fetchUsers());
    console.log('Products are: ', await fetchProducts());
    console.log('Favorites are: ', await fetchFavorites(brett.id));
    console.log(`curl localhost:3000/users/${brett.id}/favorites`);
    console.log(`curl -X POST localhost:3000/api/users/${brett.id}/favorites -d '{"id": "${shirt.id}"}' -H 'Content-Type:application/json'`);
    console.log(`curl localhost:3000/api/${brettFav.user_id}/favorites/${brettFav.id} -X DELETE`);
}

module.exports = {
    client,
    createTables,
    createUsers,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
    seed
};
