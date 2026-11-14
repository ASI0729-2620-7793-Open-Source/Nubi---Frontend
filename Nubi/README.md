# Nubi · Frontend

Aplicación web (Angular 22) de **Nubi**: acompaña a **un niño con autismo (TEA)** por cuenta y le ayuda
a relajarse, mientras su familia y su red de apoyo hacen el seguimiento.

Funciona contra el backend **Nubi.Platform.Backend** (Spring Boot, `http://localhost:8080/api/v1`).

## Cómo correrlo

1. Levanta el backend (`./mvnw spring-boot:run` en `Nubi.Platform.Backend`). Al arrancar crea la cuenta demo
   `demo@nubi.app` / `nubi123` con un niño de ejemplo.
2. En esta carpeta:

```bash
npm install
npm start
```

Abre `http://localhost:4200`. En desarrollo, `proxy.conf.cjs` reenvía `/api` al backend en el puerto 8080.
Para producción, cambia `apiBaseUrl` en `src/environments/environment.ts` por la URL pública del backend.

## Dos formas de usar Nubi

| Modo | Para quién | Qué tiene |
| --- | --- | --- |
| **Modo cuidador** (barra lateral) | Familia, terapeutas | Inicio, Rutina visual, Rincón de calma, Comunicación, Progreso, Red de apoyo, Perfil del niño, Mi plan |
| **Modo niño** (`/nino`) | El niño | Pantalla completa y botones grandes: ¿cómo te sientes?, sus estímulos favoritos, hablar con pictogramas y "Mi día". Para salir, un adulto mantiene presionado el botón 2 s |

El **Modo SOS** y el **reproductor de calma** también son de pantalla completa.

## Funcionalidades

- **Registro e inicio de sesión reales** (IAM del backend) y bienvenida en 3 pasos para registrar al único niño.
- **Rincón de calma**: estímulos visuales y sonoros (el backend oculta los que no van con su perfil sensorial),
  **respiración guiada del globo** y **dibujo tranquilo** con "arena mágica"; intensidad, baja estimulación,
  pausa y temporizador sincronizados con la sesión de calma del backend. Al terminar se pregunta cómo se siente.
- **Rutina visual** (nuevo contexto del backend): pasos del día con ícono y hora, marcar hecho, reordenar.
  El niño la ve como tarjetas grandes con celebración y voz.
- **Comunicación asistida**: tablero de pictogramas con voz, favoritos, pictogramas y categorías propias;
  los mensajes del niño le llegan al cuidador "por atender".
- **Modo SOS**: guía de contención paso a paso ordenada según el detonante, técnicas alternativas,
  respiración y llamada a contactos; al cerrar, el episodio se registra solo en la red de apoyo.
- **Progreso** (nuevo): tendencia del ánimo, distribución, momentos de calma por día, racha, recursos que más
  le ayudan, detonantes de crisis y efecto de la guía SOS, con mensajes de "lo que Nubi notó".
- **Red de apoyo**: notas en episodios, recomendaciones, pedidos de ayuda y **reportes automáticos** del periodo
  para compartir con su terapeuta.
- **Perfil sensorial** con modo de **baja estimulación** que suaviza toda la app, y avatar amigable.

## Estructura

Un directorio por Bounded Context (`iam`, `profile`, `self-regulation`, `routine`, `communication`, `crisis`,
`support-network`, `insights`, `dashboard`, `kid-mode`) con capas `domain`, `infrastructure`, `application`
y `presentation`. Lo común está en `shared`.
