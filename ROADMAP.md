# NeuroAtlas 3D — Plan maestro científico y técnico

## Objetivo
Crear un atlas interactivo académico del encéfalo, médula espinal y sistema nervioso, con neuroimágenes de referencia, geometrías 3D verificables y correlaciones neuropsicológicas clínicas basadas en evidencia.

## Estado por etapa

| Etapa | Función | Estado / criterio de aceptación |
| --- | --- | --- |
| 0 | Arquitectura Vite/React/Three, repositorio, despliegue Vercel y GitHub Pages | Implementado; CI debe compilar |
| 1 | RM T1: plano principal grande, secundarios, pantalla completa, zoom, pan, coordenadas y sincronización | Implementado. Pendiente QA completa en dispositivos físicos |
| 2 | Corteza cerebral fsaverage6 con Destrieux y selección 3D | Implementado; etiquetas de regiones nuevas de fs6 se interpolan desde fs5 y requieren cautela |
| 3 | Anatomía profunda MNI152: núcleos, tálamo, hipocampo, amígdala, cerebelo, tronco, cuerpo calloso | Implementado con 17 mallas; límite: no atlas histológico |
| 4 | Médula HRA real: 30 segmentos medulares, interacción e aislamiento | Implementado; GLB HRA CC BY 4.0, ver manifest del asset |
| 5 | Fichas de anatomía, función, síntomas, enfermedad, evaluación y citas | Biblioteca inicial implementada; ampliar tras revisión profesional |
| 6 | Sustancia gris/blanca y tractos medulares verdaderos | Pendiente: fuente bien licenciada; considerar PAM50 con licencia de redistribución confirmada |
| 7 | Nervios craneales, raíces, plexos y nervios periféricos 3D | Pendiente: fuente anatómica abierta, mallas y verificación de nomenclatura |
| 8 | Redes y conectividad funcional basadas en tractografía validada | Pendiente: definir atlas y marcos espaciales |
| 9 | Modo docente, banco de preguntas y casos académicos | Parcial: autoevaluación cortical existente; ampliar evidencia y casos |
| 10 | Validación externa de precisión anatómica, neuropsicológica, rendimiento y accesibilidad | Pendiente: control experto independiente |

## Reglas innegociables
1. No sustituir anatomía real por mallas procedurales sin declararlas esquemas.
2. Diferenciar atlas anatómico, función neuropsicológica y asociación clínica. No presentar correlación como causalidad.
3. fsaverage6, MNI152 y HRA no son un único sujeto ni un sistema de coordenadas intercambiable. Solo superponer tras registro anatómico comprobado.
4. Todo dataset debe documentar URL, versión, licencia, suma SHA-256, transformaciones y autoría.
5. Los trastornos requieren factores contextuales, etiología, lateralidad, mecanismos y diferenciales. Una región no diagnostica a nadie.
6. Cada ficha debe tener referencias que respalden sus afirmaciones. No inventar pruebas psicométricas, baremos, DOI ni guías.
7. No utilizar fotos o datos médicos identificables, ni material de tests comerciales protegido.

## Experiencia de usuario
- Navegación: corteza cerebral, estructuras profundas, resonancia T1, médula espinal, neuropsicología clínica.
- En RM: vista principal grande, dos vistas pequeñas, cambio de plano, coordenadas enlazadas, zoom y pantalla completa. En móvil, plano principal a ancho completo.
- 3D: arrastrar para rotar, gestos táctiles, aislamiento real de estructura, materiales anatómicos discretos, interpolación de movimiento, reset y etiquetas.
- Biblioteca: búsqueda por región, síntoma, trastorno, función, síndrome y metodología de evaluación; evidencias y límites claramente visibles.
- Docentes: control de etiquetas, preguntas, historial de respuestas, aprendizaje basado en casos, banco de objetivos.
- Accesibilidad: sin desbordamiento horizontal, controles táctiles utilizables, navegación por teclado, contraste suficiente, alternativas al visor WebGL.

## Fuentes candidatas por módulo
- Corteza: FreeSurfer/Nilearn fsaverage6; Destrieux 2010.
- Profundo y RM: TemplateFlow MNI152NLin2009cAsym con FreeSurfer aseg.
- Médula: HuBMAP Human Reference Atlas del NLM Visible Human Male, CC BY 4.0, 30 mallas medulares.
- Tractos: Spinal Cord Toolbox PAM50; no redistribuir derivados sin verificar derechos explícitos.
- Nervios periféricos: HRA/BodyParts3D con CC BY 4.0 y nomenclatura UBERON/FMA validada.
- Clínica: guías, revisiones sistemáticas y artículos revisados; no equivalencia mecánica región-trastorno.

## Criterios de aceptación de cada fase
1. El asset anatómico tiene geometría real y procedencia reproducible.
2. La selección 3D identifica correctamente cada malla y está asociada a la ficha correspondiente.
3. No hay problemas severos de transparencia, escala, iluminación, orientación ni imágenes «flotantes».
4. Pasan las pruebas unitarias de geometría, etiquetas, volúmenes y vínculos.
5. Build de Vite y tests CI pasan; GitHub y Vercel publican, y cada asset devuelve HTTP 200.
6. Pruebas con navegador en 1440x900, 768x1024, 390x844 y 360x740: cero errores JS, sin overflow, controles táctiles útiles.
7. Revisión visual por un humano verifica capturas de todas las vistas y la correcta leyenda de sus limitaciones.
8. Se registra todo lo pendiente sin afirmar validación clínica certificada.

## Trabajo siguiente para Codex
Ver instrucciones concretas en AGENTS.md. Priorizar: auditoría visual de los 4 visores, animación y control de cámaras; ampliar nervios y tractos solo con datos autorizados; revisión experta del contenido clínico; accesibilidad, educación y casos.

