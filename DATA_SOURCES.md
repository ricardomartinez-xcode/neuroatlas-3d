# Proveniencia de datos anatómicos

## Fuentes reproducibles

Se utilizaron archivos distribuidos en los siguientes recursos, descargados el 9 de noviembre de 2026:

- GIFTI **fsaverage5** (pial, inflated, sulc) desde:
  `https://raw.githubusercontent.com/nilearn/nilearn/main/nilearn/datasets/data/fsaverage5/`
- Etiquetas del **atlas Destrieux** para FreeSurfer `a2009s`:
  `https://www.nitrc.org/frs/download.php/9343/lh.aparc.a2009s.annot` (izquierdo)
  `https://www.nitrc.org/frs/download.php/9342/rh.aparc.a2009s.annot` (derecho)
- Referencia original de Destrieux et al. (2010): https://doi.org/10.1016/j.neuroimage.2010.06.010

La correspondencia de índices de vértices entre las superficies y el atlas se verifica en la conversión (10 242 vértices por hemisferio). No se obtuvo información sensible ni datos de pacientes.

## SHA-256 de insumos

| Archivo | SHA-256 |
| --- | --- |
| pial_left.gii.gz | 1e76fe43ac194c15fd272643f7ae7995621e2a496b3102b2d6175f0f8e6d7fc8 |
| pial_right.gii.gz | fdfae008bc10acf7cba82737ea5db9a7298948c41884a2d3330a785783a60a91 |
| infl_left.gii.gz | 1a571c9d598a476a202c7295c235a709de63360047b92c0e7b75ed18b0f37e74 |
| infl_right.gii.gz | 9f66b009e1da72158d75b4e739c6289aba0c1b08d818b2f0f9f61204aa4ba895 |
| sulc_left.gii.gz | bd0f87e0cba153e9d5c5281edc7267f631b1967e5883d4027924766c8430eb62 |
| sulc_right.gii.gz | 97afe76225903205a16b88f88cd796945f2a27011328e98decaa9128ff063afb |
| left.annot | c2401d6137949f33788283a4926cb61cb3b0bfe5bda1b368c22aa921ea06d38d |
| right.annot | 99c028f9f9d8dce617e9f29a5ebdc2f1b187d83650b68128fae53c3669588da7 |

## Alcance de los modelos

- Espacio de superficie: FreeSurfer **fsaverage5**.
- Parcelación: **Destrieux** 2009 (giros y surcos), 76 índices por hemisferio (incluye unknown y pared medial; 74 etiquetas corticales).
- Geometría: 10 242 vértices y 20 480 triángulos por hemisferio; posiciones en RAS transformadas para escena Three.js mediante rotación/reflejo de ejes con cambio correspondiente de winding y escala uniforme.
- Formato de distribución: binary array `NATL` de lectura directa en el navegador.
- **No** es neuroimagen individual, reconstrucción volumétrica ni registro espacial a MNI152.

## Condiciones legales y científicas

La licencia MIT aplica al código de esta aplicación, **no automáticamente a las superficies/parcelaciones de origen**. Nilearn declara BSD-3-Clause para su software, mientras FreeSurfer y algunos conjuntos de datos o plantillas distribuidos con ese ecosistema pueden estar sujetos a condiciones distintas. Antes de uso comercial, clínico o de redistribución fuera del contexto académico, deben confirmarse las licencias aplicables y, de ser necesario, solicitarse las autorizaciones correspondientes a los titulares de los datos.

Este sitio tiene **uso educativo y de investigación, no diagnóstico**. No atribuye funciones exclusivas ni predice déficits a partir del clic en una región.



## v3: RM MNI152NLin2009cAsym y segmentación subcortical

- Plantilla anatómica T1 y aseg FreeSurfer desde TemplateFlow: https://github.com/templateflow/tpl-MNI152NLin2009cAsym
- Licencia de datos: https://github.com/templateflow/tpl-MNI152NLin2009cAsym/blob/master/LICENSE (Louis Collins, McConnell Brain Imaging Centre, McGill University; mantener aviso de copyright).
- Insumos originales recuperados desde el almacenamiento público de TemplateFlow. SHA-256 fijados en `scripts/fetch_volume.py` y en `public/volume/manifest.json`.
- T1 + aseg 2 mm comparten affine MNI RAS. Las isosuperficies de estructuras internas utilizan aseg 1 mm del mismo espacio de plantilla.
- Superficie cortical fsaverage5 y volumen MNI152NLin2009cAsym **no** se muestran como una superposición coregistrada: pertenecen a plantillas diferentes.
- Marching cubes y suavizado interpolan los límites de las etiquetas de una segmentación volumétrica; no son reconstrucciones anatómicas individualizadas.

## fsaverage6 (Nilearn/OSF)

Archivo descargado: https://osf.io/jzxyr/download

SHA-256: `ffab4ce0e067079388b863edca7f3c9aefa870b151511b8f91f48031a5576757`.

Se cargan pial6, infl6, sulc6 y sphere6 originales; se conservan los índices y coordenadas geométricas. El primer bloque de 10 242 vértices coincide prácticamente con los índices de fsaverage5, con diferencias de coordenadas inferiores a 0.001 mm en puntos verificados. Las etiquetas Destrieux de los vértices restantes se propagan por vecino más próximo sobre la esfera fsaverage6. Por ello, el contorno de las etiquetas en fsaverage6 es una **aproximación**, no una segmentación distinta validada.

La envolvente contextual MNI se deriva de aseg 1 mm con etiquetas de corteza y sustancia blanca, relleno de cavidades y suavizado ligero, conservando la matriz de coordenadas MNI. No es una reconstrucción pial ni un atlas histológico.
