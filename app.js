/* Schatzsuche – NotePlan HTML sidebar plugin. https://github.com/joergoyen/noteplan-schatzsuche-plugin
   Searches NotePlan via DataStore.search and filters the hits here.
   Optional: Raindrop.io bookmarks (read only, own token in the plugin settings). MIT License. */
'use strict';
const $=s=>document.querySelector(s);
const q=$('#q');
let ready=false,sortDate=false,seq=0,lastQuery='',sel=-1;
const SETTINGS={language:'auto',treasureTag:'#schatz',raindropToken:''};

/* ---------- small helpers ---------- */
const store={get(k,d){try{const v=localStorage.getItem('schatzsuche.'+k);return v==null?d:v}catch(e){return d}},
  set(k,v){try{localStorage.setItem('schatzsuche.'+k,v)}catch(e){/* some web views disable storage */}}};
const LOG=(...a)=>{try{console.log('Schatzsuche:',...a)}catch(e){}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s??'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase();
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const toks=s=>s.match(/-?(?:\w+:)?"[^"]*"|\S+/g)||[];
const get=async(o,k)=>{try{return await o[k]}catch(e){return undefined}};
const iso=d=>d.toISOString().slice(0,10);
const cut=(t,n)=>n&&t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+' …':t;

/* ---------- language ---------- */
const I18N={
en:{
 'ph.search':'Search your treasures … (Enter)',
 'r.word':'Whole word','t.word':'Turn the last search word into an exact whole word',
 'r.notes':'Notes only','t.notes':'Only project notes',
 'r.journal':'Journal 30 days','t.journal':'Calendar notes of the last 30 days',
 'r.notask':'No tasks','t.notask':'Only text lines, no tasks',
 'r.heading':'Under heading …','t.heading':'Then type the name of the heading',
 'r.archive':'Include archive','t.archive':'Also search archive, trash and templates',
 'r.tag':'TAG','t.tag':'Everything marked with your treasure tag (see settings)',
 'r.tagyear':'TAG this year','t.tagyear':'Your treasure tag since 1 January',
 'r.open':'Open tasks','t.open':'Open tasks and checklist items',
 'r.done':'Done 30 days','t.done':'Completed tasks of the last 30 days',
 'r.newest':'Newest first','t.newest':'Sort by last change instead of number of hits',
 'r.rd':'Raindrop','t.rd':'Search your Raindrop.io bookmarks (full text with Raindrop Pro)',
 'r.fav':'♥ Favourites','t.fav':'Only Raindrop favourites',
 'h.title':'Search syntax',
 'h.rd':'Enter your own Raindrop test token in NotePlan: Settings › Plugins › Schatzsuche (gear). The token is only read, never shown or logged.',
 'v.text':'Text:','v.short':'Short','v.shorttip':'1 line, shortened','v.medium':'Medium','v.mediumtip':'2 lines, shortened','v.full':'Full','v.fulltip':'up to 4 lines, not shortened',
 'v.img':'Images','v.imgtip':'Cover images of Raindrop bookmarks',
 'k.show':'View and save …','k.clear':'Empty','k.target':'Save to:','k.new':'New note','k.today':"Today's note",'k.clip':'Clipboard',
 'k.title':'Title:','k.folder':'Folder:','k.md':'Markdown (editable)','k.refresh':'rebuild','k.refreshtip':'Rebuild from the box, e.g. after changing the text amount',
 'k.close':'Close','k.save':'Save','k.top':'Notes (top level)','k.deftitle':'Finds',
 'k.count':n=>n===1?'1 treasure in the box':n+' treasures in the box',
 'k.saving':'Saving …','k.okclip':'✓ copied to the clipboard','k.oktoday':"✓ appended to today's note",'k.oknew':t=>'✓ new note «'+t+'» created',
 'k.pick':'Put into the treasure box (Schatzkiste)',
 's.wait':'Waiting for NotePlan …','s.ready':'Ready. Type a search word and press Enter. ↑↓ to move, Enter to open.',
 's.bridge':'NotePlan did not answer. Close and reopen the sidebar view.',
 's.searching':'Searching …','s.enter':'Please type a search word.',
 's.count':(n,more,ms)=>n+' result'+(n===1?'':'s')+(more?' – showing the first 60':'')+' · '+ms+' ms',
 's.onlycal':' · without a search word: calendar notes only',
 's.rdnotoken':' · Raindrop: no token','s.rdno':' · Raindrop: is:/heading:/folder: do not exist there',
 's.rdof':(a,b)=>' · Raindrop: '+a+' of '+b,'s.remself':n=>' · reminders filtered here (checked the newest '+n+' bookmarks)',
 'rd.ok':'✓ connected','rd.none':'no token – see below',
 'm.daily':'Calendar note','m.lines':n=>n+' line'+(n===1?'':'s'),'m.more':n=>'… '+n+' more','m.trash':'trash',
 'o.note':'Open · ⌥ split view · ⌘ new window','o.web':'Open the web page','o.edit':'Open and edit the bookmark in Raindrop','o.editlbl':'✎ Raindrop',
 'md.notes':'NotePlan','md.daily':'Calendar note','md.search':'Search','md.edit':'✎ edit',
 syntax:[
  ['kunde angebot','all words in one line'],['"word"','exact whole word or phrase'],['pos*e  poli?e','wildcards: * any characters, ? one character'],
  ['-draft  -#tag','exclude'],['#tag  @person','tag, mention'],
  ['in:notes  in:calendar  in:archive','where to search'],['folder:Clients','folder (part of the name)'],
  ['is:open  is:done  is:task  is:not-task','line type'],['heading:Ideas','below a matching heading'],
  ['since:14d  since:week  since:month  since:year  since:2026-09-01','date of the calendar note or last change'],
  ['in:raindrop  link:example.com  type:article  important:true','Raindrop bookmarks (only with «in:raindrop»)'],
  ['Click on a title','opens the note · ⌥ split view · ⌘ new window · ↑↓ + Enter']]
},
de:{
 'ph.search':'Schatz suchen … (Enter)',
 'r.word':'Ganzes Wort','t.word':'Letztes Suchwort als ganzes Wort',
 'r.notes':'Nur Notizen','t.notes':'Nur Projektnotizen',
 'r.journal':'Tagebuch 30 Tage','t.journal':'Tagesnotizen der letzten 30 Tage',
 'r.notask':'Ohne Aufgaben','t.notask':'Nur Textzeilen, keine Aufgaben',
 'r.heading':'Unter Überschrift …','t.heading':'Danach den Namen der Überschrift tippen',
 'r.archive':'Mit Archiv','t.archive':'Archiv, Papierkorb und Vorlagen einschließen',
 'r.tag':'TAG','t.tag':'Alles mit deinem Schatz-Tag (siehe Einstellungen)',
 'r.tagyear':'TAG dieses Jahr','t.tagyear':'Dein Schatz-Tag seit dem 1. Januar',
 'r.open':'Offene Aufgaben','t.open':'Offene Aufgaben und Checklisten',
 'r.done':'Erledigt 30 Tage','t.done':'Erledigte Aufgaben, letzte 30 Tage',
 'r.newest':'Neueste zuerst','t.newest':'Nach letzter Änderung statt nach Trefferzahl sortieren',
 'r.rd':'Raindrop','t.rd':'Lesezeichen in Raindrop.io durchsuchen (Volltext mit Raindrop Pro)',
 'r.fav':'♥ Favoriten','t.fav':'Nur Raindrop-Favoriten',
 'h.title':'Suchsyntax',
 'h.rd':'Eigenen Raindrop-Test-Token in NotePlan eintragen: Settings › Plugins › Schatzsuche (Zahnrad). Der Token wird nur gelesen, nie angezeigt oder protokolliert.',
 'v.text':'Text:','v.short':'Kurz','v.shorttip':'1 Zeile, gekürzt','v.medium':'Mittel','v.mediumtip':'2 Zeilen, gekürzt','v.full':'Voll','v.fulltip':'bis 4 Zeilen, ungekürzt',
 'v.img':'Bilder','v.imgtip':'Vorschaubilder der Raindrop-Lesezeichen',
 'k.show':'Ansehen und speichern …','k.clear':'Leeren','k.target':'Ziel:','k.new':'Neue Notiz','k.today':'Heutige Tagesnotiz','k.clip':'Zwischenablage',
 'k.title':'Titel:','k.folder':'Ordner:','k.md':'Markdown (bearbeitbar)','k.refresh':'neu erzeugen','k.refreshtip':'Aus der Kiste neu erzeugen, z. B. nach Wechsel der Textmenge',
 'k.close':'Schließen','k.save':'Speichern','k.top':'Notes (oberste Ebene)','k.deftitle':'Fundstücke',
 'k.count':n=>n===1?'1 Schatz in der Kiste':n+' Schätze in der Kiste',
 'k.saving':'Speichere …','k.okclip':'✓ in der Zwischenablage','k.oktoday':'✓ an die heutige Tagesnotiz angehängt','k.oknew':t=>'✓ neue Notiz «'+t+'» angelegt',
 'k.pick':'In die Schatzkiste legen',
 's.wait':'Warte auf NotePlan …','s.ready':'Bereit. Suchwort eingeben und Enter drücken. ↑↓ wählen, Enter öffnen.',
 's.bridge':'NotePlan antwortet nicht. Ansicht schließen und neu öffnen.',
 's.searching':'Suche …','s.enter':'Bitte ein Suchwort eingeben.',
 's.count':(n,more,ms)=>n+' Treffer'+(more?' – die ersten 60':'')+' · '+ms+' ms',
 's.onlycal':' · ohne Suchwort: nur Tagesnotizen',
 's.rdnotoken':' · Raindrop: kein Token','s.rdno':' · Raindrop: is:/heading:/folder: gibt es dort nicht',
 's.rdof':(a,b)=>' · Raindrop: '+a+' von '+b,'s.remself':n=>' · Wiedervorlage hier gefiltert (geprüft: '+n+' neueste Lesezeichen)',
 'rd.ok':'✓ verbunden','rd.none':'kein Token – siehe unten',
 'm.daily':'Tagesnotiz','m.lines':n=>n+' Zeile'+(n===1?'':'n'),'m.more':n=>'… '+n+' weitere','m.trash':'Papierkorb',
 'o.note':'Öffnen · ⌥ Split View · ⌘ neues Fenster','o.web':'Webseite öffnen','o.edit':'Lesezeichen in Raindrop öffnen und bearbeiten','o.editlbl':'✎ Raindrop',
 'md.notes':'NotePlan','md.daily':'Tagesnotiz','md.search':'Suche','md.edit':'✎ bearbeiten',
 syntax:[
  ['kunde angebot','alle Wörter in einer Zeile'],['"wort"','ganzes Wort oder Phrase'],['pos*e  poli?e','Platzhalter: * beliebig viele Zeichen, ? ein Zeichen'],
  ['-entwurf  -#tag','ausschließen'],['#tag  @person','Tag, Erwähnung'],
  ['in:notizen  in:kalender  in:archiv','Bereich (auch englisch: in:notes …)'],['ordner:Kunden','Ordner (Teilname)'],
  ['ist:offen  ist:erledigt  ist:aufgabe  ist:keine-aufgabe','Zeilenart (auch is:open …)'],['überschrift:Ideen','unter passender Überschrift'],
  ['seit:14d  seit:woche  seit:monat  seit:jahr  seit:2026-09-01','Datum der Tagesnotiz bzw. letzte Änderung'],
  ['in:raindrop  link:beispiel.de  type:article  important:true','Raindrop-Lesezeichen (nur mit «in:raindrop»)'],
  ['Klick auf Titel','öffnet die Notiz · ⌥ Split View · ⌘ neues Fenster · ↑↓ + Enter']]
}};
let LANG='en';
const T=(k,...a)=>{const v=(I18N[LANG]&&I18N[LANG][k])??I18N.en[k];return typeof v==='function'?v(...a):(v??k)};
function pickLang(setting){
  const s=String(setting||'auto').toLowerCase();
  if(s.startsWith('de'))return 'de';
  if(s.startsWith('en'))return 'en';
  return String(navigator.language||'en').toLowerCase().startsWith('de')?'de':'en';
}
function applyLang(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=T(e.dataset.i18n).replace('TAG',SETTINGS.treasureTag)});
  document.querySelectorAll('[data-i18n-tip]').forEach(e=>{e.title=T(e.dataset.i18nTip)});
  document.querySelectorAll('[data-i18n-ph]').forEach(e=>{e.placeholder=T(e.dataset.i18nPh)});
  q.setAttribute('aria-label',T('ph.search'));
  $('#syntax').innerHTML=T('syntax').map(([c,d])=>'<tr'+(c.startsWith('in:raindrop')?' class="rd-only"':'')+'><td>'+c.split(/\s{2,}/).map(x=>'<code>'+esc(x)+'</code>').join(' ')+'</td><td>'+esc(d)+'</td></tr>').join('');
  kBar();
}

/* ---------- NotePlan theme (after the bridge is ready) ---------- */
function hexRgb(h){h=String(h||'').replace(/^#/,'');if(h.length===8)h=h.slice(2);if(h.length===3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function blend(a,b,t){const x=hexRgb(a),y=hexRgb(b);const m=k=>Math.round(x[k]+(y[k]-x[k])*t);return '#'+((1<<24)+(m('r')<<16)+(m('g')<<8)+m('b')).toString(16).slice(1)}
async function applyTheme(){
  try{
    if(typeof Editor==='undefined')return;
    const th=await Editor.currentTheme;if(!th)return;
    const v=th.values||th,ed=v.editor;if(!ed||!ed.backgroundColor||!ed.textColor)return;
    const dark=v.style==='Dark'||th.mode==='dark',bg=ed.backgroundColor,fg=ed.textColor,other=dark?'#ffffff':'#000000';
    const vars={'--bg':bg,'--fg':fg,'--card':ed.altBackgroundColor||blend(bg,other,.04),'--line':blend(bg,other,dark?.14:.1),'--muted':blend(fg,bg,.45)};
    if(ed.tintColor)vars['--accent']=ed.tintColor;
    for(const k in vars)document.documentElement.style.setProperty(k,vars[k].length===9?'#'+vars[k].slice(3):vars[k]);
    LOG('theme',v.name||th.name||'',dark?'dark':'light');
  }catch(e){LOG('theme not available',e.message)}
}

/* ---------- view settings ---------- */
const LEVELS={short:{n:1,chars:140},medium:{n:2,chars:280},full:{n:4,chars:0}};
const VIEW={text:'medium',img:true};
try{const v=JSON.parse(store.get('view','{}'));if(LEVELS[v.text])VIEW.text=v.text;if(typeof v.img==='boolean')VIEW.img=v.img}catch(e){}
const saveView=()=>store.set('view',JSON.stringify(VIEW));

/* ---------- query parsing (German and English keywords) ---------- */
const TASK={open:['open','checklist'],done:['done','checklistDone'],scheduled:['scheduled','checklistScheduled'],cancelled:['cancelled','checklistCancelled']};
TASK.task=[].concat(TASK.open,TASK.done,TASK.scheduled,TASK.cancelled);
const IS={offen:'open',open:'open',erledigt:'done',fertig:'done',done:'done',geplant:'scheduled',scheduled:'scheduled',
  abgebrochen:'cancelled',cancelled:'cancelled',aufgabe:'task',aufgaben:'task',task:'task',tasks:'task',
  'keine-aufgabe':'nottask','not-task':'nottask',notask:'nottask',text:'nottask'};
const IN={notizen:'Notes',notes:'Notes',projekte:'Notes',projects:'Notes',kalender:'Calendar',calendar:'Calendar',cal:'Calendar',daily:'Calendar',
  noteplan:'NP',np:'NP',raindrop:'Raindrop',rd:'Raindrop',archiv:'*',archive:'*',alle:'*',all:'*'};
const RD_OPS=['type','link','created','lastupdate','match','info','important','reminder'];
function relDate(v){
  v=v.toLowerCase();const t=new Date();t.setHours(12,0,0,0);
  if(v==='heute'||v==='today')return iso(t);
  if(v==='gestern'||v==='yesterday'){t.setDate(t.getDate()-1);return iso(t)}
  if(v==='woche'||v==='week'){t.setDate(t.getDate()-((t.getDay()+6)%7));return iso(t)}
  if(v==='monat'||v==='month'){t.setDate(1);return iso(t)}
  if(v==='jahr'||v==='year'){t.setMonth(0,1);return iso(t)}
  const m=v.match(/^(\d+)([dtwm])$/);
  if(m){t.setDate(t.getDate()-(+m[1])*({d:1,t:1,w:7,m:30}[m[2]]));return iso(t)}
  return /^\d{4}(-\d{2}){0,2}$/.test(v)?v:null;
}
function parse(str){
  const f={terms:[],neg:[],tags:[],ntags:[],kinds:new Set(),lines:new Set(),heads:[],folders:[],after:null,special:false,rdOps:[]};
  for(let t of toks(str)){
    if(t==='OR'||t==='ODER')continue;
    const neg=t.length>1&&t[0]==='-';if(neg)t=t.slice(1);
    if(t.length>1&&t[0]==='+')t=t.slice(1); /* +word = must (all words are required anyway) */
    const m=t.match(/^([\wüÜ]+):(.*)$/);
    if(m){
      const k=m[1].toLowerCase(),v=m[2].replace(/^"|"$/g,'');
      if(!v)continue;
      if(k==='in'){const x=IN[v.toLowerCase()];if(x==='*')f.special=true;else if(x==='NP'){f.kinds.add('Notes');f.kinds.add('Calendar')}else if(x)f.kinds.add(x);continue}
      if(k==='is'||k==='ist'){const x=IS[v.toLowerCase()];if(x)f.lines.add(x);continue}
      if(['heading','überschrift','ueberschrift'].includes(k)){f.heads.push(fold(v));continue}
      if(['folder','ordner'].includes(k)){f.folders.push(fold(v));continue}
      if(['seit','since','after','nach'].includes(k)){f.after=relDate(v);continue}
      if(k==='domain'){f.rdOps.push((neg?'-':'')+'link:'+v);continue} /* Raindrop has no domain: operator */
      if(RD_OPS.includes(k)){f.rdOps.push((neg?'-':'')+t);continue}
    }
    if((t[0]==='#'||t[0]==='@')&&t.length>1){(neg?f.ntags:f.tags).push(fold(t));continue}
    const exact=t.startsWith('"');const text=t.replace(/^"|"$/g,'').trim();
    if(!text)continue;
    (neg?f.neg:f.terms).push({text,exact,wild:!exact&&/[*?]/.test(text)});
  }
  return f;
}
const literal=t=>t.wild?fold(t.text).split(/[*?]+/).sort((a,b)=>b.length-a.length)[0]||'':fold(t.text);
function termRe(t){
  if(t.wild){const w=fold(t.text).split('').map(c=>c==='*'?'\\S*':c==='?'?'\\S':reEsc(c)).join('');return new RegExp(w,'u')}
  const w=reEsc(fold(t.text));
  return new RegExp(t.exact?'(^|[^\\p{L}\\p{N}_])'+w+'(?![\\p{L}\\p{N}_])':w,'u');
}
const tagRe=tag=>new RegExp('(^|[^\\p{L}\\p{N}_#@/])'+reEsc(tag)+'(?![\\p{L}\\p{N}_])','u');
function lineOk(p,f,R){
  const c=fold(p.content);
  if(!R.terms.every(r=>r.test(c)))return false;
  if(R.neg.some(r=>r.test(c)))return false;
  if(!R.tags.every(r=>r.test(c)))return false;
  if(R.ntags.some(r=>r.test(c)))return false;
  if(f.lines.size){
    const ty=p.type||'';let ok=false;
    for(const l of f.lines){
      if(l==='nottask'){if(!TASK.task.includes(ty)&&ty!=='empty'&&ty!=='title'&&String(p.content).trim())ok=true}
      else if(TASK[l].includes(ty))ok=true}
    if(!ok)return false}
  if(f.heads.length&&!f.heads.some(h=>fold(p.heading).includes(h)))return false;
  return true;
}
function hl(text,R){
  const s=esc(text),words=[...R.marks].filter(w=>w&&w.length>1).sort((a,b)=>b.length-a.length);
  if(!words.length)return s;
  const plain=String(text),fp=fold(plain);
  if(fp.length!==plain.length)return s; /* folding changed the length: do not risk wrong marks */
  const hits=[];for(const w of words){let i=0;while((i=fp.indexOf(w,i))>=0){hits.push([i,i+w.length]);i+=w.length}}
  if(!hits.length)return s;
  hits.sort((a,b)=>a[0]-b[0]);let out='',pos=0;
  for(const[a,b]of hits){if(a<pos)continue;out+=esc(plain.slice(pos,a))+'<mark>'+esc(plain.slice(a,b))+'</mark>';pos=b}
  return out+esc(plain.slice(pos));
}

/* ---------- NotePlan data ---------- */
const calDate=fn=>{const m=String(fn).match(/(\d{4})(\d{2})(\d{2})/);return m?`${m[1]}-${m[2]}-${m[3]}`:null};
const isSpecial=fn=>/^@(Archive|Trash|Templates)/.test(String(fn));
async function plainPara(p,note){
  const o={content:await get(p,'content'),type:await get(p,'type'),heading:await get(p,'heading'),
    lineIndex:await get(p,'lineIndex'),filename:await get(p,'filename'),noteType:await get(p,'noteType')};
  if(o.content==null)o.content='';
  if(note){o.filename=o.filename||note.filename;o.noteType=o.noteType||note.noteType}
  if(!o.heading)o.heading='';
  return o;
}
const noteCache=new Map();
async function noteInfo(filename,noteType){
  const key=noteType+'|'+filename;if(noteCache.has(key))return noteCache.get(key);
  const info={title:filename,changed:null};
  try{
    if(noteType==='Calendar'){info.title=calDate(filename)||filename;info.changed=calDate(filename)}
    else{const n=await DataStore.projectNoteByFilename(filename);
      if(n){info.title=(await get(n,'title'))||filename;const cd=await get(n,'changedDate');if(cd)info.changed=iso(new Date(cd))}}
  }catch(e){LOG('noteInfo',filename,e.message)}
  noteCache.set(key,info);return info;
}
async function scanCalendar(after,maxDays){
  const out=[],d=new Date();d.setHours(12,0,0,0);
  const stop=after?new Date(after+'T12:00:00'):new Date(d.getTime()-30*864e5);
  for(let i=0;i<maxDays&&d>=stop;i++,d.setDate(d.getDate()-1)){
    const ds=iso(d).replace(/-/g,'');
    try{const n=await DataStore.calendarNoteByDateString(ds);if(!n)continue;
      const paras=(await get(n,'paragraphs'))||[],fn=(await get(n,'filename'))||ds+'.md';
      for(const p of paras)out.push(await plainPara(p,{filename:fn,noteType:'Calendar'}))}
    catch(e){LOG('scan',ds,e.message)}
  }
  return out;
}

/* ---------- Raindrop.io (optional, read only) ---------- */
const RD_URL='https://api.raindrop.io/rest/v1';
const RD={token:null};
async function rdFetch(path){
  const r=await fetch(RD_URL+path,{headers:{'Authorization':'Bearer '+RD.token}});
  if(r.status===401)throw new Error('Raindrop token invalid (401)');
  if(!r.ok)throw new Error('Raindrop HTTP '+r.status);
  return r.json();
}
async function rdInit(){
  RD.token=String(SETTINGS.raindropToken||'').trim()||null;
  document.body.classList.toggle('has-rd',!!RD.token);
  if(!RD.token){$('#rdstat').textContent=T('rd.none');return}
  try{await rdFetch('/user');$('#rdstat').innerHTML='<span class="okc">'+esc(T('rd.ok'))+'</span>'}
  catch(e){$('#rdstat').innerHTML='<span class="err">✗ '+esc(e.message)+'</span>'}
}
function rdQuery(f){
  const parts=[];
  for(const t of f.terms)parts.push(t.exact?'"'+t.text+'"':t.text.replace(/[*?]/g,''));
  for(const t of f.neg)parts.push('-'+(/\s/.test(t.text)?'"'+t.text+'"':t.text));
  for(const t of f.tags)if(t[0]==='#')parts.push(t);
  for(const t of f.ntags)if(t[0]==='#')parts.push('-'+t);
  if(f.after){const d=new Date(f.after+'T12:00:00');d.setDate(d.getDate()-1);parts.push('created:>'+iso(d))}
  return parts.concat(f.rdOps).join(' ').trim();
}
const rdEditUrl=g=>'https://app.raindrop.io/my/'+encodeURIComponent(g.collection??0)+'/item/'+encodeURIComponent(g.filename)+'/edit';
const stripTags=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function rdItem(x){
  const lines=[],hb=stripTags(x.highlight&&x.highlight.body);
  if(hb)lines.push({content:hb,heading:''});
  if(x.excerpt&&stripTags(x.excerpt)!==hb)lines.push({content:stripTags(x.excerpt),heading:''});
  if(x.note)lines.push({content:stripTags(x.note),heading:''});
  if((x.tags||[]).length)lines.push({content:x.tags.map(t=>'#'+t).join(' '),heading:''});
  const rem=x.reminder&&x.reminder.date?iso(new Date(x.reminder.date)):'';
  return {filename:String(x._id),collection:(x.collection&&x.collection.$id)!=null?x.collection.$id:0,noteType:'Raindrop',
    title:x.title||x.link,link:x.link,domain:x.domain||'',cover:x.cover||'',important:!!x.important,reminder:rem,
    changed:x.created?iso(new Date(x.created)):null,lines};
}
async function rdPage(qs,page,sort){
  const p=new URLSearchParams({perpage:'50',page:String(page),sort:sort||(qs?'score':'-created')});
  if(qs)p.set('search',qs);
  return rdFetch('/raindrops/0?'+p.toString().replace(/\+/g,'%20'));
}
async function rdSearch(f){
  if(f.lines.size||f.heads.length||f.folders.length)return {groups:[],note:T('s.rdno')};
  const wantRem=f.rdOps.includes('reminder:true'),qs=rdQuery(f);
  const d=await rdPage(qs,0);
  let items=d.items||[],count=d.count||0,how='';
  if(wantRem&&!items.length){ /* Raindrop may not know reminder:true – filter the newest 200 here */
    const qs2=rdQuery({...f,rdOps:f.rdOps.filter(o=>o!=='reminder:true')});items=[];
    for(let p=0;p<4;p++){const dd=await rdPage(qs2,p,'-created');items=items.concat(dd.items||[]);if(!(dd.items||[]).length||items.length>=(dd.count||0))break}
    const scanned=items.length;items=items.filter(x=>x.reminder&&x.reminder.date);count=items.length;how=T('s.remself',scanned);
  }
  let groups=items.map(rdItem);
  if(wantRem)groups=groups.filter(g=>g.reminder).sort((a,b)=>a.reminder.localeCompare(b.reminder));
  return {groups,note:(count>groups.length?T('s.rdof',groups.length,count):'')+how,keepOrder:wantRem};
}

/* ---------- search ---------- */
async function search(){
  const v=q.value.trim(),my=++seq;
  if(!ready){$('#status').textContent=T('s.wait');return}
  lastQuery=v;sel=-1;
  if(!v){$('#results').innerHTML='';$('#status').textContent='';return}
  const t0=Date.now(),f=parse(v);
  const R={terms:f.terms.map(termRe),neg:f.neg.map(termRe),tags:f.tags.map(tagRe),ntags:f.ntags.map(tagRe),
    marks:new Set([...f.terms.map(literal),...f.tags])};
  const key=[...f.terms].map(literal).filter(x=>x.length>1).sort((a,b)=>b.length-a.length)[0]||f.tags[0];
  $('#status').textContent=T('s.searching');
  let paras=[],note='',extra='',rdGroups=[];
  const npKinds=[...f.kinds].filter(k=>k==='Notes'||k==='Calendar');
  if(f.kinds.has('Raindrop')){
    if(!RD.token)extra+=T('s.rdnotoken');
    else{try{const r=await rdSearch(f);rdGroups=r.groups;extra+=r.note;if(r.keepOrder)rdGroups.forEach((g,i)=>g._ord=i)}catch(e){extra+=' · Raindrop: '+e.message}}
    if(my!==seq)return;
  }
  const wantNP=!f.kinds.size||npKinds.length>0;
  try{
    if(!wantNP){/* Raindrop only */}
    else if(key){
      const types=npKinds.length?npKinds.map(k=>k==='Calendar'?'calendar':'notes'):['notes','calendar'];
      const res=(await DataStore.search(key,types,[],f.special?[]:['@Archive','@Trash','@Templates']))||[];
      for(const p of res)paras.push(await plainPara(p));
    }else if(f.after||f.lines.size||f.heads.length){paras=await scanCalendar(f.after,f.after?400:30);note=T('s.onlycal')}
    else if(!f.kinds.has('Raindrop')){$('#status').textContent=T('s.enter');$('#results').innerHTML='';return}
  }catch(e){LOG('error',e);if(my===seq)$('#status').innerHTML='<span class="err">✗ '+esc(e.message||e)+'</span>';return}
  if(my!==seq)return;
  const groups=new Map();
  for(const p of paras){
    if(!p.filename)continue;
    if(f.kinds.size&&!f.kinds.has(p.noteType))continue;
    if(!f.special&&isSpecial(p.filename))continue;
    if(f.folders.length&&!f.folders.some(x=>fold(p.filename).includes(x)))continue;
    if(!lineOk(p,f,R))continue;
    const k=p.noteType+'|'+p.filename;
    if(!groups.has(k))groups.set(k,{filename:p.filename,noteType:p.noteType,lines:[],seen:new Set()});
    const g=groups.get(k);if(!g.seen.has(p.lineIndex)){g.seen.add(p.lineIndex);g.lines.push(p)}
  }
  let list=[...groups.values()];
  for(const g of list){const i=await noteInfo(g.filename,g.noteType);g.title=i.title;g.changed=i.changed}
  list=list.concat(rdGroups);
  if(my!==seq)return;
  if(f.after)list=list.filter(g=>g.changed&&g.changed>=f.after);
  if(list.length&&list.every(g=>g._ord!=null))list.sort((a,b)=>a._ord-b._ord);
  else list.sort(sortDate?(a,b)=>String(b.changed).localeCompare(String(a.changed)):(a,b)=>b.lines.length-a.lines.length||String(b.changed).localeCompare(String(a.changed)));
  const shown=list.slice(0,60);
  $('#status').textContent=T('s.count',list.length,list.length>60,Date.now()-t0)+note+extra;
  render(shown,R,v);
}
function render(shown,R,v){
  const LV=LEVELS[VIEW.text];
  $('#results').className='view-'+VIEW.text;
  $('#results').innerHTML=shown.map((g,i)=>{
    const rd=g.noteType==='Raindrop';
    const title=rd
      ?`<div class="rdt"><a class="t" href="${esc(g.link)}" title="${esc(T('o.web'))}">${esc(g.title)}</a><a class="rdalt" href="${esc(rdEditUrl(g))}" title="${esc(T('o.edit'))}">${esc(T('o.editlbl'))}</a></div>`
      :`<a class="t" href="#" title="${esc(T('o.note'))}">${esc(g.title)}</a>`;
    const meta=rd
      ?'<span class="src rd">Raindrop</span>'+(g.important?'<span class="fav">♥</span>':'')+(g.reminder?'<span class="rem'+(g.reminder<=iso(new Date())?' due':'')+'">🔔 '+esc(g.reminder)+'</span>':'')+esc(g.domain)
      :g.noteType==='Calendar'?esc(T('m.daily')):esc(g.filename.split('/').slice(0,-1).join('/')||'Notes');
    return `<div class="res${KISTE.has(kKey(g))?' picked':''}" data-i="${i}" role="option" aria-selected="false">
    ${VIEW.img&&g.cover&&/^https:\/\//.test(g.cover)?`<img class="cov" src="${esc(g.cover)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}
    ${title}
    <div class="meta"><input type="checkbox" class="pk" title="${esc(T('k.pick'))}" aria-label="${esc(T('k.pick'))}"${KISTE.has(kKey(g))?' checked':''}>${meta}${g.changed?' · '+esc(g.changed):''} · ${esc(T('m.lines',g.lines.length))}</div>
    ${g.lines.slice(0,LV.n).map(l=>`<div class="ln">${l.heading&&fold(l.heading)!==fold(g.title)?'<span class="h">'+esc(l.heading)+' › </span>':''}${hl(cut(String(l.content).trim(),LV.chars),R)}</div>`).join('')}
    ${g.lines.length>LV.n?`<div class="meta">${esc(T('m.more',g.lines.length-LV.n))}</div>`:''}</div>`}).join('');
  $('#results')._q=v;$('#results')._data=shown;
}

/* ---------- open ---------- */
function npUrl(g,mods){
  let url='noteplan://x-callback-url/openNote?'+(g.noteType==='Calendar'
    ?'noteDate='+encodeURIComponent(String(g.filename).replace(/\.\w+$/,''))
    :'filename='+encodeURIComponent(g.filename));
  if(mods.meta)url+='&subWindow=yes';
  else if(mods.alt)url+='&splitView=yes&reuseSplitView=yes';
  return url;
}
async function openHit(g,mods,which){
  try{
    if(g.noteType==='Raindrop')await NotePlan.openURL(which==='edit'?rdEditUrl(g):g.link);
    else await NotePlan.openURL(npUrl(g,mods));
  }catch(e){$('#status').innerHTML='<span class="err">✗ '+esc(e.message||e)+'</span>'}
}
$('#results').addEventListener('click',e=>{
  const card=e.target.closest('.res');if(!card)return;
  const g=$('#results')._data[+card.dataset.i];if(!g)return;
  if(e.target.classList.contains('pk')){kToggle(g,e.target.checked);card.classList.toggle('picked',e.target.checked);return}
  const a=e.target.closest('a');if(!a)return;
  e.preventDefault();
  openHit(g,{alt:e.altKey,meta:e.metaKey},a.classList.contains('rdalt')?'edit':'');
});
function setSel(i){
  const cards=[...document.querySelectorAll('#results .res')];if(!cards.length)return;
  sel=Math.max(0,Math.min(cards.length-1,i));
  cards.forEach((c,k)=>{c.classList.toggle('sel',k===sel);c.setAttribute('aria-selected',String(k===sel))});
  cards[sel].scrollIntoView({block:'nearest'});
}
q.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();setSel(sel+1);return}
  if(e.key==='ArrowUp'){e.preventDefault();if(sel>0)setSel(sel-1);return}
  if(e.key==='Enter'){
    e.preventDefault();
    const g=($('#results')._data||[])[sel];
    if(sel>=0&&g&&q.value.trim()===lastQuery)openHit(g,{alt:e.altKey,meta:e.metaKey});
    else search();
    return}
  if(e.key==='Escape'){q.value='';recipeState();search()}
});
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='f'){e.preventDefault();q.focus();q.select()}
  if(e.key==='Escape'&&!$('#kdlg').hidden){$('#kdlg').hidden=true;q.focus()}
});

/* ---------- quick-search buttons ---------- */
function recipeState(){
  const have=toks(q.value);
  document.querySelectorAll('#recipes button').forEach(b=>{
    if(b.dataset.act==='quote')return;
    if(b.dataset.wait)b.classList.toggle('on',have.some(t=>t.startsWith('heading:')));
    else if(b.dataset.add)b.classList.toggle('on',toks(b.dataset.add).every(t=>have.includes(t)));
  });
  $('#recipes [data-act=newest]').classList.toggle('on',sortDate);
}
$('#recipes').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.act==='newest'){sortDate=!sortDate;recipeState();search();q.focus();return}
  let t=toks(q.value);
  if(b.dataset.act==='quote'){for(let i=t.length-1;i>=0;i--){if(!/^[-#@"+]|^\w+:/.test(t[i])&&t[i]!=='OR'){t[i]='"'+t[i]+'"';break}}}
  else if(b.dataset.wait){
    if(b.classList.contains('on'))t=t.filter(x=>!x.startsWith('heading:'));
    else{q.value=(t.join(' ')+' heading:').trimStart();recipeState();q.focus();return}
  }else{
    const add=toks(b.dataset.add);
    if(b.classList.contains('on'))t=t.filter(x=>!add.includes(x));
    else add.forEach(a=>{if(a.startsWith('since:'))t=t.filter(x=>!/^(since|seit):/.test(x));if(!t.includes(a))t.push(a)});
  }
  q.value=t.join(' ')+(t.length?' ':'');recipeState();q.focus();search();
};
q.addEventListener('input',recipeState);
function viewState(){
  document.querySelectorAll('#view [data-text]').forEach(b=>b.classList.toggle('on',b.dataset.text===VIEW.text));
  $('#view [data-img]').classList.toggle('on',VIEW.img);
}
$('#view').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.text)VIEW.text=b.dataset.text;
  if(b.dataset.img)VIEW.img=!VIEW.img;
  saveView();viewState();if(q.value.trim())search();
};

/* ---------- Schatzkiste: collect results, save as Markdown ---------- */
const KISTE=new Map();
const kKey=g=>g.noteType+'|'+g.filename;
function kToggle(g,on){
  if(on)KISTE.set(kKey(g),{noteType:g.noteType,filename:g.filename,title:g.title,link:g.link||'',domain:g.domain||'',
    changed:g.changed||'',collection:g.collection,important:!!g.important,reminder:g.reminder||'',
    lines:g.lines.map(l=>String(l.content).trim()).filter(Boolean),query:($('#results')._q||'').trim()});
  else KISTE.delete(kKey(g));
  kBar();
}
function kBar(){$('#kiste').hidden=!KISTE.size;$('#kn').textContent=T('k.count',KISTE.size)}
const tagSafe=t=>t.replace(/(^|[\s(\[])([#@][^\s#@,;:!?()\[\]]+)/g,'$1`$2`'); /* keep the box from becoming a tag hit itself */
const today=()=>LANG==='de'?new Date().toLocaleDateString('de-DE'):iso(new Date());
function kMarkdown(){
  const LV=LEVELS[VIEW.text],out=[];
  for(const it of KISTE.values()){
    let head,meta;
    if(it.noteType==='Raindrop'){
      head=`### [${it.title.replace(/[\[\]]/g,'')}](${it.link})`;
      meta=`*Raindrop${it.important?' · ♥':''}${it.reminder?' · 🔔 '+it.reminder:''} · ${it.domain} · [${T('md.edit')}](${rdEditUrl(it)})*`;
    }else if(it.noteType==='Calendar'){head=`### [[${calDate(it.filename)||it.title}]]`;meta='*'+T('md.daily')+'*'}
    else{head=`### [[${it.title}]]`;meta='*'+T('md.notes')+'*'}
    if(it.query)meta+=` · *${T('md.search')}* \`${it.query.replace(/`/g,'')}\``;
    out.push(head,meta,'');
    for(const l of it.lines.slice(0,LV.n))out.push('> '+tagSafe(cut(l,LV.chars)));
    out.push('');
  }
  return out.join('\n').trim()+'\n';
}
async function kOpen(){
  $('#ktitle').value=$('#ktitle').value||(T('k.deftitle')+' '+today());
  $('#kmd').value=kMarkdown();$('#kmsg').textContent='';
  try{
    const fs=(await get(DataStore,'folders'))||[],last=store.get('kfolder','');
    $('#kfolder').innerHTML='<option value="">'+esc(T('k.top'))+'</option>'+fs.filter(f=>f&&f!=='/'&&!/^@/.test(f))
      .map(f=>`<option${f===last?' selected':''}>${esc(f)}</option>`).join('');
  }catch(e){LOG('folders',e.message)}
  kTarget();$('#kdlg').hidden=false;$('#ktitle').focus();
}
function kTarget(){$('#knew').hidden=document.querySelector('input[name=kziel]:checked').value!=='new'}
async function kSave(){
  const t=document.querySelector('input[name=kziel]:checked').value,title=$('#ktitle').value.trim()||(T('k.deftitle')+' '+today()),body=$('#kmd').value.trim();
  $('#kgo').disabled=true;$('#kmsg').textContent=T('k.saving');
  try{
    if(t==='clip'){await Clipboard.setString('## '+title+'\n\n'+body+'\n');$('#kmsg').innerHTML='<span class="okc">'+esc(T('k.okclip'))+'</span>'}
    else if(t==='today'){
      await NotePlan.openURL('noteplan://x-callback-url/addText?noteDate=today&mode=append&openNote=no&text='+encodeURIComponent('\n## '+title+'\n\n'+body+'\n'));
      $('#kmsg').innerHTML='<span class="okc">'+esc(T('k.oktoday'))+'</span>';
    }else{
      const folder=$('#kfolder').value;store.set('kfolder',folder);
      let fn=null;
      try{fn=await DataStore.newNoteWithContent('# '+title+'\n\n'+body+'\n',folder||'/')}catch(e){LOG('newNote',e.message)}
      if(fn)await NotePlan.openURL('noteplan://x-callback-url/openNote?filename='+encodeURIComponent(fn));
      else await NotePlan.openURL('noteplan://x-callback-url/addNote?openNote=yes&noteTitle='+encodeURIComponent(title)+(folder?'&folder='+encodeURIComponent(folder):'')+'&noteText='+encodeURIComponent(body+'\n'));
      $('#kmsg').innerHTML='<span class="okc">'+esc(T('k.oknew',title))+'</span>';
    }
  }catch(e){$('#kmsg').innerHTML='<span class="err">✗ '+esc(e.message||e)+'</span>'}
  $('#kgo').disabled=false;
}
$('#kshow').onclick=kOpen;
$('#kclear').onclick=()=>{KISTE.clear();kBar();document.querySelectorAll('.pk').forEach(c=>{c.checked=false;c.closest('.res').classList.remove('picked')})};
$('#kclose').onclick=()=>{$('#kdlg').hidden=true;q.focus()};
$('#kgo').onclick=kSave;
document.querySelectorAll('input[name=kziel]').forEach(r=>r.onchange=kTarget);
$('#krefresh').onclick=()=>{$('#kmd').value=kMarkdown()};

/* ---------- start ---------- */
function setTag(tag){
  tag=String(tag||'#schatz').trim();if(!/^[#@]/.test(tag))tag='#'+tag;
  SETTINGS.treasureTag=tag;
  document.querySelectorAll('#recipes [data-add*="@TAG"],#recipes [data-tagtpl]').forEach(b=>{
    if(!b.dataset.tagtpl)b.dataset.tagtpl=b.dataset.add;
    b.dataset.add=b.dataset.tagtpl.replace('@TAG',tag);
  });
}
/* Settings: DataStore.settings first. In the web view it can come back empty,
   so fall back to the plugin's own settings.json (data/<plugin id>/settings.json).
   Only key names are logged, never values. */
async function readSettings(){
  let st={};
  try{const s=await DataStore.settings;if(s&&typeof s==='object')st={...s}}catch(e){LOG('settings',e.message)}
  if(!st.raindropToken&&!st.treasureTag&&!st.language){
    try{const j=await DataStore.loadJSON('settings.json');if(j&&typeof j==='object')st={...j,...st}}catch(e){LOG('loadJSON',e.message)}
  }
  try{LOG('settings keys: '+Object.keys(st).join(', '))}catch(e){}
  return st;
}
async function init(){
  if(ready)return;
  if(typeof DataStore==='undefined')return;
  ready=true;
  const st=await readSettings();
  if(st.language)SETTINGS.language=st.language;
  if(st.treasureTag)SETTINGS.treasureTag=st.treasureTag;
  SETTINGS.raindropToken=st.raindropToken||'';
  LANG=pickLang(SETTINGS.language);store.set('lang',LANG);
  setTag(SETTINGS.treasureTag);applyLang();applyTheme();
  $('#status').textContent=T('s.ready');
  recipeState();viewState();q.focus();
  rdInit();
}
/* first paint with the last known language, before NotePlan answers */
LANG=store.get('lang',pickLang('auto'));setTag(SETTINGS.treasureTag);applyLang();viewState();
$('#status').textContent=T('s.wait');
window.addEventListener('notePlanBridgeReady',init,{once:true});
window.addEventListener('onViewDidAppear',()=>q.focus());
setTimeout(init,800);
setTimeout(()=>{if(!ready)$('#status').innerHTML='<span class="err">'+esc(T('s.bridge'))+'</span>'},4000);
