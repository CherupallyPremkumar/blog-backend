const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

function generateDocumentId() {
    return crypto.randomBytes(12).toString('hex');
}

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

        // Create System Design top-level category if not exists
        const existingMain = await client.query('SELECT id FROM categories WHERE slug = $1', ['system-design']);
        let parentId;
        if (existingMain.rows.length === 0) {
            const docId = generateDocumentId();
            const insertParent = await client.query(`
        INSERT INTO categories (name, slug, description, "order", document_id, created_at, updated_at, published_at, locale)
        VALUES ('System Design', 'system-design', 'Architectural patterns and strategies for building scalable software systems.', 10, $1, NOW(), NOW(), NOW(), 'en')
        RETURNING id
      `, [docId]);
            parentId = insertParent.rows[0].id;
            console.log('Created System Design parent category');
        } else {
            parentId = existingMain.rows[0].id;
            console.log('System Design parent category already exists');
        }

        const subCats = [
            { name: 'Scalability', slug: 'scalability', desc: 'Vertical and horizontal scaling strategies.', order: 1 },
            { name: 'Load Balancing', slug: 'load-balancing', desc: 'Distributing traffic across servers.', order: 2 },
            { name: 'Microservices Arch', slug: 'microservices-arch', desc: 'Decoupled service-oriented architecture.', order: 3 },
            { name: 'Caching', slug: 'caching', desc: 'Improving performance with data locality.', order: 4 }
        ];

        for (const sub of subCats) {
            const existingSub = await client.query('SELECT id FROM categories WHERE slug = $1', [sub.slug]);
            let subId;
            if (existingSub.rows.length === 0) {
                const docId = generateDocumentId();
                const insertSub = await client.query(`
          INSERT INTO categories (name, slug, description, "order", document_id, created_at, updated_at, published_at, locale)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), 'en')
          RETURNING id
        `, [sub.name, sub.slug, sub.desc, sub.order, docId]);
                subId = insertSub.rows[0].id;
                console.log(`Created sub-category: ${sub.name}`);
            } else {
                subId = existingSub.rows[0].id;
                console.log(`Sub-category ${sub.name} already exists. Updating.`);
                await client.query('UPDATE categories SET locale = \'en\', published_at = NOW() WHERE id = $1', [subId]);
            }

            // Link to parent
            const linkCheck = await client.query('SELECT * FROM categories_parent_lnk WHERE category_id = $1', [subId]);
            if (linkCheck.rows.length > 0) {
                await client.query('UPDATE categories_parent_lnk SET inv_category_id = $1, category_ord = $2 WHERE category_id = $3', [parentId, sub.order, subId]);
            } else {
                await client.query(`
          INSERT INTO categories_parent_lnk (category_id, inv_category_id, category_ord)
          VALUES ($1, $2, $3)
        `, [subId, parentId, sub.order]);
            }
            console.log(`Linked ${sub.name} to System Design`);
        }


    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
