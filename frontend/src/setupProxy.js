const { createProxyMiddleware } = require("http-proxy-middleware");

var sslRootCAs = require("ssl-root-cas");
sslRootCAs.inject();

module.exports = function (app) {
  app.use(
    "/v1",
    createProxyMiddleware({
        //TODO Parviz: use "localhost" in local environment
      target: `http://localhost:8081`,
      changeOrigin: true,
      secure: false,
    })
  );
};
