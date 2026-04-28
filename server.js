const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

function readTlsCredentials() {
  const keyPath = path.resolve(
    process.cwd(),
    process.env.TLS_KEY_PATH ?? "../certs/localhost-key.pem"
  );
  const certPath = path.resolve(
    process.cwd(),
    process.env.TLS_CERT_PATH ?? "../certs/localhost-cert.pem"
  );

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

async function main() {
  const app = next({ dev });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = https.createServer(readTlsCredentials(), (request, response) => {
    handle(request, response);
  });

  server.listen(port, host, () => {
    console.log(`Web on https://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});