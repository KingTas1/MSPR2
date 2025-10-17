const API_BASE = '/api/appointments';

// ---------- Utils dates ----------
const fmtMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const fmtDayNum = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
const fmtDowShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day:'2-digit', month:'2-digit' });
const fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute:'2-digit' });

const MS = 24*60*60*1000;

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function startOfWeek(d){
  const day = (d.getDay() || 7);
  const diff = day - 1;
  const sd = new Date(d);
  sd.setDate(d.getDate() - diff);
  return startOfDay(sd);
}
function addDays(d, n){ const dt=new Date(d); dt.setDate(d.getDate()+n); return dt; }

// ---------- API ----------
async function apiList(fromDate, toDate){
  const qs = new URLSearchParams({
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  });
  const res = await fetch(`${API_BASE}?${qs}`, { headers: { 'Accept': 'application/json' } });
  if(!res.ok) throw new Error('Erreur chargement');
  return await res.json();
}

async function apiCreate(evt){
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
    body: JSON.stringify({
      title: evt.title,
      start: evt.start,
      end: evt.end
    })
  });
  if(!res.ok) throw new Error('Erreur création');
  return await res.json();
}

async function apiDelete(id){
  const res = await fetch(`${API_BASE}/${id}`, { method:'DELETE' });
  if(!res.ok) throw new Error('Erreur suppression');
  return true;
}

// ---------- State ----------
let view = 'month';
let anchor = startOfDay(new Date());
let events = [];

// ---------- DOM ----------
const currentLabel = document.getElementById('currentLabel');
const rangeBadge = document.getElementById('rangeBadge');
const monthGrid = document.getElementById('monthGrid');
const weekGrid = document.getElementById('weekGrid');
const hoursCol = document.getElementById('hours');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const todayBtn = document.getElementById('todayBtn');
const monthBtn = document.getElementById('monthBtn');
const weekBtn = document.getElementById('weekBtn');
const monthView = document.getElementById('monthView');
const weekView = document.getElementById('weekView');

// ---------- Hours ----------
const HOURS = Array.from({length:13}, (_,i)=> i+8);
function renderHours(){
  hoursCol.innerHTML = HOURS.map(h => `<div>${String(h).padStart(2,'0')}:00</div>`).join('');
}

// ---------- Chargement événements ----------
async function reloadEventsForMonth(){
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last  = new Date(anchor.getFullYear(), anchor.getMonth()+1, 0);
  const rangeStart = new Date(first); rangeStart.setDate(first.getDate() - ((first.getDay()||7)-1));
  const rangeEnd = new Date(last); rangeEnd.setDate(last.getDate() + (7 - (last.getDay()||7)));
  events = await apiList(rangeStart, new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate(), 23,59,59));
}

async function reloadEventsForWeek(){
  const weekStart = startOfWeek(anchor);
  const weekEnd = addDays(weekStart, 6);
  events = await apiList(weekStart, new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23,59,59));
}

// ---------- Render Month ----------
function renderMonth(){
  currentLabel.textContent = fmtMonth.format(anchor);
  rangeBadge.textContent = 'Vue mensuelle';
  monthGrid.innerHTML = '';

  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  const cells = 42;

  for(let i=0;i<cells;i++){
    const day = addDays(start, i);
    const out = day.getMonth() !== anchor.getMonth();
    const isToday = startOfDay(day).getTime() === startOfDay(new Date()).getTime();

    const dayEvts = events.filter(e=>{
      const s=new Date(e.start), en=new Date(e.end);
      return startOfDay(s).getTime() <= startOfDay(day).getTime() && startOfDay(day).getTime() <= startOfDay(en).getTime();
    }).slice(0,2);

    const node = document.createElement('div');
    node.className = `day${out?' out':''}${isToday?' today':''}`;
    node.setAttribute('data-date', day.toISOString());
    node.innerHTML = `
      <div class="date">${fmtDayNum.format(day)}</div>
      <div class="events">
        ${dayEvts.map(ev=>`<div class="event-dot" title="${ev.title}">${ev.title}</div>`).join('')}
      </div>
    `;
    node.addEventListener('click', ()=>{
      view = 'week';
      anchor = day;
      updateView();
    });
    monthGrid.appendChild(node);
  }
}

// ---------- Render Week ----------
function renderWeek(){
  const weekStart = startOfWeek(anchor);
  const weekEnd = addDays(weekStart, 6);
  currentLabel.textContent = `${fmtDowShort.format(weekStart)} → ${fmtDowShort.format(weekEnd)}`;
  rangeBadge.textContent = 'Vue hebdomadaire';

  weekGrid.innerHTML = '';
  for(let d=0; d<7; d++){
    const colDate = addDays(weekStart, d);
    const col = document.createElement('div');
    col.className = 'week-col';
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'2-digit',month:'2-digit'}).format(colDate);
    col.appendChild(header);

    for(let h=0; h<HOURS.length; h++){
      const slot = document.createElement('div');
      slot.className = 'week-slot';
      slot.addEventListener('click', async ()=>{
        const duration = prompt("Durée en minutes (30, 60, 90) :", "60");
        if(!duration) return;
        const dur = parseInt(duration,10);
        if(![30,60,90].includes(dur)) return alert("Durée invalide.");
        const title = prompt("Titre du rendez-vous :", "Intervention / Devis");
        if(!title) return;

        const start = new Date(colDate);
        start.setHours(HOURS[h], 0, 0, 0);
        const end = new Date(start.getTime() + dur*60*1000);

        try {
          const created = await apiCreate({
            title,
            start: start.toISOString(),
            end: end.toISOString()
          });
          events.push(created);
          renderWeek();
        } catch (err) {
          alert(err.message || 'Erreur création');
        }
      });
      col.appendChild(slot);
    }

    const dayStart = startOfDay(colDate);
    const dayEnd = new Date(dayStart.getTime()+MS-1);
    const dayEvents = events.filter(e=>{
      const s=new Date(e.start), en=new Date(e.end);
      return (s<=dayEnd && en>=dayStart);
    });

    dayEvents.forEach(ev=>{
      const s=new Date(ev.start), en=new Date(ev.end);
      const totalMins = (en - s)/60000;
      const startMins = ((s.getHours()-HOURS[0])*60)+s.getMinutes();
      const top = startMins * (48/60);
      const height = Math.max(24, totalMins*(48/60));
      const node = document.createElement('div');
      node.className = 'event';
      node.style.top = (header.offsetHeight + top)+'px';
      node.style.height = height+'px';
      node.innerHTML = `<span class="t">${ev.title}</span><span class="h">${fmtTime.format(s)} – ${fmtTime.format(en)}</span>`;
      node.addEventListener('dblclick', async ()=>{
        if(confirm('Supprimer cet événement ?')){
          try {
            await apiDelete(ev.id);
            events = events.filter(x=>x.id !== ev.id);
            renderWeek();
          } catch (err) {
            alert('Erreur suppression');
          }
        }
      });
      col.appendChild(node);
    });
    weekGrid.appendChild(col);
  }
}

// ---------- Navigation ----------
async function updateView(){
  monthBtn.classList.toggle('active', view==='month');
  weekBtn.classList.toggle('active', view==='week');
  const showMonth = view==='month';
  monthView.style.display = showMonth ? '' : 'none';
  weekView.style.display = showMonth ? 'none' : '';
  try {
    if(showMonth){ await reloadEventsForMonth(); renderMonth(); }
    else { renderHours(); await reloadEventsForWeek(); renderWeek(); }
  } catch (err) {
    console.error(err);
    alert('Erreur chargement événements.');
  }
}

prevBtn.addEventListener('click', ()=>{
  if(view==='month'){ anchor.setMonth(anchor.getMonth()-1); }
  else { anchor = addDays(anchor, -7); }
  updateView();
});
nextBtn.addEventListener('click', ()=>{
  if(view==='month'){ anchor.setMonth(anchor.getMonth()+1); }
  else { anchor = addDays(anchor, 7); }
  updateView();
});
todayBtn.addEventListener('click', ()=>{
  anchor = startOfDay(new Date());
  updateView();
});
monthBtn.addEventListener('click', ()=>{ view='month'; updateView(); });
weekBtn.addEventListener('click', ()=>{ view='week'; updateView(); });

updateView();

