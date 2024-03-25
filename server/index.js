const { 
    client,
    createTables,
    createUsers,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorites,
    seed
 } = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (err) {
        next(err);
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch (err) {
        next(err);
    }
});

app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites(req.params.user_id));
    } catch (err) {
        next(err);
    }
});

app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const product_id = req.body.id;
        const favorite = await createFavorite({user_id, product_id});
        res.status(201).json(favorite);
    } catch (err) {
        next(err);
    }
});

app.delete('/api/users/:user_id/favorites/:id', async (req, res, next) => {
    try {
        await destroyFavorite({
            user_id: req.params.user_id,
            id: req.params.id
        });
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});


const init = async () => {
    client.connect();
    console.log('Client Connected!');

    createTables();
    console.log('Created Tables!');

    seed();
    console.log('Data seeded!');

    const port = 3000;
    app.listen(port, console.log(`Listening on port ${port}`));
    
};

init();