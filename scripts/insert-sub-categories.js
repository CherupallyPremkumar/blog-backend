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

        const subCategories = [
            // New sub-categories
            { name: 'Azure', slug: 'azure', desc: 'Microsoft Azure cloud platform', parentSlug: 'cloud-computing', order: 2 },
            { name: 'GCP', slug: 'gcp', desc: 'Google Cloud Platform', parentSlug: 'cloud-computing', order: 3 },
            { name: 'Spring Security', slug: 'spring-security', desc: 'Authentication and access control for Spring', parentSlug: 'spring-boot', order: 1 },
            { name: 'Docker Compose', slug: 'docker-compose', desc: 'Multi-container orchestration', parentSlug: 'docker', order: 1 },

            // Re-parenting existing ones
            { name: 'Spring Boot', slug: 'spring-boot', parentSlug: 'java', order: 1 },
            { name: 'Hibernate', slug: 'hibernate', parentSlug: 'java', order: 2 },
            { name: 'Maven', slug: 'maven', parentSlug: 'java', order: 3 },
            { name: 'Jvm', slug: 'jvm', parentSlug: 'java', order: 4 },
            { name: 'Kubernetes', slug: 'kubernetes', parentSlug: 'cloud-computing', order: 4 },
            { name: 'Docker', slug: 'docker', parentSlug: 'cloud-computing', order: 5 },

            // Existing ones from before
            { name: 'React', slug: 'react', desc: 'Library for web interfaces', parentSlug: 'frontend', order: 1 },
            { name: 'Next.js', slug: 'next-js', desc: 'React framework for production', parentSlug: 'frontend', order: 2 },
            { name: 'AWS', slug: 'aws', desc: 'Amazon Web Services', parentSlug: 'cloud-computing', order: 1 },
            { name: 'PostgreSQL', slug: 'postgresql', desc: 'Relational database', parentSlug: 'sql', order: 1 }
        ];

        for (const sub of subCategories) {
            // Find parent ID
            const parentRes = await client.query('SELECT id FROM categories WHERE slug = $1', [sub.parentSlug]);
            if (parentRes.rows.length === 0) {
                console.warn(`Parent ${sub.parentSlug} not found for ${sub.name}`);
                continue;
            }
            const parentId = parentRes.rows[0].id;

            // Check if sub exists
            const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [sub.slug]);

            let subId;
            if (existing.rows.length > 0) {
                subId = existing.rows[0].id;
                console.log(`Sub-category ${sub.name} exists. Updating.`);

                if (sub.desc) {
                    await client.query('UPDATE categories SET description = $1, "order" = $2 WHERE id = $3', [sub.desc, sub.order, subId]);
                } else {
                    await client.query('UPDATE categories SET "order" = $1 WHERE id = $2', [sub.order, subId]);
                }
            } else {
                // Insert category
                const docId = generateDocumentId();
                const insertRes = await client.query(`
          INSERT INTO categories (name, slug, description, "order", document_id, created_at, updated_at, published_at, locale)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), 'en')
          RETURNING id
        `, [sub.name, sub.slug, sub.desc || '', sub.order, docId]);

                subId = insertRes.rows[0].id;
                console.log(`Created sub-category: ${sub.name}`);
            }

            // Ensure link exists or update it
            const linkCheck = await client.query('SELECT * FROM categories_parent_lnk WHERE category_id = $1', [subId]);
            if (linkCheck.rows.length > 0) {
                await client.query('UPDATE categories_parent_lnk SET inv_category_id = $1, category_ord = $2 WHERE category_id = $3', [parentId, sub.order, subId]);
            } else {
                await client.query(`
          INSERT INTO categories_parent_lnk (category_id, inv_category_id, category_ord)
          VALUES ($1, $2, $3)
        `, [subId, parentId, sub.order]);
            }

            console.log(`Linked ${sub.name} -> ${sub.parentSlug}`);
        }

        console.log('\nAll hierarchical data populated successfully.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
