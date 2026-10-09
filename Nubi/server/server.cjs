/**
 * API falsa (json-server) para el despliegue.
 *
 * En desarrollo la levanta proxy.conf.cjs junto con `ng serve`. En producción el frontend
 * es estático (Firebase Hosting), así que este archivo corre como servicio aparte y sirve
 * los datos bajo /api.
 *
 * Persistencia: el disco del servicio se borra en cada reinicio, así que el estado completo
 * se guarda en un documento de Firestore (nubi/db). Al arrancar se lee de ahí; db.json solo
 * aporta los datos iniciales. Sin la variable FIREBASE_SERVICE_ACCOUNT se trabaja sobre
 * db.json, como en desarrollo.
 */
const path = require('node:path');
const jsonServer = require('json-server');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

/** Documento de Firestore con el estado, o null si no hay credenciales configuradas. */
function openStateDocument() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount && !process.env.FIRESTORE_EMULATOR_HOST) return null;

  const { cert, initializeApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  initializeApp(
    serviceAccount ? { credential: cert(JSON.parse(serviceAccount)) } : { projectId: 'nubi-local' },
  );
  return getFirestore().doc('nubi/db');
}

async function start() {
  const stateDocument = openStateDocument();
  let source = DB_FILE;

  if (stateDocument) {
    const seed = require(DB_FILE);
    const snapshot = await stateDocument.get();
    // Las colecciones nuevas de db.json se agregan aunque ya exista un estado guardado
    source = snapshot.exists ? { ...seed, ...JSON.parse(snapshot.data().json) } : seed;
  }

  const server = jsonServer.create();
  // Sin claves foráneas: json-server falla al borrar si algún campo terminado en "Id" es null
  const router = jsonServer.router(source, { foreignKeySuffix: '_id' });

  // Los defaults incluyen CORS: el frontend llama desde otro dominio
  server.use(jsonServer.defaults());

  if (stateDocument) {
    // Las escrituras se encadenan para que no se pisen entre sí
    let pendingSave = Promise.resolve();
    server.use((req, res, next) => {
      if (req.method !== 'GET') {
        res.on('finish', () => {
          if (res.statusCode >= 400) return;
          pendingSave = pendingSave
            .then(() => stateDocument.set({ json: JSON.stringify(router.db.getState()) }))
            .catch((error) => console.error('No se pudo guardar el estado en Firestore:', error));
        });
      }
      next();
    });
  }

  server.use('/api', router);

  server.listen(PORT, () => {
    const storage = stateDocument ? 'Firestore' : 'db.json';
    console.log(`API falsa (json-server) en el puerto ${PORT}, bajo /api (datos en ${storage})`);
  });
}

start().catch((error) => {
  console.error('La API no pudo arrancar:', error);
  process.exit(1);
});
