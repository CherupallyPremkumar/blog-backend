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
        console.log('Connected to database');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'categories%'
    `);

        console.log('Tables found:');
        res.rows.forEach(row => console.log(`- ${row.table_name}`));

        if (res.rows.find(r => r.table_name === 'categories')) {
            const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'categories'
      `);
            console.log('\nColumns in categories:');
            columns.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
