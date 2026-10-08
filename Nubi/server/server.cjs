/**
 * API falsa (json-server) para el despliegue.
 *
 * En desarrollo la levanta proxy.conf.cjs junto con `ng serve`. En producción el frontend
 * es estático (Firebase Hosting), así que este archivo corre como servicio aparte y sirve
 * db.json bajo /api. Los cambios se guardan en db.json del servicio: se pierden cuando el
 * servicio se reinicia o se vuelve a desplegar.
 */
const path = require('node:path');
const jsonServer = require('json-server');

const PORT = process.env.PORT || 3000;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

// Los defaults incluyen CORS: el frontend llama desde otro dominio
server.use(jsonServer.defaults());
server.use('/api', router);

server.listen(PORT, () => {
  console.log(`API falsa (json-server) disponible en el puerto ${PORT}, bajo /api`);
});
