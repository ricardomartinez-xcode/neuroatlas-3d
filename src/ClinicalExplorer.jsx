import React,{useEffect,useMemo,useState} from 'react';
import {Activity,Search,BookOpen,Brain,ChevronRight,ExternalLink,MapPin,ClipboardList,
  AlertCircle,FileText,ShieldCheck,Network,Stethoscope,ArrowUpRight} from 'lucide-react';
import {CLINICAL_CARDS,clinicalSource} from './clinicalData.js';
const groupOptions=['Todas',...Array.from(new Set(CLINICAL_CARDS.map(c=>c.group)))];
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function ClinicalExplorer({onNavigate,externalSection='symptoms',requestedCard='hipocampo',navigationRevision=0}){
 const [search,setSearch]=useState('');
 const [group,setGroup]=useState('Todas');
 const [selected,setSelected]=useState(CLINICAL_CARDS[0].id);
 const [section,setSection]=useState(externalSection);
 useEffect(()=>{setSection(externalSection);},[externalSection,navigationRevision]);
 useEffect(()=>{
   if(!CLINICAL_CARDS.some(c=>c.id===requestedCard))return;
   setSelected(requestedCard);setGroup('Todas');setSearch('');
 },[requestedCard,navigationRevision]);
 const selectedCard=CLINICAL_CARDS.find(c=>c.id===selected)||CLINICAL_CARDS[0];
 const list=useMemo(()=>{
  const q=normalize(search.trim());
  return CLINICAL_CARDS.filter(c=>(group==='Todas'||c.group===group)&&
    (!q||normalize([c.title,c.group,c.system,c.anatomy,c.function,...c.symptoms,...c.conditions,...c.evaluation].join(' ')).includes(q)));
 },[search,group]);
 return <section className="clinical-lab" id="clinica">
    <div className="panel-heading"><div><span className="section-kicker">01 / BIBLIOTECA CLÍNICA</span><h2>Procesos, síndromes y evaluación</h2></div><Brain size={23}/></div>
    <p className="section-intro">Parte del problema clínico o el dominio cognitivo. Examina manifestaciones, hipótesis diferenciales, estrategias de evaluación y evidencia científica. La neuroanatomía sirve como correlato, no como diagnóstico.</p>
    <div className="clinical-searchbar">
      <label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar memoria, afasia, atención, trastornos, TCE…"
        aria-label="Buscar en la biblioteca clínica"/></label>
      <span>{list.length} de {CLINICAL_CARDS.length} fichas documentadas</span>
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
        <div className="clinical-record-meta"><span><span className="status-dot"/> FICHA NEUROPSICOLÓGICA · EVIDENCIA</span><strong>{selectedCard.group}</strong></div>
        <h3>{selectedCard.title}</h3><p className="clinical-record-system">{selectedCard.system}</p>
        <div className="clinical-record-tabs" role="tablist">
          {[
            ['symptoms','Manifestaciones y síndromes'],['clinical','Procesos y redes'],['assessment','Evaluación y evidencia']
          ].map(([id,name])=><button role="tab" key={id} aria-selected={section===id} className={section===id?'active':''}
            onClick={()=>setSection(id)}>{name}</button>)}
        </div>
        <div className="clinical-record-body">
          {section==='clinical'&&<>
            <div className="clinical-subheading"><Network size={17}/> Procesos cognitivos y redes funcionales</div><p>{selectedCard.function}</p>
            <div className="clinical-subheading"><MapPin size={17}/> Anatomía de referencia</div><p>{selectedCard.anatomy}</p>
          </>}
          {section==='symptoms'&&<>
            <div className="clinical-subheading"><Activity size={17}/> Signos y manifestaciones posibles</div>
            <ul>{selectedCard.symptoms.map(t=><li key={t}>{t}</li>)}</ul>
            <div className="clinical-subheading"><Stethoscope size={17}/> Condiciones y síndromes asociados</div>
            <ul>{selectedCard.conditions.map(t=><li key={t}>{t}</li>)}</ul>
          </>}
          {section==='assessment'&&<>
            <div className="clinical-subheading"><ClipboardList size={17}/> Evaluación neuropsicológica orientada a hipótesis</div>
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
          {selectedCard.locate?.mode==='deep'&&<button onClick={()=>onNavigate(selectedCard.locate)}><Brain size={16}/> Consultar correlato subcortical 3D <ArrowUpRight size={16}/></button>}
          {selectedCard.locate?.mode==='cortex'&&<button onClick={()=>onNavigate(selectedCard.locate)}><Brain size={16}/> Localizar en corteza de referencia <ArrowUpRight size={16}/></button>}
          {selectedCard.locate?.mode==='spine'&&<button onClick={()=>onNavigate(selectedCard.locate)}><Brain size={16}/> Consultar segmento medular 3D <ArrowUpRight size={16}/></button>}
        </div>
      </article>
    </div>
    <div className="clinical-disclaimer"><FileText size={17}/> Material educativo basado en asociaciones clínicas y redes funcionales, no una herramienta diagnóstica. No se reproducen baremos ni ítems de pruebas protegidas; la relación entre estructura y síntoma no es determinista.</div>
 </section>;
}

