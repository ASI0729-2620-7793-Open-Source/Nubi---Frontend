export const environment = {
  production: true,
  // URL del servicio json-server desplegado (ver render.yaml); en desarrollo se usa el proxy
  apiBaseUrl: 'https://nubi-api-x7sz.onrender.com/api',
  calmingResourcesEndpoint: '/calmingResources',
  favoriteResourcesEndpoint: '/favoriteResources',
  communicationRequestsEndpoint: '/communicationRequests',
  calmSessionsEndpoint: '/calmSessions',
  profilesEndpoint: '/profiles',
  caregiversEndpoint: '/caregivers',
  actionGuidesEndpoint: '/actionGuides',
  sosSessionsEndpoint: '/sosSessions',
  accountsEndpoint: '/accounts',
  institutionsEndpoint: '/institutions',
  myPlanEndpoint: '/subscriptions',
  paymentsEndpoint: '/payments',
  ticketsEndpoint: '/tickets',
};
