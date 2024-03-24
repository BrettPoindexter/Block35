const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost:3000/acme_talent_agency_db');

module.exports = {
    client
}