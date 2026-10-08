# Arquitectura de Red de Apoyo y Seguimiento

Este documento describe la estructura actual del Bounded Context **Red de Apoyo y Seguimiento** de Nubi.

## Propósito

El módulo permite presentar al cuidador información resumida sobre el estado y la actividad reciente del usuario neurodivergente.

Actualmente se encuentra implementado el dashboard principal de seguimiento utilizando datos mock para representar la información mientras se completa la integración con los servicios backend.

## Estructura

La implementación actual se encuentra organizada de la siguiente manera:

```text
support-network/
├── README.md
├── ARCHITECTURE.md
└── presentation/
    └── support-dashboard/
        ├── support-dashboard.ts
        ├── support-dashboard.html
        └── support-dashboard.css
