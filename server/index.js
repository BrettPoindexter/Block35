const { client } = require('./db.js');
const express = require('express');
const app = express();

const init = async () => {
    client.connect();
    console.log('Client Connected!');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}!`));
};

init();