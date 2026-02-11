import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::like.like', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to like an article.');
        }

        // Force user to be the authenticated user — prevents impersonation
        if (!ctx.request.body.data) {
            ctx.request.body.data = {};
        }
        ctx.request.body.data.user = user.id;

        // Check for duplicate likes (same user + same article)
        const articleId = ctx.request.body.data.article;
        if (articleId) {
            const existingLike = await strapi.db.query('api::like.like').findOne({
                where: {
                    user: { id: user.id },
                    article: { id: articleId },
                },
            });

            if (existingLike) {
                return ctx.badRequest('You have already liked this article.');
            }
        }

        const response = await super.create(ctx);
        return response;
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        // Strapi 5 passes documentId in the URL param
        const { id: documentId } = ctx.params;
        const like = await strapi.db.query('api::like.like').findOne({
            where: { document_id: documentId },
            populate: ['user'],
        });

        if (!like) {
            return ctx.notFound('Like not found.');
        }

        if (like.user?.id !== user.id) {
            return ctx.forbidden('You can only remove your own likes.');
        }

        const response = await super.delete(ctx);
        return response;
    },
}));
