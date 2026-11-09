import React,{useMemo,useState} from 'react';
import {Activity,Search,BookOpen,Brain,ChevronRight,ExternalLink,MapPin,ClipboardList,
  AlertCircle,FileText,ShieldCheck,Network,Stethoscope,ArrowUpRight} from 'lucide-react';
import {CLINICAL_CARDS,clinicalSource} from './clinicalData.js';
const groupOptions=['Todas',...Array.from(new Set(CLINICAL_CARDS.map(c=>c.group)))];
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function ClinicalExplorer({onNavigate}){
 const [search,setSearch]=useState('');
 const [group,setGroup]=useState('Todas');
 const [selected,setSelected]=useState(CLINICAL_CARDS[0].id);
 const [section,setSection]=useState('clinical');
 const selectedCard=CLINICAL_CARDS.find(c=>c.id===selected)||CLINICAL_CARDS[0];
 const list=useMemo(()=>{
  const q=normalize(search.trim());
  return CLINICAL_CARDS.filter(c=>(group==='Todas'||c.group===group)&&
    (!q||normalize([c.title,c.group,c.system,c.anatomy,c.function,...c.symptoms,...c.conditions,...c.evaluation].join(' ')).includes(q)));
 },[search,group]);
 return <section className="clinical-lab" id="clinica">
    <div className="panel-heading"><div><span className="section-kicker">06 / CORRELACIÓN CLÍNICO-ANATÓMICA</span><h2>Biblioteca de neuropsicología clínica</h2></div><Brain size={23}/></div>
    <p className="section-intro">Explora la relación entre anatomía, sistemas funcionales, enfermedades, manifestaciones clínicas y evaluación neuropsicológica con fuentes consultables. Una lesión no determina automáticamente un síndrome.</p>
    <div className="clinical-searchbar">
      <label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar estructura, trastorno, síntoma o función…"
        aria-label="Buscar en la biblioteca clínica"/></label>
      <span>{list.length} fichas disponibles</span>
    </div>
    <div className="clinical-groupbar" role="group" aria-label="Filtrar dominio clínico">
      {groupOptions.map(k=><button key={k} aria-pressed={group===k} className={group===k?'active':''} onClick={()=>setGroup(k)}>{k}</button>)}
    </div>
    <div className="clinical-workspace">
      <div className="clinical-index" aria-label="Fichas clínico-anatómicas">
        {list.length?list.map(card=><button key={card.id} className={card.id===selected?'selected':''}
          onClick={()=>setSelected(card.id)}>
          <span className="clinical-entry-icon"><Brain size={17}/></span>
          <span className="clinical-entry-name"><strong>{card.title}</strong><small>{card.group} · {card.system}</small></span>
          <ChevronRight size={15}/></button>)
         :<div className="clinical-empty">No se encontraron fichas con esos términos. Prueba con otra estructura o síntoma.</div>}
      </div>
      <article className="clinical-record">
        <div className="clinical-record-meta"><span><span className="status-dot"/> FICHA EDUCATIVA · EVIDENCIA Y CONTEXTO</span><strong>{selectedCard.group}</strong></div>
        <h3>{selectedCard.title}</h3><p className="clinical-record-system">{selectedCard.system}</p>
        <div className="clinical-record-tabs" role="tablist">
          {[
            ['clinical','Anatomía y función'],['symptoms','Clínica y enfermedades'],['assessment','Evaluación y evidencia']
          ].map(([id,name])=><button role="tab" key={id} aria-selected={section===id} className={section===id?'active':''}
            onClick={()=>setSection(id)}>{name}</button>)}
        </div>
        <div className="clinical-record-body">
          {section==='clinical'&&<>
            <div className="clinical-subheading"><MapPin size={17}/> Anatomía</div><p>{selectedCard.anatomy}</p>
            <div className="clinical-subheading"><Network size={17}/> Redes y funciones</div><p>{selectedCard.function}</p>
          </>}
          {section==='symptoms'&&<>
            <div className="clinical-subheading"><Activity size={17}/> Manifestaciones posibles</div>
            <ul>{selectedCard.symptoms.map(t=><li key={t}>{t}</li>)}</ul>
            <div className="clinical-subheading"><Stethoscope size={17}/> Enfermedades y síndromes relacionados</div>
            <ul>{selectedCard.conditions.map(t=><li key={t}>{t}</li>)}</ul>
          </>}
          {section==='assessment'&&<>
            <div className="clinical-subheading"><ClipboardList size={17}/> Evaluación orientada a hipótesis</div>
            <ul>{selectedCard.evaluation.map(t=><li key={t}>{t}</li>)}</ul>
            <div className="clinical-subheading"><ShieldCheck size={17}/> Naturaleza de la evidencia</div><p>{selectedCard.evidence}.</p>
          </>}
          <div className="clinical-caution"><AlertCircle size={16}/><p>{selectedCard.caveat}</p></div>
          <div className="clinical-citations"><div className="clinical-subheading"><BookOpen size={16}/> Fuentes científicas</div>
            {selectedCard.refs.map(id=>clinicalSource(id)).filter(Boolean).map(ref=><a key={ref.url}
              href={ref.url} target="_blank" rel="noopener noreferrer">
              <span>{ref.title}</span><ExternalLink size={15}/></a>)}
          </div>
        </div>
        <div className="clinical-actions">
          {selectedCard.locate?.mode==='deep'&&<button onClick={()=>onNavigate(selectedCard.locate)}><Brain size={16}/> Ubicar en anatomía profunda <ArrowUpRight size={16}/></button>}
          {selectedCard.locate?.mode==='cortex'&&<button onClick={()=>onNavigate(selectedCard.locate)}><Brain size={16}/> Localizar en corteza 3D <ArrowUpRight size={16}/></button>}
          {selectedCard.locate?.mode==='spine'&&<span className="clinical-pending">La localización 3D medular requiere verificar la licencia y los datos del atlas PAM50.</span>}
        </div>
      </article>
    </div>
    <div className="clinical-disclaimer"><FileText size={17}/> Las fichas son síntesis originales para aprendizaje universitario. No contienen puntuaciones, baremos ni instrucciones reproducidas de pruebas protegidas; tampoco diagnostican enfermedades ni establecen relaciones estructura-síndrome deterministas.</div>
 </section>;
}

