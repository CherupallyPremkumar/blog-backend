import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to create a comment.');
        }

        const body = ctx.request.body?.data;
        const content = body?.content;
        const articleId = body?.article;

        if (!content?.trim()) {
            return ctx.badRequest('Comment content is required.');
        }
        if (!articleId) {
            return ctx.badRequest('Article ID is required.');
        }

        const comment = await strapi.documents('api::comment.comment').create({
            data: {
                content: content.trim(),
                article: articleId,
                author: user.id,
            },
            populate: ['author'],
        });

        return { data: comment };
    },

    async update(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const { id: documentId } = ctx.params;
        const content = ctx.request.body?.data?.content;

        if (!content?.trim()) {
            return ctx.badRequest('Comment content is required.');
        }

        // Find the comment and verify ownership
        const comments = await strapi.documents('api::comment.comment').findMany({
            filters: { documentId },
            populate: ['author'],
        });

        const comment = comments[0];
        if (!comment) {
            return ctx.notFound('Comment not found.');
        }

        if (comment.author?.id !== user.id) {
            return ctx.forbidden('You can only edit your own comments.');
        }

        const updated = await strapi.documents('api::comment.comment').update({
            documentId,
            data: { content: content.trim() },
            populate: ['author'],
        });

        return { data: updated };
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const { id: documentId } = ctx.params;

        const comments = await strapi.documents('api::comment.comment').findMany({
            filters: { documentId },
            populate: ['author'],
        });

        const comment = comments[0];
        if (!comment) {
            return ctx.notFound('Comment not found.');
        }

        if (comment.author?.id !== user.id) {
            return ctx.forbidden('You can only delete your own comments.');
        }

        await strapi.documents('api::comment.comment').delete({
            documentId,
        });

        return { data: null };
    },
}));
