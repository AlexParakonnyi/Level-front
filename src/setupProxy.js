// setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://192.168.100.133",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/", // удаляем /api из пути
      },
    })
  );
};
