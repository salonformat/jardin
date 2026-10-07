import {lookingMarkup,bindLooking} from './looking.js?v=garthwaite-context';
import {printingMarkup,bindPrinting} from './printing.js?v=garthwaite-context';
import {story,storyMarkup,bindStory} from './story.js?v=honest-ending';
import {experience} from './experience.js?v=fresh-cloth-fit-screen';
import {cleanMotifs} from './motif-model.js?v=fresh-cloth-fit-screen';
import {journey} from './journey.js?v=fresh-cloth-fit-screen';
import {stageMarkup,bindStage} from './stages.js?v=fresh-cloth-fit-screen';
import {Garden,INKS} from './garden.js?v=fresh-cloth-fit-screen';
import {copy,journeyCopy,printCopy} from './content.js?v=fresh-cloth-fit-screen';
const app=document.querySelector('#app');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Opening the experience never restores artwork implicitly. Resume is an explicit action.
const saved={};
const state={motifs:[],edited:!!saved.edited,bloom:!!saved.bloom,repeated:!!saved.repeated,palette:Number.isInteger(saved.palette)&&saved.palette>=0&&saved.palette<INKS.length?saved.palette:0,spacing:Number.isFinite(saved.spacing)?Math.max(0,Math.min(100,saved.spacing)):45,ground:[0,1,2].includes(saved.ground)?saved.ground:0,layout:saved.layout===0?0:1,scale:saved.scale===1?1:0,thought:[0,1,2].includes(saved.thought)?saved.thought:null,answer:[0,1].includes(saved.answer)?saved.answer:null,lastCreator:[0,1,2,3].includes(saved.lastCreator)?saved.lastCreator:1,beforeDesign:saved.beforeDesign||null,activeCreator:null,visitedCreators:[],explored:Array.isArray(saved.explored)?saved.explored:[false,false,false,false],person:saved.person==='julie'?'julie':'sonia',paused:reduced.matches,sound:false};
let printTimer;
let garden,locale='fr',scene='jardin',phase=0,routeTimer;
const arrow='<svg class="arrow" viewBox="0 0 30 20" fill="none" aria-hidden="true"><path d="M1 10h26M19 2l8 8-8 8" stroke="currentColor" stroke-width="1.3"/></svg>';
const flower='<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 14C-1-8-6 20 13 16C-8 32 22 41 16 19C35 40 44 11 20 16C41-2 10-9 16 14Z"/></svg>';
function icon(kind){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind==='pause'?'<path d="M9 5v14M15 5v14"/>':kind==='play'?'<path d="m8 4 12 8-12 8z"/>':kind==='sound'?'<path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>':'<path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6"/>'}</svg>`;}
function save(){try{localStorage.setItem('salon-jardin',JSON.stringify({motifs:state.motifs,edited:state.edited,bloom:state.bloom,repeated:state.repeated,palette:state.palette,spacing:state.spacing,person:state.person,ground:state.ground,layout:state.layout,scale:state.scale,thought:state.thought,answer:state.answer,explored:state.explored,lastCreator:state.lastCreator,beforeDesign:state.beforeDesign}))}catch{}}
function url(page,lang=locale,step=0){return `#/${lang}/${page}${['fleur','creatrices'].includes(page)?'/'+step:''}`;}
function header(t){return `<header class="masthead"><a class="brand" href="${url('jardin')}" aria-label="${t.home}"><span class="brand-mark">${flower}</span><span>salon<b>format</b></span></a><span class="mast-title">Un jardin à soi</span><div class="utilities"><div class="utility-group"><button class="icon-button" id="motion" aria-label="${state.paused?t.play:t.pause}" aria-pressed="${state.paused}" title="${state.paused?t.play:t.pause}">${icon(state.paused?'play':'pause')}</button></div><nav class="languages" aria-label="${t.language}">${['fr','de','en'].map(l=>`<button lang="${l}" data-language="${l}" aria-label="${{fr:'Français',de:'Deutsch',en:'English'}[l]}" aria-pressed="${l===locale}">${l.toUpperCase()}</button>`).join('')}</nav></div></header>`;}
function footer(t){const labels=story[locale].chapters,step=scene==='fleur'?0:['regarder','creatrices'].includes(scene)?1:scene==='atelier'?2:scene==='souvenir'?3:-1;return `<footer class="story-footer"><span>${t.credit}</span>${step<0?`<span>${journey[locale].duration}</span>`:`<ol aria-label="${journey[locale].duration}">${labels.map((label,i)=>`<li ${i===step?'aria-current="step"':''}>${label}</li>`).join('')}</ol>`}</footer>`;}
function render(focus=false){clearTimeout(printTimer);garden?.destroy();if(scene==='creatrices'){if(!state.visitedCreators.includes(phase))state.visitedCreators.push(phase);if(state.activeCreator!==phase){state.beforeDesign={palette:state.palette,ground:state.ground,layout:state.layout,scale:state.scale};state.activeCreator=phase;state.lastCreator=phase;save();}}else state.activeCreator=null;const t=copy[locale];document.documentElement.lang=locale;document.body.classList.toggle('paused',state.paused);document.querySelector('.skip-link').textContent=t.skip;document.title='Un jardin à soi — Salon Format';
  if(scene==='jardin'){
    app.innerHTML=`<div class="shell cover-shell"><canvas class="garden-cover" aria-hidden="true"></canvas>${header(t)}<main id="main" class="hero scene-enter"><div class="hero-copy"><h1 tabindex="-1"><span>${t.title[0]}</span><span>${t.title[1]}</span></h1><h2 class="hero-subject">${story[locale].subject}</h2><p class="hero-intro">${story[locale].intro}</p><p class="hero-artists">Sonia Delaunay · Maija Isola<br>Julie Beaudeneau · Céline Lachkar</p><a class="enter" id="start-print" href="${url('fleur')}">${story[locale].start}${arrow}</a><p class="print-intro">${journey[locale].duration}</p></div></main>${footer(t)}</div>`;
  }else if(scene==='fleur'){
    app.innerHTML=`<div class="shell print-shell">${header(t)}${printingMarkup(locale,state,url,arrow)}${footer(t)}</div>`;
  }
  if(!['jardin','fleur'].includes(scene)){app.innerHTML=`<div class="shell extended-shell ${scene}-shell">${header(t)}${scene==='regarder'?lookingMarkup(locale,url,arrow):['creatrices','atelier','souvenir'].includes(scene)?storyMarkup(scene,phase,locale,state,url,arrow):stageMarkup(scene,phase,locale,state,url,arrow)}${footer(t)}</div>`;garden=scene==='regarder'?bindLooking(locale):['creatrices','atelier','souvenir'].includes(scene)?bindStory(scene,locale,state,save):bindStage(scene,phase,locale,state,save);}else if(scene==='fleur')garden=bindPrinting(locale,state,save);else garden=new Garden(document.querySelector('canvas'),{scene,paused:state.paused,bloom:scene==='fleur'&&phase>0?1:0,repeated:false,palette:state.palette,spacing:state.spacing});
  bind();if(focus)document.querySelector('h1').focus({preventScroll:true});
}
function bind(){
  document.querySelector('#start-print')?.addEventListener('click',e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    state.motifs=[];state.visitedCreators=[];state.lastCreator=1;state.ground=0;state.bloom=false;state.repeated=false;state.edited=false;save();
  });
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{locale=b.dataset.language;history.replaceState(null,'',url(scene,locale,phase));render(false);}));
  document.querySelector('#motion').addEventListener('click',()=>{state.paused=!state.paused;document.body.classList.toggle('paused',state.paused);garden.set({paused:state.paused});const b=document.querySelector('#motion'),t=copy[locale];b.innerHTML=icon(state.paused?'play':'pause');b.setAttribute('aria-pressed',state.paused);b.setAttribute('aria-label',state.paused?t.play:t.pause);b.title=state.paused?t.play:t.pause;});


}
function readRoute(){const match=location.hash.match(/^#\/(fr|de|en)\/(jardin|regarder|decouverte|fleur|tissu|choix|creatrices|retour|atelier|souvenir)(?:\/([0-3]))?$/);if(match){locale=match[1];scene=match[2];phase=Math.min(Number(match[3]||0),scene==='creatrices'?3:scene==='fleur'?2:0);}else{locale=['fr','de','en'].includes(new URLSearchParams(location.search).get('lang'))?new URLSearchParams(location.search).get('lang'):'fr';scene='jardin';phase=0;history.replaceState(null,'',url(scene));}}
function changeRoute(){clearTimeout(routeTimer);const oldScene=scene,oldLocale=locale;readRoute();if(state.paused){render(true);window.scrollTo(0,0);return;}document.querySelector('main')?.classList.add('camera-depart');let veil=document.createElement('div');veil.className='transition-veil wipe';document.body.append(veil);routeTimer=setTimeout(()=>{render(true);window.scrollTo(0,0);},250);setTimeout(()=>veil.remove(),740);}
window.addEventListener('hashchange',changeRoute);reduced.addEventListener('change',e=>{state.paused=e.matches;render(false);});
document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();const main=document.querySelector('#main');main.tabIndex=-1;main.focus();main.scrollIntoView({behavior:'instant'});});
readRoute();render();
