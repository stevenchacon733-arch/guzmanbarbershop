const STORE = {
  appointments: 'ng_appointments_v1',
  staffByDate: 'ng_staff_by_date_v1',
  weeklyHours: 'ng_weekly_hours_v1',
  specialHours: 'ng_special_hours_v1',
  clientPhone: 'ng_client_phone_v1'
};

const services = [
  { id:'cut', name:'Corte Signature', price:9000, duration:45, desc:'Corte personalizado, acabado y styling profesional.' },
  { id:'fade', name:'Fade Premium', price:10000, duration:45, desc:'Degradado preciso con terminaciones a detalle.' },
  { id:'beard', name:'Barba & Toalla', price:7000, duration:30, desc:'Perfilado, afeitado y ritual de toalla caliente.' },
  { id:'combo', name:'Corte + Barba', price:15000, duration:75, desc:'Experiencia completa para salir impecable.' }
];
const barbers = [
  { id:'andres', name:'Andrés Vega', role:'Master Barber', tags:['Fade','Clásico'], initial:'AV' },
  { id:'mateo', name:'Mateo Ruiz', role:'Senior Barber', tags:['Texturas','Beard'], initial:'MR' },
  { id:'leo', name:'Leonardo Solís', role:'Barber Stylist', tags:['Modern','Diseño'], initial:'LS' }
];
const defaultWeekly = {
  0:{closed:true,open:'09:00',close:'17:00'},
  1:{closed:false,open:'09:00',close:'19:00'},
  2:{closed:false,open:'09:00',close:'19:00'},
  3:{closed:false,open:'09:00',close:'19:00'},
  4:{closed:false,open:'09:00',close:'19:00'},
  5:{closed:false,open:'09:00',close:'19:00'},
  6:{closed:false,open:'09:00',close:'18:00'}
};

const state = { step:'login', service:null, date:null, barber:null, time:null, clientPhone:null };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC',maximumFractionDigits:0}).format(n);
const dateKey = d => { const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const day=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
const parseDate = str => { const [y,m,d]=str.split('-').map(Number); return new Date(y,m-1,d); };
const prettyDate = str => parseDate(str).toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'long'});
const load = (key,fallback) => { try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback} };
const save = (key,val) => localStorage.setItem(key,JSON.stringify(val));
const getAppointments = () => load(STORE.appointments,[]);
const getWeeklyHours = () => load(STORE.weeklyHours,defaultWeekly);
const getSpecialHours = () => load(STORE.specialHours,{});
const getStaffByDate = () => load(STORE.staffByDate,{});
const getClientPhone = () => { try{return localStorage.getItem(STORE.clientPhone)||null}catch{return null} };
const setClientPhone = phone => { try{localStorage.setItem(STORE.clientPhone,phone)}catch{} };
const clearClientPhone = () => { try{localStorage.removeItem(STORE.clientPhone)}catch{} };
const isValidPhone = digits => /^[2-8][0-9]{7}$/.test(digits);
const formatPhone = digits => digits && digits.length===8 ? `${digits.slice(0,4)}-${digits.slice(4)}` : digits;

function hoursForDate(key){
  const special=getSpecialHours()[key];
  if(special) return special;
  return getWeeklyHours()[parseDate(key).getDay()];
}
function staffForDate(key){
  const custom=getStaffByDate()[key];
  return custom ?? barbers.map(b=>b.id);
}
function showToast(msg){ const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200); }

function renderServices(){
  $('#serviceGrid').innerHTML=services.map((s,i)=>`<article class="service-card reveal"><span class="service-number">0${i+1}</span><h3>${s.name}</h3><p>${s.desc}</p><div class="service-meta"><span>${s.duration} min</span><strong>${money(s.price)}</strong></div></article>`).join('');
  $('#bookingServices').innerHTML=services.map(s=>`<button class="choice-card" data-service="${s.id}"><div class="choice-top"><h4>${s.name}</h4><strong>${money(s.price)}</strong></div><p>${s.duration} min · ${s.desc}</p></button>`).join('');
}
function renderBarbers(){
  $('#barberGrid').innerHTML=barbers.map(b=>`<article class="barber-card reveal"><div class="barber-portrait"><span class="barber-initial">${b.initial}</span></div><div class="barber-info"><h3>${b.name}</h3><p>${b.role}</p><div class="barber-tags">${b.tags.map(t=>`<span>${t}</span>`).join('')}</div></div></article>`).join('');
}

function setStep(n){
  state.step=n;
  $$('.booking-step').forEach(el=>el.classList.remove('active'));
  const target = n==='success' ? $('#stepSuccess') : n==='login' ? $('#stepLogin') : $(`#step${n}`); target.classList.add('active');
  $('.booking-shell').classList.toggle('pre-auth', n==='login');
  $$('.progress-step').forEach(el=>{const sn=Number(el.dataset.step);el.classList.toggle('active',sn===n);el.classList.toggle('done',typeof n==='number'&&sn<n)});
  if(n===2) renderDates(); if(n===3) renderBookingBarbers(); if(n===4) renderTimesAndSummary();
  document.querySelector('#booking').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderDates(){
  const box=$('#dateStrip'); const today=new Date(); today.setHours(0,0,0,0); let html='';
  for(let i=0;i<14;i++){
    const d=new Date(today);d.setDate(today.getDate()+i); const key=dateKey(d); const hrs=hoursForDate(key); const disabled=hrs.closed;
    html+=`<button class="date-card ${disabled?'disabled':''} ${state.date===key?'selected':''}" data-date="${key}" ${disabled?'disabled':''}><small>${d.toLocaleDateString('es-CR',{weekday:'short'})}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('es-CR',{month:'short'})}</small></button>`;
  }
  box.innerHTML=html;
  $$('.date-card:not(.disabled)').forEach(btn=>btn.onclick=()=>{state.date=btn.dataset.date;state.barber=null;state.time=null;$$('.date-card').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');const special=getSpecialHours()[state.date];$('#specialHoursNote').textContent=special?`Horario especial: ${special.open} – ${special.close}`:'';setTimeout(()=>setStep(3),180)});
}

function renderBookingBarbers(){
  const ids=staffForDate(state.date); const available=barbers.filter(b=>ids.includes(b.id));
  $('#bookingBarbers').innerHTML = available.length ? available.map(b=>`<button class="choice-card ${state.barber===b.id?'selected':''}" data-barber="${b.id}"><div class="choice-top"><h4>${b.name}</h4><strong>${b.role}</strong></div><p>${b.tags.join(' · ')}</p></button>`).join('') : `<div class="empty-state" style="grid-column:1/-1">No hay barberos programados para este día.</div>`;
  $$('[data-barber]').forEach(btn=>btn.onclick=()=>{state.barber=btn.dataset.barber;state.time=null;setTimeout(()=>setStep(4),180)});
}

function toMinutes(t){const [h,m]=t.split(':').map(Number);return h*60+m} function fromMinutes(m){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
function availableSlots(){
  const hrs=hoursForDate(state.date); if(!hrs||hrs.closed)return[];
  const service=services.find(s=>s.id===state.service); const appts=getAppointments().filter(a=>a.date===state.date&&a.barberId===state.barber&&a.status!=='cancelled');
  const result=[]; const start=toMinutes(hrs.open), end=toMinutes(hrs.close);
  for(let t=start;t+service.duration<=end;t+=15){
    const conflict=appts.some(a=>{const as=toMinutes(a.time),ae=as+a.duration;return t<ae && t+service.duration>as});
    const now=new Date(); const dt=parseDate(state.date); const same=dateKey(now)===state.date; const past=same && t<=now.getHours()*60+now.getMinutes()+15;
    if(!conflict&&!past)result.push(fromMinutes(t));
  }
  return result;
}
function renderTimesAndSummary(){
  const slots=availableSlots(); $('#timeSlots').innerHTML=slots.length?slots.map(t=>`<button class="slot ${state.time===t?'selected':''}" data-time="${t}">${t}</button>`).join(''):`<div class="empty-state" style="grid-column:1/-1">No quedan espacios disponibles con este barbero.</div>`;
  $$('[data-time]').forEach(btn=>btn.onclick=()=>{state.time=btn.dataset.time;$$('[data-time]').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');renderSummary()}); renderSummary();
}
function renderSummary(){
  const s=services.find(x=>x.id===state.service), b=barbers.find(x=>x.id===state.barber);
  $('#bookingSummary').innerHTML=`<div class="summary-item"><small>Servicio</small><b>${s?.name||'—'}</b></div><div class="summary-item"><small>Fecha</small><b>${state.date?prettyDate(state.date):'—'}</b></div><div class="summary-item"><small>Barbero</small><b>${b?.name||'—'}</b></div><div class="summary-item"><small>Hora</small><b>${state.time||'Selecciona arriba'}</b></div>`;
}
function resetBooking(){Object.assign(state,{step:1,service:null,date:null,barber:null,time:null});$('#bookingForm').reset();$('#clientPhone').value=state.clientPhone||'';$('#clientPhone').readOnly=true;setStep(1);$$('[data-service]').forEach(x=>x.classList.remove('selected'))}

function updateClientSessionBar(){
  const bar=$('#clientSession'); if(!bar)return;
  if(state.clientPhone){ bar.classList.remove('hidden'); $('#clientSessionPhone').textContent=formatPhone(state.clientPhone); }
  else{ bar.classList.add('hidden'); }
}
function attemptClientLogin(){
  const digits=$('#loginPhone').value.replace(/\D/g,'');
  if(!isValidPhone(digits)){ $('#loginPhoneError').textContent='Ingresá un número de teléfono válido (8 dígitos).'; return; }
  setClientPhone(digits); state.clientPhone=digits;
  $('#loginPhoneError').textContent=''; $('#loginPhone').value='';
  $('#clientPhone').value=digits; $('#clientPhone').readOnly=true;
  updateClientSessionBar();
  setStep(1);
}
function clientLogout(){
  clearClientPhone(); state.clientPhone=null;
  $('#clientPhone').value=''; $('#clientPhone').readOnly=true;
  Object.assign(state,{service:null,date:null,barber:null,time:null});
  $('#bookingForm').reset();
  $$('[data-service]').forEach(x=>x.classList.remove('selected'));
  updateClientSessionBar();
  setStep('login');
}
function initClientLogin(){
  $('#clientLoginBtn').onclick=attemptClientLogin;
  $('#loginPhone').addEventListener('keydown',e=>{if(e.key==='Enter')attemptClientLogin()});
  $('#clientLogoutBtn').onclick=clientLogout;
}

function initBookingEvents(){
  $$('[data-service]').forEach(btn=>btn.onclick=()=>{state.service=btn.dataset.service;state.date=null;state.barber=null;state.time=null;$$('[data-service]').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');setTimeout(()=>setStep(2),180)});
  $$('.back-btn').forEach(btn=>btn.onclick=()=>setStep(Number(btn.dataset.back)));
  $('#bookingForm').onsubmit=async e=>{e.preventDefault();if(!state.clientPhone){showToast('Iniciá sesión con tu número para reservar.');setStep('login');return} if(!state.time){showToast('Selecciona una hora disponible.');return} const submit=e.submitter;submit.disabled=true; const s=services.find(x=>x.id===state.service),b=barbers.find(x=>x.id===state.barber); const appointment={id:'APT-'+Date.now(),createdAt:new Date().toISOString(),serviceId:s.id,serviceName:s.name,price:s.price,duration:s.duration,date:state.date,time:state.time,barberId:b.id,barberName:b.name,clientName:$('#clientName').value.trim(),phone:state.clientPhone,email:$('#clientEmail').value.trim(),note:$('#clientNote').value.trim(),status:'confirmed'}; const arr=getAppointments();arr.push(appointment);save(STORE.appointments,arr); try{const response=await fetch('/api/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(appointment)});if(!response.ok)showToast('Reserva guardada; no se pudo avisar por WhatsApp.')}catch{showToast('Reserva guardada; WhatsApp no está configurado.')} finally{submit.disabled=false} $('#successText').textContent=`${appointment.clientName}, tu cita quedó para ${prettyDate(appointment.date)} a las ${appointment.time} con ${appointment.barberName}.`;setStep('success');};
  $('#newBookingBtn').onclick=resetBooking;
}

function openAdmin(){ $('#adminModal').classList.add('open');document.body.classList.add('modal-open');$('#adminModal').setAttribute('aria-hidden','false'); }
function closeAdmin(){ $('#adminModal').classList.remove('open');document.body.classList.remove('modal-open');$('#adminModal').setAttribute('aria-hidden','true'); }
function showDashboard(){ $('#adminLogin').classList.add('hidden');$('#adminDashboard').classList.remove('hidden'); initAdminViews(); }
async function logoutAdmin(){
  try{await fetch('/api/admin/logout',{method:'POST'})}catch{}
  $('#adminDashboard').classList.add('hidden');$('#adminLogin').classList.remove('hidden');$('#adminPassword').value='';
}
async function attemptLogin(){
  const btn=$('#adminLoginBtn'); const password=$('#adminPassword').value;
  if(!password){$('#loginError').textContent='Ingresá la contraseña.';return}
  btn.disabled=true; $('#loginError').textContent='';
  try{
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
    const data=await res.json().catch(()=>({}));
    if(res.ok){ $('#adminPassword').value=''; showDashboard(); }
    else{ $('#loginError').textContent=data.error||'Contraseña incorrecta.'; }
  }catch{ $('#loginError').textContent='No se pudo conectar. Intentá de nuevo.'; }
  finally{ btn.disabled=false; }
}

function initAdmin(){
  const adminOpen=$('#adminOpenBtn'); if(adminOpen)adminOpen.onclick=openAdmin; $$('[data-close-admin]').forEach(x=>x.onclick=closeAdmin);
  $('#adminLoginBtn').onclick=attemptLogin;
  $('#adminPassword').addEventListener('keydown',e=>{if(e.key==='Enter')$('#adminLoginBtn').click()}); $('#adminLogoutBtn').onclick=logoutAdmin;
  $$('.admin-tab').forEach(tab=>tab.onclick=()=>{$$('.admin-tab').forEach(x=>x.classList.remove('active'));tab.classList.add('active');$$('.admin-pane').forEach(x=>x.classList.remove('active'));$(`#pane-${tab.dataset.tab}`).classList.add('active');if(tab.dataset.tab==='appointments')renderAppointments();if(tab.dataset.tab==='team')renderStaffDay();if(tab.dataset.tab==='hours'){renderWeeklyHours();renderExceptions();}});
  $('#adminDateFilter').onchange=renderAppointments; $('#staffDate').onchange=renderStaffDay;
  $('#specialClosed').onchange=()=>$('#specialTimeFields').style.opacity=$('#specialClosed').checked?'.35':'1';
  $('#specialDate').onchange=loadSpecialIntoForm;
  $('#saveStaffDay').onclick=saveStaffDay; $('#saveWeeklyHours').onclick=saveWeeklyHours; $('#saveSpecialHours').onclick=saveSpecialHours; $('#removeSpecialHours').onclick=removeSpecialHours;
}
function initAdminViews(){
  const today=dateKey(new Date()); if(!$('#adminDateFilter').value)$('#adminDateFilter').value=today;if(!$('#staffDate').value)$('#staffDate').value=today;if(!$('#specialDate').value)$('#specialDate').value=today;renderAppointments();renderStaffDay();renderWeeklyHours();renderExceptions();loadSpecialIntoForm();
}
function renderAppointments(){
  const key=$('#adminDateFilter').value||dateKey(new Date()); const arr=getAppointments().filter(a=>a.date===key).sort((a,b)=>a.time.localeCompare(b.time));
  const active=arr.filter(a=>a.status!=='cancelled'); const revenue=active.reduce((sum,a)=>sum+a.price,0); const unique=new Set(active.map(a=>a.barberId)).size;
  $('#metricRow').innerHTML=`<div class="metric"><small>CITAS ACTIVAS</small><strong>${active.length}</strong></div><div class="metric"><small>INGRESO PROYECTADO</small><strong>${money(revenue)}</strong></div><div class="metric"><small>BARBEROS CON CITA</small><strong>${unique}</strong></div>`;
  $('#appointmentsList').innerHTML=arr.length?arr.map(a=>`<div class="appointment-card" style="opacity:${a.status==='cancelled'?'.45':'1'}"><div class="appt-time">${a.time}</div><div class="appt-main"><b>${a.clientName}</b><span>${a.serviceName} · ${a.duration} min · ${money(a.price)}</span></div><div class="appt-barber"><b>${a.barberName}</b><span>${a.phone}${a.note?` · ${a.note}`:''}</span></div><div class="appt-actions">${a.status!=='cancelled'?`<button class="icon-btn danger" data-cancel="${a.id}">Cancelar</button>`:'<span class="eyebrow">CANCELADA</span>'}</div></div>`).join(''):`<div class="empty-state">No hay citas para esta fecha.</div>`;
  $$('[data-cancel]').forEach(btn=>btn.onclick=()=>{const all=getAppointments();const item=all.find(a=>a.id===btn.dataset.cancel);if(item)item.status='cancelled';save(STORE.appointments,all);renderAppointments();showToast('Cita cancelada.');});
}
function renderStaffDay(){
  const key=$('#staffDate').value||dateKey(new Date()); const selected=staffForDate(key);
  $('#staffToggleList').innerHTML=barbers.map(b=>`<div class="staff-toggle"><div class="staff-name"><span class="staff-avatar">${b.initial}</span><div><b>${b.name}</b><div style="font-size:10px;color:var(--muted)">${b.role}</div></div></div><label class="switch"><input type="checkbox" data-staff-check="${b.id}" ${selected.includes(b.id)?'checked':''}><span></span></label></div>`).join('');
}
function saveStaffDay(){ const key=$('#staffDate').value;if(!key)return; const ids=$$('[data-staff-check]:checked').map(x=>x.dataset.staffCheck);const obj=getStaffByDate();obj[key]=ids;save(STORE.staffByDate,obj);$('#staffSaveStatus').textContent='Equipo guardado correctamente.';setTimeout(()=>$('#staffSaveStatus').textContent='',1800); }
function renderWeeklyHours(){
  const labels=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],data=getWeeklyHours(); $('#weeklyHours').innerHTML=labels.map((label,i)=>`<div class="weekly-row"><b>${label}</b><label><input type="checkbox" data-wh-closed="${i}" ${data[i].closed?'checked':''}> Cerrado</label><input type="time" data-wh-open="${i}" value="${data[i].open}"><input type="time" data-wh-close="${i}" value="${data[i].close}"></div>`).join('');
}
function saveWeeklyHours(){ const obj={}; for(let i=0;i<7;i++)obj[i]={closed:$(`[data-wh-closed="${i}"]`).checked,open:$(`[data-wh-open="${i}"]`).value,close:$(`[data-wh-close="${i}"]`).value};save(STORE.weeklyHours,obj);$('#weeklySaveStatus').textContent='Horario general actualizado.';setTimeout(()=>$('#weeklySaveStatus').textContent='',1800); }
function loadSpecialIntoForm(){const key=$('#specialDate').value;if(!key)return;const item=getSpecialHours()[key];$('#specialClosed').checked=item?.closed||false;$('#specialOpen').value=item?.open||'09:00';$('#specialClose').value=item?.close||'19:00';$('#specialTimeFields').style.opacity=$('#specialClosed').checked?'.35':'1';}
function saveSpecialHours(){const key=$('#specialDate').value;if(!key){$('#specialSaveStatus').textContent='Selecciona una fecha.';return}const obj=getSpecialHours();obj[key]={closed:$('#specialClosed').checked,open:$('#specialOpen').value,close:$('#specialClose').value};save(STORE.specialHours,obj);renderExceptions();$('#specialSaveStatus').textContent='Excepción guardada.';setTimeout(()=>$('#specialSaveStatus').textContent='',1800);}
function removeSpecialHours(){const key=$('#specialDate').value;if(!key)return;const obj=getSpecialHours();delete obj[key];save(STORE.specialHours,obj);renderExceptions();loadSpecialIntoForm();$('#specialSaveStatus').textContent='Excepción eliminada.';setTimeout(()=>$('#specialSaveStatus').textContent='',1800);}
function renderExceptions(){const obj=getSpecialHours();const keys=Object.keys(obj).sort();$('#exceptionsList').innerHTML=keys.length?`<div class="eyebrow" style="margin-bottom:8px">EXCEPCIONES GUARDADAS</div>`+keys.map(k=>`<div class="exception-item"><b>${prettyDate(k)}</b><span>${obj[k].closed?'Cerrado':`${obj[k].open} – ${obj[k].close}`}</span></div>`).join(''):'<div class="empty-state" style="padding:20px">Sin excepciones guardadas.</div>'}

function initNavAndReveal(){
  $('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open'); $$('#mainNav a').forEach(a=>a.onclick=()=>$('#mainNav').classList.remove('open'));
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12}); $$('.reveal').forEach(el=>obs.observe(el));
}

renderServices();renderBarbers();initBookingEvents();initClientLogin();initAdmin();initNavAndReveal();
const savedPhone=getClientPhone();
if(savedPhone){
  state.clientPhone=savedPhone; state.step=1;
  $('#stepLogin').classList.remove('active'); $('#step1').classList.add('active');
  $('.booking-shell').classList.remove('pre-auth');
  $('#clientPhone').value=savedPhone; $('#clientPhone').readOnly=true;
}
updateClientSessionBar();
if(document.getElementById('adminAuthFlag')?.dataset.authenticated==='true'){ showDashboard(); }
