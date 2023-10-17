const { createProxyMiddleware } = require("http-proxy-middleware");

var sslRootCAs = require("ssl-root-cas");
sslRootCAs.inject();

module.exports = function (app) {
  app.use(
    "/v1",
    createProxyMiddleware({
      target: "https://emottak-monitor.intern.dev.nav.no",
      changeOrigin: true,
      secure: false,
    })
  );
};
