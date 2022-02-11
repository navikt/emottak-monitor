const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/v1",
    createProxyMiddleware({
      target: "https://emottak-monitor.dev.intern.nav.no",
      changeOrigin: true,
    })
  );
};
