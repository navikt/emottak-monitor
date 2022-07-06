import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import express from "express";
import path from "path";

const server = express(); // create express server
server.use(cors());

// add middlewares
const root = require("path").join(__dirname, "..", "build");
server.use(express.static(root));

server.use(
  "/v1",
  createProxyMiddleware({
    target: "https://emottak-monitor.dev.intern.nav.no",
    changeOrigin: true,
      onProxyReq: (req) => {
        console.log("PROXYREQ")
        console.log(req.path)
          console.log(req.headersSent)
          console.log(req)
      }
  })
);

// Body parser must come AFTER proxy
const bodyParser = require("body-parser");
server.use(bodyParser.json());

server.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  console.log("REQ")
    console.log(req.path)
    console.log(req.headers)
    console.log(req.cookies)

    console.log("RES")
    console.log(res.header)
    console.log(res.cookie)
});

// start express server on specified or default port
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
