import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    async update(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const { bio } = ctx.request.body || {};

        if (bio !== undefined && bio !== null && bio.length > 500) {
            return ctx.badRequest('Bio must be 500 characters or less.');
        }

        const updateData: Record<string, unknown> = {};

        if (bio !== undefined) {
            updateData.bio = bio;
        }

        // Handle avatar upload via Strapi's upload plugin
        const files = ctx.request.files;
        if (files?.avatar) {
            try {
                const uploadService = strapi.plugin('upload').service('upload');
                const avatarFile = files.avatar;

                // Upload the file
                const uploaded = await uploadService.upload({
                    data: {
                        ref: 'plugin::users-permissions.user',
                        refId: user.id,
                        field: 'avatar',
                    },
                    files: Array.isArray(avatarFile) ? avatarFile[0] : avatarFile,
                });

                strapi.log.info(`[profile] Avatar uploaded: ${uploaded?.[0]?.id}`);
            } catch (err) {
                strapi.log.error('[profile] Avatar upload error:', err);
            }
        }

        // Update bio separately
        if (Object.keys(updateData).length > 0) {
            await strapi.entityService.update(
                'plugin::users-permissions.user',
                user.id,
                { data: updateData }
            );
        }

        // Fetch updated user with avatar populated
        const updatedUser = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user.id,
            { populate: ['avatar'] }
        );

        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            bio: (updatedUser as Record<string, unknown>).bio,
            avatar: (updatedUser as Record<string, unknown>).avatar,
        };
    },

    async likedArticles(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        try {
            // Use db.query for reliable relation-based filtering
            const likes = await strapi.db.query('api::like.like').findMany({
                where: {
                    user: { id: user.id },
                },
                populate: {
                    article: true,
                },
            });

            // Extract article IDs
            const articleIds: number[] = [];
            for (const like of likes) {
                const article = (like as any).article;
                if (article?.id) {
                    articleIds.push(article.id);
                }
            }

            if (articleIds.length === 0) {
                return { data: [] };
            }

            // Fetch full articles with cover/category
            const articles = await strapi.db.query('api::article.article').findMany({
                where: {
                    id: { $in: articleIds },
                },
                populate: {
                    cover: true,
                    category: true,
                    author: true,
                },
            });

            // Remap cover → coverImage for frontend
            const mapped = articles.map((article: any) => ({
                ...article,
                coverImage: article.cover || undefined,
            }));

            return { data: mapped };
        } catch (err) {
            strapi.log.error('[likedArticles] Error:', err);
            return ctx.internalServerError('Failed to fetch liked articles.');
        }
    },
});
