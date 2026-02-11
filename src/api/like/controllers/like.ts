import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::like.like', ({ strapi }) => ({
    // Override find to always populate user
    async find(ctx) {
        const filters = ctx.query.filters || {};
        const likes = await strapi.documents('api::like.like').findMany({
            filters,
            populate: {
                user: { fields: ['id', 'username', 'email'] },
                article: true,
            },
        });

        return {
            data: likes,
            meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: likes.length } },
        };
    },

    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to like an article.');
        }

        const articleId = ctx.request.body?.data?.article;
        if (!articleId) {
            return ctx.badRequest('Article ID is required.');
        }

        // Check for duplicate likes (same user + same article)
        const existingLikes = await strapi.documents('api::like.like').findMany({
            filters: {
                user: { id: user.id },
                article: { id: articleId },
            },
        });

        if (existingLikes.length > 0) {
            return ctx.badRequest('You have already liked this article.');
        }

        // Create the like using the document service with proper relations
        const like = await strapi.documents('api::like.like').create({
            data: {
                article: articleId,
                user: user.id,
            },
            populate: {
                user: { fields: ['id', 'username', 'email'] },
            },
        });

        return { data: like };
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const { id: documentId } = ctx.params;

        const likes = await strapi.documents('api::like.like').findMany({
            filters: { documentId },
            populate: ['user'],
        });

        const like = likes[0];
        if (!like) {
            return ctx.notFound('Like not found.');
        }

        if (like.user?.id !== user.id) {
            return ctx.forbidden('You can only remove your own likes.');
        }

        await strapi.documents('api::like.like').delete({
            documentId,
        });

        return { data: null };
    },
}));
