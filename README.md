# NeuroAtlas 3D

**Laboratorio interactivo de neuroanatomía cortical y neuropsicología** basado en geometrías reales de referencia y una parcelación cortical reproducible.

## ¿Qué cambió en v2?

La versión inicial utilizaba geometrías tridimensionales procedurales e ilustrativas. La v2 reemplaza el **visor cortical principal** por mallas de **FreeSurfer fsaverage5**, distribuidas a través de [Nilearn](https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_surf_fsaverage.html), y por etiquetas del **atlas Destrieux (2009)**, obtenidas mediante [Nilearn/NITRC](https://www.nitrc.org/frs/?group_id=728).

- Dos hemisferios con **10 242 vértices y 20 480 triángulos por hemisferio**.
- Superficie **pial** y **superficie inflada** del mismo atlas, con coloración anatómica, de lóbulos o de parcelas.
- **74 regiones corticales por hemisferio** en la parcelación Destrieux de este conjunto; el formato almacena 76 identificadores totales porque incluye «Unknown» y la pared medial.
- Identificación **directa sobre la malla** por clic y señalamiento; el atlas se puede filtrar y consultar en español.
- Aislamiento de hemisferio derecho/izquierdo, vista medial, lateral, anterior, posterior, superior, inferior u oblicua, giro automático, zoom, arrastre, ajuste de opacidad y captura PNG.
- Capas pedagógicas **por dominios neuropsicológicos** con una advertencia explícita sobre el carácter distribuido de las funciones.
- **Autoevaluación de localización anatómica** con conteo de respuestas.

> No se incluyen en este momento reconstrucciones reales del cerebelo, hipocampo, tálamo, tractos de sustancia blanca ni conectomas. No se debe interpretar el visor cortical como un encéfalo completo, un atlas funcional exhaustivo, un mapa de lesiones o una herramienta clínica.

## Instalación

Requiere Node.js 22 o superior (o una versión compatible con Vite 7).

```sh
npm ci
npm run dev
```

Abra la dirección indicada por Vite. Para validar la integridad de los archivos:

```sh
npm test
npm run build
npm run preview
```

## Despliegue

Se incluyen configuraciones para Vercel (`vercel.json`) y GitHub Pages (`.github/workflows/deploy.yml`). Vercel compila con `npm run build` y publica `dist`; GitHub Pages activa un prefijo `/neuroatlas-3d/` mediante `GITHUB_PAGES=true`.

## Datos y reproducibilidad

Los archivos `public/atlas/*.bin` son archivos binarios generados para facilitar la visualización en el navegador, **no modelos inventados**. Los genera `scripts/build_atlas.py` a partir de:

- GIFTI pial de hemisferio izquierdo y derecho.
- GIFTI de superficies infladas izquierda y derecha.
- GIFTI de profundidad de surcos de ambos hemisferios.
- Etiquetas de superficie izquierda y derecha `*.aparc.a2009s.annot` del atlas Destrieux.

Para repetir la conversión:

```sh
python3 scripts/fetch_atlas.py
python3 scripts/build_atlas.py
npm test
```

El formato `NATL` consiste en: cabecera mágica de 4 bytes, número de vértices y de triángulos (uint32 little-endian), posiciones (float32 × 3), triángulos (uint16 × 3), identificación de parcela por vértice (uint8) y profundidad de surcos (float32). Las coordenadas FreeSurfer RAS se **reorientan y escalan uniformemente**, sin deformar sus proporciones espaciales. La superficie inflada es una versión de la malla con geometría de visualización distinta.

El índice de una cara intersectada permite localizar la etiqueta mediante sus vértices. Los límites de color pueden suavizarse visualmente; las etiquetas y el resaltado son una aproximación por triángulos a una parcelación **definida por vértice**.

Las dependencias del navegador son React, Three.js, React Three Fiber, Drei y Vite; la aplicación es estática, sin base de datos ni servicios de inferencia.

## Interpretación académica y límites

- `fsaverage5` es una **superficie promedio de referencia**, no un encéfalo individual, ni una resonancia de paciente.
- Las etiquetas Destrieux se basan en **nomenclatura anatómica de giros y surcos**; no son mapas funcionales.
- Una función neuropsicológica depende de redes distribuidas, lateralización, variabilidad individual y conectividad, no sólo de una parcela anatómica.
- La superficie cortical **no incluye estructuras subcorticales**; no atribuirle a un giro cortical la geometría del hipocampo, del tálamo o de ganglios basales.
- Las superficies infladas son útiles para revelar surcos, pero **alteran** el aspecto macroscópico.
- Las descripciones neuropsicológicas son didácticas y no sustituyen correlación clínico-anatómica o evaluación neuropsicológica.

## Referencias y derechos de datos

1. Destrieux C, Fischl B, Dale A, Halgren E. (2010). *Automatic parcellation of human cortical gyri and sulci using standard anatomical nomenclature*. NeuroImage, 53(1), 1–15. https://doi.org/10.1016/j.neuroimage.2010.06.010
2. FreeSurfer: *Cortical Parcellation*. https://surfer.nmr.mgh.harvard.edu/fswiki/CorticalParcellation
3. Nilearn: *fetch_surf_fsaverage* / *fetch_atlas_surf_destrieux*. https://nilearn.github.io/stable/

Consulte [DATA_SOURCES.md](DATA_SOURCES.md) para enlaces de origen, verificaciones SHA-256 y advertencias de licencia. **La licencia MIT del código del proyecto no cambia los términos de los datos anatómicos de terceros**.

## Licencias

El **código original de NeuroAtlas 3D** se distribuye bajo MIT. Los datos y archivos derivados de FreeSurfer/Nilearn/Destrieux se atribuyen por separado y conservan sus licencias y condiciones de origen. No se concede por este repositorio ninguna licencia comercial o clínica para datos de terceros.

