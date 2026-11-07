# NeuroAtlas 3D

Atlas educativo interactivo para explorar esquemas tridimensionales del cerebro y otros objetos biológicos.

## Funcionalidades
- Cerebro completo y vista de lóbulos codificados por color.
- Vista medial ilustrativa con estructuras internas.
- Modelos 3D de neurona, cerebelo y ADN.
- Rotación y zoom con ratón o pantalla táctil; rotación automática y restauración de vista.
- Etiquetas anatómicas seleccionables con información resumida.
- Carga local de modelos GLB y captura PNG.
- Diseño adaptable para ordenador, tableta y móvil.

## Inicio rápido

Requiere Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Para compilar:

```bash
npm run build
```

## Publicación

La configuración de Vite admite GitHub Pages bajo /neuroatlas-3d/. El workflow de Actions compila y despliega el sitio en cada cambio a main, una vez configurada la fuente de Pages como **GitHub Actions**.

## Alcance educativo

Los modelos incluidos son **representaciones esquemáticas generadas mediante geometrías procedurales**, no segmentaciones de neuroimagen, no modelos anatómicamente exactos ni herramientas diagnósticas. Las divisiones y posiciones son aproximadas.

## Tecnologías

React, Three.js, React Three Fiber, Drei, Vite. Sin claves de API ni servicios externos requeridos para la visualización.

## Licencia

Código bajo licencia MIT; modelos procedurales originales bajo la misma licencia.
