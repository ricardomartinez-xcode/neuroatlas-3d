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


## v3 · Tríada anatómica y neuropsicológica

NeuroAtlas incluye **tres modalidades complementarias** bajo la misma interfaz:

1. **Corteza**: superficie FreeSurfer fsaverage5 y 74 parcelas corticales por hemisferio de Destrieux. Se mantiene en su espacio de referencia superficial original. Las parcelaciones son etiquetas de giros y surcos.
2. **Anatomía profunda 3D**: 17 superficies derivadas de la segmentación volumétrica FreeSurfer aseg incluida con MNI152NLin2009cAsym de TemplateFlow (resolución de segmentación **1 mm**). Los modelos se obtienen con isosuperficies `marching_cubes` tras suavizado subvoxel ligero; son modelos de referencia promedio y no anatomía individual.
3. **Resonancia magnética T1**: volumen anatómico estándar MNI152NLin2009cAsym **2 mm** con cortes axial, coronal y sagital sincronizados, coordenadas en mm y superposición opcional de etiquetas FreeSurfer aseg de la misma plantilla volumétrica.

### Procedencia y trazabilidad

- Fuente abierta de T1 y segmentación: https://github.com/templateflow/tpl-MNI152NLin2009cAsym
- Descarga directa: https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/
- [Licencia del dataset MNI](https://github.com/templateflow/tpl-MNI152NLin2009cAsym/blob/master/LICENSE), atribuida a Louis Collins / McConnell Brain Imaging Centre, McGill University, permite usar, copiar, modificar y distribuir con la preservación de su aviso de copyright. Véase la licencia original; no aplica automáticamente a todos los atlas de terceros.
- *Los datos de volumen MNI152NLin2009cAsym no están automáticamente registrados con la superficie fsaverage5*. Las dos modalidades se muestran separadas para no inducir a error.
- La visualización y la autoevaluación no son dispositivos médicos, no ofrecen neuroimagen clínica ni permiten inferir una lesión o diagnóstico individual.
- Los campos neuropsicológicos indican asociaciones de redes. No representan mediciones funcionales de neuroimagen.

Para regenerar y verificar los modelos, con Python 3.12 + dependencias científicas:

```sh
python -m pip install numpy scipy scikit-image nibabel
python scripts/fetch_volume.py
python scripts/build_volume.py
npm test
```

La acción manual `Prepare NeuroAtlas MNI anatomical assets` de GitHub Actions también regenera, valida y publica los artefactos, que se distribuyen como datos estáticos en `public/volume`. Consulte el código de conversión para dimensiones, transformaciones affine RAS y checksums SHA-256 de los insumos.



## v4 · Corrección de fidelidad anatómica y visualización

- **Corteza con mallas auténticas fsaverage6** de 40 962 vértices por hemisferio (81 924 en ambos hemisferios), obtenidas directamente de la distribución de Nilearn/OSF. El atlas Destrieux original continúa siendo el de fsaverage5: se transfieren las etiquetas al espacio esférico de fsaverage6 por vecino más próximo. **Los límites de las parcelas interpoladas son aproximados, no anotaciones nativas fsaverage6.** Se mantienen los archivos de bajo detalle como respaldo. La cámara y la iluminación ahora encuadran la geometría de forma apropiada en pantallas anchas y móviles. Los colores categóricos poseen límites definidos, evitando gradientes inventados.
- **Anatomía profunda en su contexto MNI real**: se ha añadido una envolvente cortical derivada exclusivamente de corteza y sustancia blanca del aseg 1 mm, en el mismo espacio de referencia que las estructuras profundas. Se permite alternar entre ubicación cerebral (escala y coordenadas conservadas) y pieza anatómica aislada ampliada uniformemente. La silueta contextual es **una aproximación visual**, no una pial individual, y no debe confundirse con una corteza cortical de alta precisión.
- **La resonancia T1 continúa intacta**. Los tres cortes sincronizados provienen de la plantilla T1 MNI152, separados correctamente de la malla de fsaverage6, que usa otro espacio de referencia.

La malla fsaverage6 está disponible en https://osf.io/jzxyr/ (vía Nilearn, suma SHA-256 documentada en `public/atlas/fs6-meta.json`). Para reproducir los datos se incorporan `scripts/build_fs6.py` y `scripts/build_context.py` al flujo `Prepare NeuroAtlas MNI anatomical assets` de GitHub Actions.

**Limitaciones**: la resolución de las segmentaciones volumétricas no equivale a precisión histológica; límites de etiquetas fsaverage6 son interpolados y requieren precaución clínica; no se ha validado para uso diagnóstico. Los modelos profundos se basan en isosuperficies del atlas aseg y pueden carecer de pequeños detalles anatómicos.

### Correlación de la estructura profunda con una RM real de referencia
La vista de anatomía profunda permite mostrar un plano sagital T1 real de la misma plantilla MNI152 sobre el modelo 3D de la estructura seleccionada. El plano recorre el eje RAS de izquierda a derecha y puede desplazarse manualmente; se contrasta con la estructura sin deformarla. De manera alternativa es posible ocultar el corte, mostrar una silueta cortical derivada de aseg o ampliar la pieza uniformemente. La opción de corte T1 es **una imagen de plantilla promedio**, no neuroimagen individual de pacientes.

## v5 · RM ampliada, neuropsicología clínica y médula HRA

- Visor de resonancia T1: plano principal ampliado con zoom, paneo, pantalla completa, dos planos secundarios y controles de ubicación.
- Biblioteca clínica académica: búsqueda por síndrome, estructura, síntoma o dominio y fichas de anatomía, función, enfermedades relacionadas, evaluación y fuentes.
- Médula 3D con 30 segmentos auténticos C1-S5 de Human Reference Atlas / National Library of Medicine, CC BY 4.0. Fuente, licencia y SHA256 en DATA_SOURCES.md; workflow prepare-spine.yml y scripts/fetch_spine.py.
- Faltan modelos auténticos de raíces, nervios periféricos y tractos medulares. No se sustituirán por geometría sintética que aparente tener validación anatómica.
- El plan maestro de implementación está en ROADMAP.md y las instrucciones para Codex están en AGENTS.md.
