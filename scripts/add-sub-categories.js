const { createCoreService } = require('@strapi/strapi').factories;

async function main() {
    const strapi = await require('@strapi/strapi')().load();

    try {
        const categories = [
            {
                name: 'React',
                slug: 'react',
                description: 'Articles about React.js library.',
                parentSlug: 'frontend',
                order: 1,
            },
            {
                name: 'Next.js',
                slug: 'nextjs',
                description: 'Articles about Next.js framework.',
                parentSlug: 'frontend',
                order: 2,
            },
            {
                name: 'AWS',
                slug: 'aws',
                description: 'Amazon Web Services cloud computing.',
                parentSlug: 'cloud-computing',
                order: 1,
            },
            {
                name: 'PostgreSQL',
                slug: 'postgresql',
                description: 'Advanced open source relational database.',
                parentSlug: 'sql',
                order: 1,
            }
        ];

        for (const catData of categories) {
            // Find parent
            const parents = await strapi.documents('api::category.category').findMany({
                filters: { slug: catData.parentSlug },
            });

            if (parents.length === 0) {
                console.warn(`Parent category ${catData.parentSlug} not found. Skipping ${catData.name}.`);
                continue;
            }

            const parent = parents[0];

            // Check if already exists
            const existing = await strapi.documents('api::category.category').findMany({
                filters: { slug: catData.slug },
            });

            if (existing.length > 0) {
                console.log(`Category ${catData.name} already exists. Skipping.`);
                continue;
            }

            // Create new sub-category
            const newCat = await strapi.documents('api::category.category').create({
                data: {
                    name: catData.name,
                    slug: catData.slug,
                    description: catData.description,
                    order: catData.order,
                    parent: parent.id, // Relation uses ID in Strapi create
                    publishedAt: new Date(),
                },
            });

            console.log(`Created sub-category: ${catData.name} (Parent: ${catData.parentSlug})`);
        }

    } catch (error) {
        console.error('Error adding sub-categories:', error);
    } finally {
        process.exit(0);
    }
}

main();
