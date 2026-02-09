export default {
    async index(ctx, next) {
        ctx.body = { status: 'ok', message: 'Backend is alive' };
    },
};
