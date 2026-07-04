// ── MAZINGIRA DASHBOARD — CORE FUNCTIONS ──────────────

// ── DAYS REMAINING COUNTER ────────────────────────────
function updateDeadline() {
  var el = document.getElementById('days-left');
  if (!el) return;
  var now = new Date();
  var year = now.getFullYear();
  var deadline = new Date(year, 11, 31);
  if (now > deadline) deadline.setFullYear(year + 1);
  var days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  el.textContent = days;
}

// ── TOAST NOTIFICATIONS ───────────────────────────────
function showToast(msg, type) {
  var existing = document.querySelector('.toast-global');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.className = 'toast-global';
  var bg = type === 'error' ? '#C0392B' : type === 'warn' ? '#E8A020' : '#0D4A35';
  Object.assign(t.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
    padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
    background: bg, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    opacity: '1', transform: 'translateY(0)', transition: 'all 0.25s', pointerEvents: 'none'
  });
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; }, 2500);
  setTimeout(function() { if (t.parentNode) t.remove(); }, 3000);
}

// ── PANEL ANIMATIONS ──────────────────────────────────
function animatePanel(id) {
  var panel = document.getElementById('panel-' + id);
  if (!panel) return;
  panel.querySelectorAll('.reveal').forEach(function(el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    setTimeout(function() {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50 + i * 80);
  });
}

function initRevealObserver() {}
function showSkeleton(id) {
  var panel = document.getElementById('panel-' + id);
  if (panel) { panel.style.opacity = '0.5'; panel.style.transition = 'opacity 0.3s'; }
}
function hideSkeleton(id) {
  var panel = document.getElementById('panel-' + id);
  if (panel) panel.style.opacity = '1';
}

// ── TOGGLE HELPERS ────────────────────────────────────
function toggleCheck(el) {
  var cb = el.querySelector('input[type=checkbox]');
  if (cb && !cb.disabled) {
    cb.checked = !cb.checked;
    el.classList.toggle('checked', cb.checked);
  }
  recalc();
  scheduleAutoSave();
}

function selectInstrument(el, type) {
  document.querySelectorAll('.instrument-card').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  scheduleAutoSave();
  recalc();
}

// ── AUTO-SAVE SYSTEM ─────────────────────────────────
var autoSaveTimer = null;
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveAllFormData, 400);
}

function saveAllFormData() {
  var data = JSON.parse(localStorage.getItem('esg_form_data') || '{}');
  document.querySelectorAll('input, select, textarea').forEach(function(el) {
    if (!el.id || el.type === 'file') return;
    if (el.type === 'checkbox') {
      data[el.id] = el.checked ? 'true' : 'false';
    } else {
      data[el.id] = el.value;
    }
  });
  document.querySelectorAll('.pill.active').forEach(function(p) {
    data['pill-' + p.textContent.trim()] = 'active';
  });
  data['_selected-instrument'] = document.querySelector('#instrument-grid .instrument-card.selected') ? 'true' : '';
  localStorage.setItem('esg_form_data', JSON.stringify(data));
  // Also snapshot to yearly data
  saveYearSnapshot(getCurrentYear());
  renderYearPills();
}

function initAutoSave() {
  document.addEventListener('input', function(e) {
    if (e.target.id && e.target.type !== 'file') scheduleAutoSave();
  });
  document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
      var row = e.target.closest('.check-row');
      if (row) row.classList.toggle('checked', e.target.checked);
      scheduleAutoSave();
      recalc();
    }
  });
}

// ── LOAD SAVED DATA ───────────────────────────────────
function loadSavedData() {
  var data = JSON.parse(localStorage.getItem('esg_form_data') || '{}');
  Object.keys(data).forEach(function(key) {
    if (key.startsWith('pill-') || key.startsWith('_')) return;
    var el = document.getElementById(key);
    if (el) {
      if (el.type === 'checkbox') {
        el.checked = data[key] === 'true';
        var row = el.closest('.check-row');
        if (row) row.classList.toggle('checked', el.checked);
      } else {
        el.value = data[key];
      }
    }
  });
  document.querySelectorAll('.pill').forEach(function(p) {
    if (data['pill-' + p.textContent.trim()] === 'active') p.classList.add('active');
  });
}

// ── SETTINGS ──────────────────────────────────────────
function saveSettings() {
  var fields = ['s-company','s-ticker','s-pin','s-sector','s-year','s-address','s-email','s-revenue','s-sites'];
  var data = {};
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  localStorage.setItem('esg_settings', JSON.stringify(data));
}

function loadSettings() {
  var data = JSON.parse(localStorage.getItem('esg_settings') || '{}');
  Object.keys(data).forEach(function(key) {
    var el = document.getElementById(key);
    if (el) el.value = data[key];
  });
}

function getCurrentYear() {
  var el = document.getElementById('s-year');
  return el && el.value ? el.value : new Date().getFullYear().toString();
}

function saveYearSnapshot(year) {
  var allYears = JSON.parse(localStorage.getItem('esg_yearly_data') || '{}');
  var snap = {};
  document.querySelectorAll('input, select, textarea').forEach(function(el) {
    if (!el.id || el.type === 'file') return;
    snap[el.id] = el.type === 'checkbox' ? (el.checked ? 'true' : 'false') : el.value;
  });
  document.querySelectorAll('.pill.active').forEach(function(p) {
    snap['pill-' + p.textContent.trim()] = 'active';
  });
  snap['_selected-instrument'] = document.querySelector('#instrument-grid .instrument-card.selected') ? 'true' : '';
  allYears[year] = snap;
  localStorage.setItem('esg_yearly_data', JSON.stringify(allYears));
  return allYears;
}

function loadYearlyData() {
  return JSON.parse(localStorage.getItem('esg_yearly_data') || '{}');
}

function seedDefaultYearlyData() {
  var data = loadYearlyData();
  if (Object.keys(data).length > 0) return;
  data['2020'] = { scope1:'1050', scope2:'920', scope3:'3800', renewable:'28', water:'10000', waste:'350', 'emp-women':'38', 'lead-women':'28', 'emp-youth':'40', energy:'3800' };
  data['2021'] = { scope1:'1100', scope2:'900', scope3:'4000', renewable:'32', water:'10500', waste:'340', 'emp-women':'39', 'lead-women':'30', 'emp-youth':'42', energy:'3900' };
  data['2022'] = { scope1:'1080', scope2:'880', scope3:'4100', renewable:'38', water:'11000', waste:'320', 'emp-women':'40', 'lead-women':'32', 'emp-youth':'45', energy:'4100' };
  data['2023'] = { scope1:'1020', scope2:'860', scope3:'4200', renewable:'42', water:'11500', waste:'310', 'emp-women':'41', 'lead-women':'34', 'emp-youth':'46', energy:'4300' };
  data['2024'] = { scope1:'1200', scope2:'850', scope3:'4200', renewable:'45', water:'12000', waste:'300', 'emp-women':'42', 'lead-women':'35', 'emp-youth':'48', energy:'4500' };
  localStorage.setItem('esg_yearly_data', JSON.stringify(data));
}

function renderYearPills() {
  var container = document.getElementById('year-pills');
  if (!container) return;
  var data = loadYearlyData();
  var years = Object.keys(data).sort();
  var current = getCurrentYear();
  container.innerHTML = years.map(function(y) {
    var active = y === current ? ' active' : '';
    return '<span class="pill' + active + '" data-year="' + y + '" onclick="loadYearIntoForms(\'' + y + '\')">' + y + '</span>';
  }).join('') + '<span class="pill" onclick="addNewYear()" title="Add new year">+</span>';
}

function loadYearIntoForms(year) {
  var data = loadYearlyData();
  var snap = data[year];
  if (!snap) { showToast('No data for ' + year, 'warn'); return; }
  Object.keys(snap).forEach(function(key) {
    if (key.startsWith('pill-') || key.startsWith('_')) return;
    var el = document.getElementById(key);
    if (el) {
      if (el.type === 'checkbox') {
        el.checked = snap[key] === 'true';
        var row = el.closest('.check-row');
        if (row) row.classList.toggle('checked', el.checked);
      } else {
        el.value = snap[key];
      }
    }
  });
  document.querySelectorAll('.pill').forEach(function(p) {
    if (snap['pill-' + p.textContent.trim()] === 'active') p.classList.add('active');
    else p.classList.remove('active');
  });
  var yearEl = document.getElementById('s-year');
  if (yearEl) yearEl.value = year;
  var repYearEl = document.getElementById('rep-year');
  if (repYearEl) repYearEl.value = year;
  saveSettings();
  recalc();
  renderYearPills();
  showToast('Loaded ' + year + ' data ✓');
}

function addNewYear() {
  var data = loadYearlyData();
  var years = Object.keys(data).sort();
  var lastYear = years.length > 0 ? years[years.length - 1] : '2024';
  var newYear = (parseInt(lastYear) + 1).toString();
  if (data[newYear]) { showToast(newYear + ' already exists', 'warn'); return; }
  data[newYear] = JSON.parse(JSON.stringify(data[lastYear] || {}));
  localStorage.setItem('esg_yearly_data', JSON.stringify(data));
  loadYearIntoForms(newYear);
  showToast('Created ' + newYear + ' from ' + lastYear + ' data');
}

function saveFormData() {
  saveAllFormData();
  var year = getCurrentYear();
  saveYearSnapshot(year);
  renderYearPills();
  showToast('All data saved ✓');
}

// ── CHART.JS INIT ────────────────────────────────────
var chartsInited = false;
var matInited = false;
var chartInstances = {};

function getOrCreateChart(id, config) {
  if (chartInstances[id]) { chartInstances[id].destroy(); }
  var ctx = document.getElementById(id);
  if (!ctx) return null;
  try { chartInstances[id] = new Chart(ctx, config); } catch(e) { console.warn('Chart.js error for #'+id+':', e.message); }
  return chartInstances[id];
}

function initCharts() {
  if (typeof Chart === 'undefined') { console.warn('Chart.js not loaded'); return; }
  chartsInited = true;

  // Default palette
  var g1 = 'rgba(29,158,117,0.8)', g2 = 'rgba(93,202,165,0.6)', a1 = 'rgba(232,160,32,0.5)';
  var b1 = '#378ADD', p1 = '#7F77DD';

  getOrCreateChart('chart-emissions', {
    type: 'bar',
    data: {
      labels: ['2020','2021','2022','2023','2024'],
      datasets: [
        { label: 'Scope 1', data: [1050,1100,1080,1020,1200], backgroundColor: g1, borderRadius: 4 },
        { label: 'Scope 2', data: [920,900,880,860,850], backgroundColor: g2, borderRadius: 4 },
        { label: 'Scope 3', data: [3800,4000,4100,4200,4200], backgroundColor: a1, borderRadius: 4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
  });

  getOrCreateChart('chart-renewable', {
    type: 'line',
    data: {
      labels: ['2020','2021','2022','2023','2024'],
      datasets: [{ label: 'Renewable share %', data: [28,32,38,42,45], borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.1)', fill: true, tension: 0.3, pointBackgroundColor: '#1D9E75' }]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { max: 60, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
  });

  getOrCreateChart('chart-esg', {
    type: 'radar',
    data: {
      labels: ['Environmental','Social','Governance','Green Finance'],
      datasets: [
        { label: 'FY 2023', data: [70,55,35,22], borderColor: 'rgba(29,158,117,0.4)', backgroundColor: 'rgba(29,158,117,0.1)', pointBackgroundColor: 'rgba(29,158,117,0.6)' },
        { label: 'FY 2024', data: [78,65,44,38], borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.15)', pointBackgroundColor: '#1D9E75' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1, scales: { r: { min: 0, max: 100, ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.08)' } } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
  });

  getOrCreateChart('chart-diversity', {
    type: 'doughnut',
    data: {
      labels: ['Women in workforce','Women in management','Youth <35','Men'],
      datasets: [{ data: [42,35,48,58], backgroundColor: ['#1D9E75','#378ADD','#E8A020','rgba(0,0,0,0.08)'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
  });

  getOrCreateChart('chart-water', {
    type: 'line',
    data: {
      labels: ['2020','2021','2022','2023','2024'],
      datasets: [
        { label: 'Water intensity', data: [100,95,88,82,76], borderColor: b1, backgroundColor: 'rgba(55,138,221,0.1)', fill: true, tension: 0.3 },
        { label: 'Waste intensity', data: [100,92,85,78,70], borderColor: p1, backgroundColor: 'rgba(127,119,221,0.1)', fill: true, tension: 0.3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { y: { max: 110, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
  });
}

// ── COMPUTE ESG SCORES FROM YEARLY SNAPSHOT ──────────
function computeYearScores(year) {
  var data = loadYearlyData();
  var snap = data[year];
  if (!snap) return null;

  function filled(id) { return snap[id] && snap[id].toString().trim() !== ''; }

  var eF = ['scope1','scope2','energy','renewable','water','waste','waste-div'].filter(filled).length;
  var sF = ['emp-total','emp-women','lead-women','turnover','ltir','training','community','suppliers'].filter(filled).length;
  var gF = ['board-size','independent','board-women','board-esg'].filter(filled).length;

  var gC = 0;
  if (snap['_gov-checks-count']) { gC = parseInt(snap['_gov-checks-count']) || 0; }

  var gfC = 0;
  if (snap['_gf-checks-count']) { gfC = parseInt(snap['_gf-checks-count']) || 0; }

  var gfF = ['gf-size','gf-co2'].filter(filled).length;
  var eligC = 0;
  ['Renewable energy','Energy efficiency','Clean transport','Sustainable water & sanitation','Pollution prevention','Biodiversity & land use','Green buildings','Circular economy','Climate adaptation','Agriculture & food systems'].forEach(function(name) {
    if (snap['pill-' + name] === 'active') eligC++;
  });
  var hasInstrument = snap['_selected-instrument'] === 'true' ? 1 : 0;

  var ePct = Math.min(100, Math.round(eF / 7 * 100));
  var sPct = Math.min(100, Math.round(sF / 8 * 100));
  var gPct = Math.min(100, gF === 0 && gC === 0 ? 0 : Math.round((gF / 4 * 0.5 + gC / 7 * 0.5) * 100));
  var gfPct = Math.min(100, gfC === 0 && gfF === 0 && eligC === 0 && !hasInstrument ? 0 : Math.round((gfC / 8 * 0.5 + gfF / 2 * 0.2 + Math.min(eligC / 3, 1) * 0.2 + hasInstrument * 0.1) * 100));

  return { e: ePct, s: sPct, g: gPct, gf: gfPct };
}

// ── DYNAMIC CHART UPDATES (from yearly data) ──────────
function updateCharts() {
  if (typeof Chart === 'undefined' || !chartsInited) return;

  var yearlyData = loadYearlyData();
  var allYears = Object.keys(yearlyData).sort();
  if (allYears.length === 0) allYears = ['2020','2021','2022','2023','2024'];

  function getYearVal(year, id) {
    var snap = yearlyData[year];
    if (!snap || snap[id] === undefined || snap[id] === '') return null;
    var v = parseFloat(snap[id]);
    return isNaN(v) ? null : v;
  }

  // ── 1. Emissions bar chart ──
  var emChart = chartInstances['chart-emissions'];
  if (emChart) {
    emChart.data.labels = allYears;
    emChart.data.datasets[0].data = allYears.map(function(y) { return getYearVal(y, 'scope1') || 0; });
    emChart.data.datasets[1].data = allYears.map(function(y) { return getYearVal(y, 'scope2') || 0; });
    emChart.data.datasets[2].data = allYears.map(function(y) { return getYearVal(y, 'scope3') || 0; });
    emChart.update('none');
  }

  // ── 2. Renewable energy line chart ──
  var renChart = chartInstances['chart-renewable'];
  if (renChart) {
    renChart.data.labels = allYears;
    renChart.data.datasets[0].data = allYears.map(function(y) { return getYearVal(y, 'renewable') || 0; });
    renChart.update('none');
  }

  // ── 3. ESG radar chart ──
  // For radar, show the latest 2 years as datasets
  var recent = allYears.slice(-2);
  var eScore = parseInt(document.getElementById('r-epct')?.textContent || 0);
  var sScore = parseInt(document.getElementById('r-spct')?.textContent || 0);
  var gScore = parseInt(document.getElementById('r-gpct')?.textContent || 0);
  var gfScore = parseInt(document.getElementById('r-gfpct')?.textContent || 0);
  var esgChart = chartInstances['chart-esg'];
  if (esgChart) {
    var older = recent[0] || 'FY ' + (parseInt(getCurrentYear())-1);
    var newer = recent[1] || getCurrentYear();
    esgChart.data.datasets[0].label = older;
    esgChart.data.datasets[1].label = newer;
    esgChart.data.datasets[1].data = [eScore, sScore, gScore, gfScore];
    var prevScores = computeYearScores(older);
    if (prevScores) {
      esgChart.data.datasets[0].data = [prevScores.e, prevScores.s, prevScores.g, prevScores.gf];
    } else {
      esgChart.data.datasets[0].data = [Math.round(eScore*0.85), Math.round(sScore*0.85), Math.round(gScore*0.85), Math.round(gfScore*0.85)];
    }
    esgChart.update('none');
  }

  // ── 4. Diversity doughnut chart (show latest year) ──
  var divChart = chartInstances['chart-diversity'];
  if (divChart) {
    var lastY = allYears[allYears.length - 1];
    var w = getYearVal(lastY, 'emp-women');
    var lw = getYearVal(lastY, 'lead-women');
    var yt = getYearVal(lastY, 'emp-youth');
    divChart.data.datasets[0].data = [
      w !== null ? w : 42,
      lw !== null ? lw : 35,
      yt !== null ? yt : 48,
      Math.round(100 - (w !== null ? w : 42))
    ];
    divChart.update('none');
  }

  // ── 5. Water & Waste line chart (indexed to earliest year) ──
  var waterChart = chartInstances['chart-water'];
  if (waterChart) {
    waterChart.data.labels = allYears;
    var rawWater = allYears.map(function(y) { return getYearVal(y, 'water') || 0; });
    var rawWaste = allYears.map(function(y) { return getYearVal(y, 'waste') || 0; });
    var baseWater = rawWater[0] || 1;
    var baseWaste = rawWaste[0] || 1;
    waterChart.data.datasets[0].data = rawWater.map(function(v) { return Math.round(v / baseWater * 100); });
    waterChart.data.datasets[1].data = rawWaste.map(function(v) { return Math.round(v / baseWaste * 100); });
    waterChart.update('none');
  }
}

// ── MATERIALITY ASSESSMENT ────────────────────────────
var materialityTopics = [
  { id:'ghg', label:'GHG Emissions & Climate', pillar:'E', def:85, stake:90 },
  { id:'energy', label:'Energy & Renewable Transition', pillar:'E', def:80, stake:75 },
  { id:'water', label:'Water Management', pillar:'E', def:65, stake:70 },
  { id:'waste', label:'Waste & Circular Economy', pillar:'E', def:60, stake:55 },
  { id:'diversity', label:'Diversity, Equity & Inclusion', pillar:'S', def:82, stake:78 },
  { id:'hr', label:'Labour Rights & H&S', pillar:'S', def:70, stake:85 },
  { id:'community', label:'Community Relations', pillar:'S', def:55, stake:65 },
  { id:'supply', label:'Supply Chain Management', pillar:'S', def:45, stake:50 },
  { id:'board', label:'Board Oversight & Ethics', pillar:'G', def:78, stake:88 },
  { id:'remun', label:'Executive Remuneration', pillar:'G', def:40, stake:60 },
  { id:'data', label:'Data Protection & Privacy', pillar:'G', def:50, stake:72 },
  { id:'greenfin', label:'Green Finance Access', pillar:'GF', def:35, stake:45 }
];
var badgeMap = { E:'badge-green', S:'badge-blue', G:'badge-purple', GF:'badge-amber' };

function initMateriality() {
  matInited = true;
  var container = document.getElementById('materiality-inputs');
  var tbody = document.getElementById('material-table-body');
  if (!container) return;
  container.innerHTML = '';

  materialityTopics.forEach(function(t) {
    var row = document.createElement('div');
    row.className = 'mat-slider-row';
    row.innerHTML = '<label>'+t.label+' <span class="badge '+(badgeMap[t.pillar]||'badge-gray')+'" style="margin-left:6px">'+t.pillar+'</span></label>' +
      '<div class="slider-row"><span class="text-sm text-muted" style="width:80px">Impact</span><input type="range" min="0" max="100" value="'+t.def+'" id="mat-def-'+t.id+'" oninput="updateMateriality()"><span class="mat-val" id="mat-def-val-'+t.id+'">'+t.def+'</span></div>' +
      '<div class="slider-row"><span class="text-sm text-muted" style="width:80px">Stakeholder</span><input type="range" min="0" max="100" value="'+t.stake+'" id="mat-stake-'+t.id+'" oninput="updateMateriality()"><span class="mat-val" id="mat-stake-val-'+t.id+'">'+t.stake+'</span></div>';
    container.appendChild(row);

    var tr = document.createElement('tr');
    tr.id = 'mat-row-'+t.id;
    tr.innerHTML = '<td><strong>'+t.label+'</strong></td><td>'+t.pillar+'</td><td id="mat-td-def-'+t.id+'">'+t.def+'</td><td id="mat-td-stake-'+t.id+'">'+t.stake+'</td><td id="mat-td-status-'+t.id+'"></td>';
    tbody.appendChild(tr);
  });

  updateMateriality();
  setTimeout(function() { renderMaterialityMatrix(); }, 200);
}

function updateMateriality() {
  materialityTopics.forEach(function(t) {
    var defEl = document.getElementById('mat-def-'+t.id);
    var stakeEl = document.getElementById('mat-stake-'+t.id);
    if (!defEl || !stakeEl) return;
    var def = parseInt(defEl.value), stake = parseInt(stakeEl.value);
    document.getElementById('mat-def-val-'+t.id).textContent = def;
    document.getElementById('mat-stake-val-'+t.id).textContent = stake;
    document.getElementById('mat-td-def-'+t.id).textContent = def;
    document.getElementById('mat-td-stake-'+t.id).textContent = stake;
    var sum = def + stake;
    var cls = sum > 140 ? 'badge-green' : sum > 100 ? 'badge-amber' : 'badge-gray';
    var lbl = sum > 140 ? 'Material' : sum > 100 ? 'Consider' : 'Low';
    var status = document.getElementById('mat-td-status-'+t.id);
    if (status) status.innerHTML = '<span class="badge '+cls+'">'+lbl+'</span>';
    var pt = document.getElementById('mat-pt-'+t.id);
    if (pt) { pt.setAttribute('cx', stake * 0.7 + 40); pt.setAttribute('cy', 240 - def * 2); }
  });
  updateMaterialCount();
}

function updateMaterialCount() {
  var count = 0;
  materialityTopics.forEach(function(t) {
    var def = parseInt(document.getElementById('mat-def-'+t.id)?.value || 0);
    var stake = parseInt(document.getElementById('mat-stake-'+t.id)?.value || 0);
    if (def + stake > 140) count++;
  });
  document.getElementById('material-count').textContent = count + ' material topics';
}

// ── FILTER MATERIALITY TOPICS ───────────────────────────
function filterMaterialityTopics() {
  var q = (document.getElementById('mat-search')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.mat-slider-row').forEach(function(row) {
    var label = row.querySelector('label')?.textContent?.toLowerCase() || '';
    row.style.display = !q || label.indexOf(q) > -1 ? '' : 'none';
  });
}

function renderMaterialityMatrix() {
  var container = document.getElementById('chart-materiality');
  if (!container) return;
  var pts = materialityTopics.map(function(t) {
    var def = parseInt(document.getElementById('mat-def-'+t.id)?.value || t.def);
    var stake = parseInt(document.getElementById('mat-stake-'+t.id)?.value || t.stake);
    var cx = stake * 0.7 + 40, cy = 240 - def * 2;
    var colors = {E:'#1D9E75',S:'#378ADD',G:'#7F77DD',GF:'#E8A020'};
    return '<circle id="mat-pt-'+t.id+'" cx="'+cx+'" cy="'+cy+'" r="7" fill="'+(colors[t.pillar]||'#1D9E75')+'" opacity="0.85" stroke="#fff" stroke-width="2.5" cursor="pointer" data-label="'+t.label+'" data-impact="'+def+'" data-stake="'+stake+'" data-pillar="'+t.pillar+'"></circle>';
  }).join('');

  container.innerHTML = '<svg id="mat-matrix-svg" width="100%" height="280" viewBox="0 0 280 280" style="display:block;margin:0 auto;max-width:280px">' +
    '<rect x="0" y="0" width="280" height="280" fill="#F7F5F0" rx="6"/>' +
    '<line x1="40" y1="240" x2="240" y2="240" stroke="#DEDEDE" stroke-width="1"/>' +
    '<line x1="40" y1="200" x2="240" y2="200" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="40" y1="160" x2="240" y2="160" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="40" y1="120" x2="240" y2="120" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="40" y1="80" x2="240" y2="80" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="40" y1="40" x2="240" y2="40" stroke="#DEDEDE" stroke-width="1"/>' +
    '<line x1="40" y1="40" x2="40" y2="240" stroke="#DEDEDE" stroke-width="1"/>' +
    '<line x1="110" y1="40" x2="110" y2="240" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="180" y1="40" x2="180" y2="240" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="4,4"/>' +
    '<line x1="240" y1="40" x2="240" y2="240" stroke="#DEDEDE" stroke-width="1"/>' +
    '<text x="20" y="250" font-size="10" fill="#7A7A7A" text-anchor="middle" transform="rotate(-90,20,250)">Stakeholder Importance →</text>' +
    '<text x="140" y="272" font-size="10" fill="#7A7A7A" text-anchor="middle">← ESG Impact →</text>' +
    '<rect x="40" y="40" width="70" height="100" fill="rgba(29,158,117,0.06)" rx="4"/>' +
    '<text x="75" y="70" font-size="9" fill="#1D9E75" text-anchor="middle" font-weight="600">High priority</text>' +
    '<rect x="180" y="180" width="60" height="60" fill="rgba(122,122,122,0.04)" rx="4"/>' +
    '<text x="210" y="210" font-size="9" fill="#7A7A7A" text-anchor="middle">Low</text>' + pts + '</svg>' +
    '<div style="display:flex;justify-content:center;gap:16px;margin-top:10px;font-size:11px;color:var(--ink-600, #7A7A7A)">' +
    '<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#1D9E75;display:inline-block"></span>Environmental</span>' +
    '<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#378ADD;display:inline-block"></span>Social</span>' +
    '<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#7F77DD;display:inline-block"></span>Governance</span>' +
    '<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#E8A020;display:inline-block"></span>Green Finance</span>' +
    '</div>';
  initMaterialityTooltips();
}

// ── MATERIALITY TOOLTIPS ────────────────────────────────
function initMaterialityTooltips() {
  var svg = document.getElementById('mat-matrix-svg');
  if (!svg) return;

  // Remove old tooltip if re-initializing
  var oldTip = document.getElementById('mat-tooltip');
  if (oldTip) oldTip.remove();

  var tip = document.createElement('div');
  tip.id = 'mat-tooltip';
  tip.style.cssText = 'position:fixed;z-index:999;background:#1A1A1A;color:#fff;padding:10px 14px;border-radius:8px;font-size:12px;font-family:Inter,sans-serif;line-height:1.5;pointer-events:none;opacity:0;transform:scale(0.95);transition:opacity 0.15s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 16px rgba(0,0,0,0.25);max-width:240px;border:1px solid rgba(255,255,255,0.1)';
  document.body.appendChild(tip);

  var pillarColors = {E:'#1D9E75',S:'#378ADD',G:'#7F77DD',GF:'#E8A020'};

  svg.addEventListener('mouseover', function(e) {
    var target = e.target;
    if (target.tagName !== 'circle') return;
    var label = target.getAttribute('data-label');
    var impact = target.getAttribute('data-impact');
    var stake = target.getAttribute('data-stake');
    var pillar = target.getAttribute('data-pillar');
    if (!label) return;

    var color = pillarColors[pillar] || '#1D9E75';
    var sum = parseInt(impact) + parseInt(stake);
    var statusText = sum > 140 ? 'Material' : sum > 100 ? 'Consider' : 'Low';
    var statusBg = sum > 140 ? '#1D9E75' : sum > 100 ? '#E8A020' : '#7A7A7A';

    tip.innerHTML = '<div style="font-weight:600;font-size:13px;margin-bottom:5px;color:#fff">' + label + '</div>' +
      '<div style="display:flex;gap:14px;font-size:12px;margin-bottom:5px">' +
      '<span><span style="color:rgba(255,255,255,0.5)">Impact:</span> <strong style="color:#fff">' + impact + '</strong></span>' +
      '<span><span style="color:rgba(255,255,255,0.5)">Stakeholder:</span> <strong style="color:#fff">' + stake + '</strong></span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + color + ';display:inline-block"></span>' +
      '<span style="color:rgba(255,255,255,0.5)">Pillar:</span> <span style="color:#fff">' + pillar + '</span>' +
      '<span style="margin-left:auto;background:' + statusBg + ';color:#fff;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600">' + statusText + '</span>' +
      '</div>';
    tip.style.opacity = '1';
    tip.style.transform = 'scale(1)';
    positionTip(e);
  });

  svg.addEventListener('mousemove', function(e) {
    var tipEl = document.getElementById('mat-tooltip');
    if (!tipEl || tipEl.style.opacity === '0') return;
    positionTip(e);
  });

  svg.addEventListener('mouseout', function(e) {
    var related = e.relatedTarget;
    if (related && related.closest && related.closest('#mat-matrix-svg')) return;
    var tipEl = document.getElementById('mat-tooltip');
    if (tipEl) { tipEl.style.opacity = '0'; tipEl.style.transform = 'scale(0.95)'; }
  });

  function positionTip(e) {
    var tipEl = document.getElementById('mat-tooltip');
    if (!tipEl) return;
    var x = e.clientX + 16;
    var y = e.clientY - 10;
    // Keep tooltip within viewport
    var rect = tipEl.getBoundingClientRect();
    if (x + 240 > window.innerWidth) x = e.clientX - 250;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10;
    if (y < 10) y = 10;
    tipEl.style.left = x + 'px';
    tipEl.style.top = y + 'px';
  }
}

// ── EXPORT MATERIALITY CSV ─────────────────────────────
function exportMaterialityCSV() {
  var rows = [['Topic','Pillar','Impact Score','Stakeholder Score','Total','Materiality']];
  materialityTopics.forEach(function(t) {
    var def = parseInt(document.getElementById('mat-def-'+t.id)?.value || t.def);
    var stake = parseInt(document.getElementById('mat-stake-'+t.id)?.value || t.stake);
    var sum = def + stake;
    var status = sum > 140 ? 'Material' : sum > 100 ? 'Consider' : 'Low';
    rows.push([t.label, t.pillar, def, stake, sum, status]);
  });

  var csv = rows.map(function(r) {
    return r.map(function(c) {
      var s = String(c);
      return s.indexOf(',') > -1 || s.indexOf('"') > -1 || s.indexOf('\n') > -1 ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',');
  }).join('\n');

  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'materiality-assessment-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Materiality CSV exported ✓');
}

// ── REPORT GENERATION ──────────────────────────────────
function generateReport() {
  var company = document.getElementById('company-name')?.value || 'Your Company';
  var year = document.getElementById('rep-year')?.value || '2024';
  var sector = document.getElementById('sector')?.value || 'NSE-listed';
  var achievements = document.getElementById('achievements')?.value || '';

  var btn = document.getElementById('gen-btn');
  if (!btn) return;
  btn.innerHTML = '<div class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;margin-right:8px;vertical-align:middle"></div> Generating...';

  var reportDiv = document.getElementById('report-output');
  if (!reportDiv) return;
  reportDiv.style.display = 'none';

  var eFilled = ['scope1','scope2','energy','renewable','water','waste'].filter(function(id) {
    return document.getElementById(id)?.value?.trim() || false;
  }).length;
  var sFilled = ['emp-total','emp-women','lead-women','turnover','ltir','training','community','suppliers'].filter(function(id) {
    return document.getElementById(id)?.value?.trim() || false;
  }).length;
  var gChecks = document.querySelectorAll('#gov-checks input[type=checkbox]:checked').length;

  var envPct = Math.round(eFilled / 6 * 100) || 0;
  var socPct = Math.round(sFilled / 8 * 100) || 0;
  var govPct = Math.round(gChecks / 7 * 100) || 0;
  var overall = Math.round((envPct + socPct + govPct) / 3) || 0;

  var frameworks = [];
  document.querySelectorAll('#panel-report .pill.active').forEach(function(p) { frameworks.push(p.textContent.trim()); });

  var scope1 = document.getElementById('scope1')?.value || '—';
  var scope2 = document.getElementById('scope2')?.value || '—';
  var energy = document.getElementById('energy')?.value || '—';
  var renewable = document.getElementById('renewable')?.value || '—';
  var empTotal = document.getElementById('emp-total')?.value || '—';
  var women = document.getElementById('emp-women')?.value || '—';
  var leadWomen = document.getElementById('lead-women')?.value || '—';
  var turnover = document.getElementById('turnover')?.value || '—';
  var boardSize = document.getElementById('board-size')?.value || '—';
  var boardWomen = document.getElementById('board-women')?.value || '—';
  var boardIndep = document.getElementById('independent')?.value || '—';

  setTimeout(function() {
    var r = '';
    r += '╔════════════════════════════════════════════════════════╗\n';
    r += '║        ESG & SUSTAINABILITY REPORT ' + String(year).padEnd(20) + '║\n';
    r += '╠════════════════════════════════════════════════════════╣\n';
    r += '║  Company:     ' + company.padEnd(42) + '║\n';
    r += '║  Sector:      ' + sector.padEnd(42) + '║\n';
    r += '║  Frameworks:  ' + (frameworks.join(', ') || 'GRI, NSE').padEnd(42) + '║\n';
    r += '╚════════════════════════════════════════════════════════╝\n\n';
    r += '──────────────────────────────────────────────────────────\n';
    r += '  1. EXECUTIVE SUMMARY\n';
    r += '──────────────────────────────────────────────────────────\n\n';
    r += 'This ESG report presents ' + company + "'s environmental, social, and governance performance for the financial year ended " + year + '. The report aligns with the NSE ESG Disclosure Guidance Manual (2021) and GRI Standards.' + (frameworks.includes('TCFD') ? ' Climate disclosures follow TCFD recommendations.' : '') + (frameworks.includes('GBP') ? ' Green finance activities align with ICMA Green Bond Principles.' : '') + '\n\n';
    r += '  Overall ESG Performance Score: ' + overall + '/100\n';
    r += '  Environmental: ' + envPct + '% complete\n  Social:        ' + socPct + '% complete\n  Governance:    ' + govPct + '% complete\n\n';
    r += '──────────────────────────────────────────────────────────\n';
    r += '  2. ENVIRONMENTAL (GRI 305, 302, 303, 306)\n';
    r += '──────────────────────────────────────────────────────────\n\n';
    r += '  Scope 1 Emissions (tCO₂e):     ' + scope1 + '\n';
    r += '  Scope 2 Emissions (tCO₂e):     ' + scope2 + '\n';
    r += '  Total Energy Consumption (MWh): ' + energy + '\n';
    r += '  Renewable Energy Share (%):     ' + renewable + '%\n\n';
    r += '  Kenya Context: Kenya\'s grid is ~90% renewable (geothermal, wind, solar, hydro).\n  ' + company + ' sources ' + renewable + '% of energy from renewables.\n\n';
    r += '──────────────────────────────────────────────────────────\n';
    r += '  3. SOCIAL (GRI 401-405, 403, 413)\n';
    r += '──────────────────────────────────────────────────────────\n\n';
    r += '  Total Employees:            ' + empTotal + '\n';
    r += '  Women in Workforce (%):     ' + women + '%\n';
    r += '  Women in Management (%):    ' + leadWomen + '%\n';
    r += '  Employee Turnover Rate (%): ' + turnover + '%\n\n';
    r += '──────────────────────────────────────────────────────────\n';
    r += '  4. GOVERNANCE (GRI 102, 205, 207)\n';
    r += '──────────────────────────────────────────────────────────\n\n';
    r += '  Board Size:            ' + boardSize + '\n';
    r += '  Women on Board (%):    ' + boardWomen + '%\n';
    r += '  Independent Directors: ' + boardIndep + '%\n';
    r += '  Ethics Policies:       ' + gChecks + '/7 adopted\n\n';
    if (achievements) {
      r += '──────────────────────────────────────────────────────────\n  5. KEY ACHIEVEMENTS\n──────────────────────────────────────────────────────────\n\n  ' + achievements + '\n\n';
    }
    r += '──────────────────────────────────────────────────────────\n  6. GREEN FINANCE OUTLOOK\n──────────────────────────────────────────────────────────\n\n  ' + company + ' continues to align with the CBK Green Finance Taxonomy (2024).\n  Eligible project categories include renewable energy, energy efficiency,\n  and sustainable water management. Green bonds and SLL structures\n  are under evaluation for future issuance.\n\n';
    r += '══════════════════════════════════════════════════════════\n';
    r += '  Generated by Mazingira ESG Platform\n';
    r += '  Nairobi, Kenya · ' + new Date().toLocaleDateString('en-KE') + '\n';
    r += '  Aligned with NSE ESG Guidance Manual (2021) / CBK Taxonomy\n';
    r += '══════════════════════════════════════════════════════════\n';

    reportDiv.textContent = r;
    reportDiv.style.display = 'block';
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Generate NSE ESG Report Draft';
    reportDiv.scrollIntoView({behavior:'smooth',block:'start'});
    showToast('Report generated ✓');
  }, 600);
}

// ── DOCUMENT VAULT ────────────────────────────────────
function handleDocUpload(event) {
  var files = event.target.files;
  if (!files || !files.length) return;
  var docs = JSON.parse(localStorage.getItem('esg_docs') || '[]');
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var ext = f.name.split('.').pop().toLowerCase();
    docs.push({
      name: f.name,
      size: f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : (f.size / 1024).toFixed(0) + ' KB',
      icon: ext === 'pdf' ? 'pdf' : (ext === 'docx' || ext === 'doc') ? 'doc' : (ext === 'xlsx' || ext === 'xls') ? 'xls' : 'img',
      date: new Date().toLocaleDateString()
    });
  }
  localStorage.setItem('esg_docs', JSON.stringify(docs));
  renderDocs();
  event.target.value = '';
}

function renderDocs() {
  var list = document.getElementById('doc-list');
  var count = document.getElementById('doc-count');
  var last = document.getElementById('doc-last');
  var docs = JSON.parse(localStorage.getItem('esg_docs') || '[]');
  if (!docs.length) {
    list.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><p>No documents uploaded yet.<br>Click "Upload document" to begin.</p></div>';
    count.textContent = '0';
    last.textContent = '—';
    return;
  }
  count.textContent = docs.length;
  last.textContent = docs[docs.length - 1].name.substring(0, 20) + '...';
  list.innerHTML = docs.map(function(d, i) {
    var ic = d.icon.toUpperCase();
    return '<div class="doc-item"><div class="doc-icon doc-icon-'+ic+'">'+ic+'</div><div><div class="doc-name">'+d.name.substring(0,40)+'</div><div class="doc-meta">'+d.size+' · '+d.date+'</div></div><button class="doc-remove" onclick="removeDoc('+i+')" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  }).join('');
  updateDocRequirements(docs.length);
}

function removeDoc(index) {
  var docs = JSON.parse(localStorage.getItem('esg_docs') || '[]');
  docs.splice(index, 1);
  localStorage.setItem('esg_docs', JSON.stringify(docs));
  renderDocs();
}

function updateDocRequirements(count) {
  var missing = Math.max(0, 8 - Math.min(count * 2, 8));
  document.getElementById('doc-required-count').textContent = missing;
}

// ── EXPORT / CLEAR DATA ────────────────────────────────
function exportData() {
  var data = {
    exportedAt: new Date().toISOString(),
    formData: JSON.parse(localStorage.getItem('esg_form_data') || '{}'),
    settings: JSON.parse(localStorage.getItem('esg_settings') || '{}'),
    documents: JSON.parse(localStorage.getItem('esg_docs') || '[]'),
    user: JSON.parse(localStorage.getItem('mazingira_user') || '{}')
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'mazingira-export-'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported ✓');
}

function clearData() {
  if (!confirm('Clear all ESG data? This cannot be undone.')) return;
  ['esg_form_data','esg_settings','esg_docs','esg_yearly_data','mazingira_user'].forEach(function(k) { localStorage.removeItem(k); });
  document.querySelectorAll('input, select, textarea').forEach(function(el) {
    if (el.type === 'checkbox') el.checked = false;
    else if (el.type !== 'file') el.value = '';
  });
  document.querySelectorAll('.pill.active, .check-row.checked, .instrument-card.selected').forEach(function(el) {
    el.classList.remove('active', 'checked', 'selected');
  });
  renderDocs();
  recalc();
  showToast('All data cleared');
}

// ── AI ADVISOR CHAT ───────────────────────────────────
function sendChat() {
  var input = document.getElementById('chat-input');
  var msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addChatMessage('user', msg);
  var loadingEl = addChatLoading();
  setTimeout(function() {
    if (loadingEl) loadingEl.remove();
    addChatMessage('ai', generateAdvisorResponse(msg));
  }, 600 + Math.random() * 400);
}

function askAdvisor(text) {
  addChatMessage('user', text);
  var loadingEl = addChatLoading();
  setTimeout(function() {
    if (loadingEl) loadingEl.remove();
    addChatMessage('ai', generateAdvisorResponse(text));
  }, 500 + Math.random() * 300);
}

function addChatMessage(role, text) {
  var container = document.getElementById('chat-messages');
  if (!container) return;
  var div = document.createElement('div');
  div.className = 'chat-bubble ' + role;
  if (role === 'ai') {
    div.innerHTML = '<div class="ai-label">Mazingira Advisor</div>' + text;
  } else {
    div.textContent = text;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addChatLoading() {
  var container = document.getElementById('chat-messages');
  if (!container) return null;
  var div = document.createElement('div');
  div.className = 'chat-bubble ai';
  div.id = 'chat-loading';
  div.innerHTML = '<div class="ai-label">Mazingira Advisor</div><div style="display:flex;gap:6px;padding:4px 0"><span style="width:8px;height:8px;border-radius:50%;background:#1D9E75;animation:pulse 1s infinite"></span><span style="width:8px;height:8px;border-radius:50%;background:#1D9E75;animation:pulse 1s infinite;animation-delay:0.2s"></span><span style="width:8px;height:8px;border-radius:50%;background:#1D9E75;animation:pulse 1s infinite;animation-delay:0.4s"></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function generateAdvisorResponse(query) {
  var q = query.toLowerCase();
  if (q.includes('nse') && (q.includes('manual') || q.includes('require'))) {
    return 'The NSE ESG Disclosure Guidance Manual (2021) requires all 63 NSE-listed companies to report annually. Core areas: (1) Materiality assessment, (2) Environmental metrics (GHG, energy, water, waste), (3) Social metrics (workforce diversity, H&S, training, community), (4) Board composition & governance, (5) Stakeholder engagement, (6) Climate risk. GRI Standards recommended. Reports due alongside the integrated annual report. Enforcement expected to tighten from 2025–2026.';
  }
  if (q.includes('green bond') || (q.includes('qualify') && q.includes('kenya'))) {
    return 'To issue a green bond in Kenya: (1) Align with ICMA Green Bond Principles — define use of proceeds, project evaluation, management of proceeds, and annual reporting. (2) Map to CBK Green Finance Taxonomy (renewable energy, energy efficiency, clean transport, etc.). (3) Obtain a Second Party Opinion (SPO). (4) List on NSE green bond segment. (5) Consider Dhamana Guarantee Company (2024) for credit enhancement. Acorn Holdings issued Kenya\'s first green bond in 2019 (KES 4.3B).';
  }
  if (q.includes('cbk') || (q.includes('taxonomy') && q.includes('kenya'))) {
    return 'The CBK Green Finance Taxonomy (2024) covers 8 eligible categories: renewable energy, energy efficiency, clean transport, sustainable water & sanitation, biodiversity & land use, circular economy, climate adaptation, and green buildings. Fossil fuels excluded. Aligns with EU Taxonomy and ICMA GBP. Designed to help Kenyan banks classify green lending.';
  }
  if (q.includes('safaricom')) {
    return 'Safaricom PLC leads in ESG: (1) Annual GRI-aligned report with external assurance. (2) TCFD-aligned climate disclosures. (3) Board-level Sustainability Committee. (4) 100% renewable electricity target, net-zero by 2050. (5) KES 30B sustainability-linked loan (2023) with KPIs on gender diversity, renewable energy, digital inclusion. FY 2024 ESG score: 84/100.';
  }
  if (q.includes('kpi') || (q.includes('sustainability-linked') || q.includes('sll'))) {
    return 'For an SLL in Kenya: (1) Material KPIs — GHG reduction, renewable energy share, women in management %, water intensity, community investment. (2) SPTs — ambitious milestones. (3) Margin ratchet — ±5–15bps based on KPI achievement. (4) External verification. (5) Annual reporting. Safaricom\'s KES 30B SLL uses 3 KPIs: GHG reduction, women in leadership, digital inclusion.';
  }
  if (q.includes('mrl') || (q.includes('pesticide') || (q.includes('residue') && q.includes('europe')))) {
    return 'EU MRL Regulation (EC) 396/2005 sets maximum pesticide residue levels for all food, feed, and non-food plant products (including cut flowers). For Kenyan horticulture: (1) Know your active ingredients — only use PPPs with established EU MRLs. (2) EU retailers often apply 50–70% of the legal MRL as their private standard. (3) Pre-shipment testing at KEPHIS-accredited labs is expected. (4) Maintain a spray diary with PHI records. (5) Common non-compliant actives on Kenyan flowers include chlorpyrifos, dimethoate, and methomyl — these face strict EU scrutiny.';
  }
  if (q.includes('csddd') || (q.includes('due diligence') && q.includes('horticulture')) || (q.includes('supply chain') && q.includes('eu'))) {
    return 'The EU Corporate Sustainability Due Diligence Directive (CSDDD) adopted 2024 applies indirectly to Kenyan horticulture exporters: (1) Large EU buyers must vet their entire value chain for human rights & environmental harms. (2) Kenyan suppliers need to provide documented evidence on: labour conditions (ILO core conventions, no child/forced labour), water abstraction permits (NEMA), land tenure (no grabbing, FPIC for new sites), pesticide handling (worker safety, PPE records). (3) Recommended certifications: GlobalG.A.P., Fair Trade, Rainforest Alliance, KFC Silver/Gold. (4) Traceability from farm to EU border is essential — invest in digital record-keeping.';
  }
  if (q.includes('certification') || (q.includes('herbs') && q.includes('eu')) || (q.includes('export') && q.includes('flowers'))) {
    return 'For horticulture exports from Kenya to the EU, key certifications: (1) GlobalG.A.P. — farm-level GAP, expected by EU retailers (KES 80K–150K). (2) MPS — environmental cert for floriculture, covers PPP & energy (KES 50K–120K). (3) EU Organic (EU 2018/848) — if selling herbs as organic, requires third-party verifier (e.g. Ceres, Ecocert, EnCert). (4) Fair Trade / Rainforest Alliance — social & sustainability certs preferred by EU buyers. (5) Kenya Flower Council (KFC) Silver/Gold — local floriculture standard recognised by EU importers. Start with GlobalG.A.P. — it unlocks the most buyer doors.';
  }
  return 'I can help with: NSE ESG Disclosure, GRI Standards reporting, CBK Green Finance Taxonomy, green bond & SLL structuring, Kenya-specific sustainability benchmarks, TCFD climate risk, and EU horticulture compliance (MRLs, phytosanitary, CSDDD, certifications). What specifically would you like to know?';
}

// ── SIGN OUT ──────────────────────────────────────────
function signOut() {
  if (!confirm('Sign out? Form data stays saved locally.')) return;
  localStorage.removeItem('mazingira_user');
  window.location.href = 'landing.html';
}

// ── EU HORTICULTURE SCORING ────────────────────────────
function recalcEUHort() {
  var allChecks = document.querySelectorAll('#panel-euhorticulture .check-row input[type=checkbox]');
  if (!allChecks.length) return;

  // Count checked per category using data attributes
  var mrlChecked = 0, phytoChecked = 0, dueChecked = 0;
  allChecks.forEach(function(cb) {
    var cat = cb.closest('[data-category]') ? cb.closest('[data-category]').dataset.category : '';
    if (cat === 'mrl' && cb.checked) mrlChecked++;
    else if (cat === 'phyto' && cb.checked) phytoChecked++;
    else if (cat === 'due' && cb.checked) dueChecked++;
    // Fallback: positional detection if no data-category attribute
    if (!cat) {
      var idx = Array.prototype.indexOf.call(allChecks, cb);
      if (idx < 3 && cb.checked) mrlChecked++;
      else if (idx >= 3 && idx < 6 && cb.checked) phytoChecked++;
      else if (idx >= 6 && cb.checked) dueChecked++;
    }
  });

  var mrlPct = Math.round(mrlChecked / 3 * 100);
  var phytoPct = Math.round(phytoChecked / 3 * 100);
  var duePct = Math.round(dueChecked / 4 * 100);
  var overall = Math.round((mrlPct + phytoPct + duePct) / 3);

  var mrlEl = document.getElementById('eu-mrl-score');
  var phytoEl = document.getElementById('eu-phyto-score');
  var dueEl = document.getElementById('eu-due-score');
  var overallEl = document.getElementById('eu-overall-score');

  if (mrlEl) { mrlEl.textContent = mrlPct + '%'; mrlEl.style.color = mrlPct >= 70 ? 'var(--green-500)' : mrlPct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (phytoEl) { phytoEl.textContent = phytoPct + '%'; phytoEl.style.color = phytoPct >= 70 ? 'var(--green-500)' : phytoPct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (dueEl) { dueEl.textContent = duePct + '%'; dueEl.style.color = duePct >= 70 ? 'var(--green-500)' : duePct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (overallEl) { overallEl.textContent = overall + '%'; overallEl.style.color = overall >= 70 ? 'var(--green-500)' : overall >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }

  // Also update dashboard summary card
  var dashMrl = document.getElementById('dash-eu-mrl');
  var dashPhyto = document.getElementById('dash-eu-phyto');
  var dashDue = document.getElementById('dash-eu-due');
  var dashOverall = document.getElementById('dash-eu-overall');

  if (dashMrl) { dashMrl.textContent = mrlPct + '%'; dashMrl.style.color = mrlPct >= 70 ? 'var(--green-500)' : mrlPct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (dashPhyto) { dashPhyto.textContent = phytoPct + '%'; dashPhyto.style.color = phytoPct >= 70 ? 'var(--green-500)' : phytoPct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (dashDue) { dashDue.textContent = duePct + '%'; dashDue.style.color = duePct >= 70 ? 'var(--green-500)' : duePct >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
  if (dashOverall) { dashOverall.textContent = overall + '%'; dashOverall.style.color = overall >= 70 ? 'var(--green-500)' : overall >= 40 ? 'var(--amber-500)' : 'var(--red-500)'; }
}

// ── INIT ──────────────────────────────────────────────
(function() {
  updateDeadline();
  initAutoSave();
  loadSavedData();
  // Restore emissions calculator display values
  if (typeof loadEmissionsData === "function") loadEmissionsData();
  loadSettings();
  seedDefaultYearlyData();
  setTimeout(function() { recalc(); }, 300);

  // Check renderDocs is available (not yet if DOM incomplete)
  if (document.getElementById('doc-list')) renderDocs();

  // Render year pills in Trends panel
  if (document.getElementById('year-pills')) renderYearPills();

  // Initialise EU Horticulture dashboard summary
  setTimeout(function() { recalcEUHort(); }, 500);

  // Load user info
  var userData = JSON.parse(localStorage.getItem('mazingira_user') || '{}');
  if (userData.company) {
    ['welcome-company', 'sidebar-company', 's-company'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = userData.company;
    });
  }

  // Animate dashboard on load
  setTimeout(function() { animatePanel('dashboard'); }, 200);

  // Fix: Add sign-out to company pill click
  var companyPill = document.querySelector('.company-pill');
  if (companyPill) companyPill.addEventListener('click', signOut);
})();
