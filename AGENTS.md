# AGENTS.md — Codex, NeuroAtlas 3D

## Rol
Ingeniería científica full-stack, visualización anatómica 3D y neuropsicología académica. Cumplir ROADMAP.md incrementalmente con criterio de aceptación, sin inventar anatomía ni referencias.

## Proyecto
GitHub: ricardomartinez-xcode/neuroatlas-3d, rama main. Sitio: https://neuroatlas-3d.vercel.app/
React 19 + Vite + Three.js + React Three Fiber + Drei. Visores en src/AtlasViewer.jsx, src/DeepViewer.jsx, src/MRIViewer.jsx, src/SpineViewer.jsx. Biblioteca src/ClinicalExplorer.jsx y src/clinicalData.js. Datos en public/atlas, public/volume y public/spine.

## Contratos científicos
- Solo mallas o volúmenes anatómicos derivados de fuentes acreditadas y con derechos correctos. No pintar una forma «parecida» a un órgano y llamarla real.
- Documentar cada transformación entre marcos RAS, FSaverage, MNI, HRA y PAM50. NO superponer coordenadas de plantillas distintas sin registro validado.
- Los síndromes no corresponden a una sola región; mostrar factores de lateralidad, conectividad, mecanismo y etiología.
- Fuentes de clínica verificables y referenciadas en cada ficha. No copiar materiales psicométricos protegidos.
- Cada fuente tiene metadatos de URL, licencia, SHA256 y atribución visible.
- No usar información identificable de pacientes ni prometer diagnóstico.

## Orden de ejecución
1. Inspeccionar estado git; ejecutar npm ci, npm test, npm run build y comprobar Vercel.
2. Auditar con navegador real todas las modalidades y capturas escritorio/móvil, documentando anomalías de escala, transparencias, cámara y orientaciones.
3. Corregir y optimizar la RM: zoom/pan, miniaturas, pantalla completa, controles táctiles y sincronización exacta.
4. Corregir anatomía profunda y corteza: interpolaciones, materiales, selección de malla, transiciones de cámara y representación fiel.
5. Validar médula HRA: 30 segmentos individuales, clic e identificación; incluir tractos y raíces solo después de documentación de licencia y espacio.
6. Añadir modelos reales de nervios craneales, plexos y sistema nervioso periférico con fuentes abiertas y conformidad terminológica.
7. Ampliar las fichas clínicas con revisión neuropsicológica y evidencia por afirmación, pruebas y contexto cultural.
8. Implementar evaluación y casos académicos con datos ficticios, sin diagnósticos automatizados.
9. Correr pruebas CI y E2E, hacer capturas, revisar accesibilidad móvil y publicar si todos los checks son verdes.

## Finalización obligatoria por fase
Entregar cambios integrados, fuente/licencia, comando de pruebas con resultado, evidencia visual, diferencias respecto a una fuente real, advertencias científicas, SHA de commit y URL de deploy. No declarar una fase terminada si solo se ha creado un menú o placeholder. Ante fallos de autenticación, no usar secretos visibles ni inventar logins. Continuar el resto del trabajo seguro y documentar bloqueo.

