export default {
    routes: [
        {
            method: 'GET',
            path: '/keep-alive',
            handler: 'keep-alive.index',
            config: {
                auth: false,
            },
        },
    ],
};
