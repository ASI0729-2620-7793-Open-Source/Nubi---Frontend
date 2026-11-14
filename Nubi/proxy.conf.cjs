/**
 * Proxy de desarrollo: `ng serve` reenvía /api/... al backend Spring Boot de Nubi
 * (Nubi.Platform.Backend) que corre en http://localhost:8080.
 */
module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
  },
};
