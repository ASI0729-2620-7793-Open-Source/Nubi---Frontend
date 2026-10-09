/**
 * Configuración del proxy de desarrollo de Angular.
 *
 * Al ejecutar `ng serve`, Angular carga este archivo. Aprovechamos ese momento para
 * levantar json-server dentro del mismo proceso, así un solo comando sirve la aplicación
 * y la API falsa. Las llamadas a /api/... se reenvían a json-server.
 */
const path = require('node:path');
const jsonServer = require('json-server');

const API_PORT = 3000;

if (!global.__nubiFakeApi) {
  const server = jsonServer.create();
  // Sin claves foráneas: json-server falla al borrar si algún campo terminado en 'Id' es null
  const router = jsonServer.router(path.join(__dirname, 'server', 'db.json'), {
    foreignKeySuffix: '_id',
  });

  server.use(jsonServer.defaults({ logger: false }));
  server.use('/api', router);

  global.__nubiFakeApi = server
    .listen(API_PORT, () => {
      console.log(`API falsa (json-server) disponible en http://localhost:${API_PORT}/api`);
    })
    .on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`El puerto ${API_PORT} ya está en uso; se usará la API que ya está corriendo.`);
      } else {
        throw error;
      }
    });
}

module.exports = {
  '/api': {
    target: `http://127.0.0.1:${API_PORT}`,
    secure: false,
    changeOrigin: true,
  },
};
