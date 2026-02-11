import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to create a comment.');
        }

        // Force author to be the authenticated user — prevents impersonation
        if (!ctx.request.body.data) {
            ctx.request.body.data = {};
        }
        ctx.request.body.data.author = user.id;

        const response = await super.create(ctx);
        return response;
    },
}));
