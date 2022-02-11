const { createProxyMiddleware } = require("http-proxy-middleware");
const { isDevelopmentEnv } = require("./util");

module.exports = function (app) {
  // only proxy requests in development
  isDevelopmentEnv() &&
    app.use(
      "/v1",
      createProxyMiddleware({
        target: "https://emottak-monitor.dev.intern.nav.no",
        changeOrigin: true,
      })
    );
};
