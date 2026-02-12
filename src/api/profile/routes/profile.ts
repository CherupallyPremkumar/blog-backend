export default {
    routes: [
        {
            method: 'PUT',
            path: '/profile',
            handler: 'profile.update',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/profile/liked-articles',
            handler: 'profile.likedArticles',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
