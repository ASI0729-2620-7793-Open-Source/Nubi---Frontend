# Support Network

Bounded Context correspondiente a la funcionalidad de **Red de apoyo y seguimiento** de Nubi.

## Propósito

Este módulo permite al cuidador visualizar información relevante sobre el estado reciente del usuario neurodivergente y dar seguimiento a su actividad.

## Funcionalidades implementadas

Actualmente el dashboard incluye:

- Visualización de la última comunicación del usuario.
- Estado actual de Diana.
- Actividad reciente.
- Análisis de bienestar mediante un gráfico de barras.
- Diseño responsive.
- Uso de datos mock para la representación inicial de información.

## Ruta

La vista principal se encuentra disponible en:

`/support-network`

## Estructura principal

```text
support-network/
└── presentation/
    └── support-dashboard/
        ├── support-dashboard.ts
        ├── support-dashboard.html
        └── support-dashboard.css
