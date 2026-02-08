const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories_parent_lnk'
    `);
        console.log('Columns in categories_parent_lnk:');
        columns.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
