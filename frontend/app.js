const API_BASE = "http://127.0.0.1:5000/api";

// --- Watchlist logic ---
const WATCHLIST_KEY = 'pixel_trader_watchlist';
let watchlist = [];
let selectedSymbol = 'AAPL';
let selectedPeriod = '1mo';
let selectedInterval = '1d';

function saveWatchlist() {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}
function loadWatchlist() {
  try {
    watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || ['AAPL'];
  } catch { watchlist = ['AAPL']; }
}
function renderWatchlist() {
  const ul = document.getElementById('watchlist');
  ul.innerHTML = '';
  watchlist.forEach(symbol => {
    const li = document.createElement('li');
    li.textContent = symbol;
    if (symbol === selectedSymbol) li.classList.add('selected');
    li.onclick = () => {
      selectedSymbol = symbol;
      renderWatchlist();
      loadAndRender();
    };
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.onclick = (e) => {
      e.stopPropagation();
      watchlist = watchlist.filter(s => s !== symbol);
      if (selectedSymbol === symbol) {
        selectedSymbol = watchlist[0] || 'AAPL';
      }
      saveWatchlist();
      renderWatchlist();
      loadAndRender();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}
function addToWatchlist(symbol) {
  symbol = symbol.trim().toUpperCase();
  if (!symbol || watchlist.includes(symbol)) return;
  watchlist.push(symbol);
  saveWatchlist();
  renderWatchlist();
}

// --- Timeframe selector logic ---
function setupSelectors() {
  document.getElementById('periodSelect').value = selectedPeriod;
  document.getElementById('intervalSelect').value = selectedInterval;
  document.getElementById('periodSelect').onchange = e => {
    selectedPeriod = e.target.value;
    loadAndRender();
  };
  document.getElementById('intervalSelect').onchange = e => {
    selectedInterval = e.target.value;
    loadAndRender();
  };
}

// --- Data fetch logic ---
async function fetchCandles(symbol = 'AAPL', period = '1mo', interval = '1d') {
  const url = `${API_BASE}/candles?symbol=${symbol}&period=${period}&interval=${interval}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch');
  }
  const data = await res.json();
  return data.candles;
}

function calcSMA(data, period) {
  let sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
}
function calcEMA(data, period) {
  let ema = [];
  let k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      // SMA for first EMA value
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].close;
      ema.push(sum / period);
    } else {
      ema.push(data[i].close * k + ema[i - 1] * (1 - k));
    }
  }
  return ema;
}

function renderCandlesticks(data) {
  d3.select("#chart").selectAll("*").remove();
  const width = 800, height = 400, margin = {left: 60, right: 20, top: 20, bottom: 40};
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  if (!data || data.length === 0) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#f44")
      .attr("font-size", 24)
      .text("No data");
    return;
  }
  // Parse data
  const parseTime = d3.timeParse("%Y-%m-%d");
  data.forEach(d => { d.time = parseTime(d.time); });
  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.time))
    .range([margin.left, width - margin.right])
    .padding(0.3);
  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
    .range([height - margin.bottom, margin.top]);
  // Axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d"));
  const yAxis = d3.axisLeft(y);
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("font-size", 10)
    .attr("transform", "rotate(-45)");
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);
  // Candlesticks
  svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .each(function(d) {
      // Wick
      d3.select(this)
        .append("line")
        .attr("x1", x(d.time) + x.bandwidth()/2)
        .attr("x2", x(d.time) + x.bandwidth()/2)
        .attr("y1", y(d.high))
        .attr("y2", y(d.low))
        .attr("stroke", "#0ff")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "square");
      // Body
      d3.select(this)
        .append("rect")
        .attr("x", x(d.time))
        .attr("y", y(Math.max(d.open, d.close)))
        .attr("width", x.bandwidth())
        .attr("height", Math.max(1, Math.abs(y(d.open) - y(d.close))))
        .attr("fill", d.close > d.open ? "#0ff" : "#ff0cf7")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    });

  // --- Moving Average Overlay ---
  const showMA = document.getElementById('maToggle')?.checked;
  const maType = document.getElementById('maType')?.value || 'SMA';
  const maPeriod = parseInt(document.getElementById('maPeriod')?.value || '10');
  if (showMA && maPeriod > 1 && maPeriod < data.length) {
    let ma;
    if (maType === 'EMA') {
      ma = calcEMA(data, maPeriod);
    } else {
      ma = calcSMA(data, maPeriod);
    }
    const maLine = d3.line()
      .defined((d, i) => ma[i] !== null)
      .x((d, i) => x(d.time) + x.bandwidth()/2)
      .y((d, i) => y(ma[i]));
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ff0cf7')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#glow)')
      .attr('d', maLine);
    // Neon glow filter
    svg.append('defs').append('filter')
      .attr('id', 'glow')
      .html('<feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>');
  }
}


// Neon grid animation
function animateNeonGrid() {
  const canvas = document.getElementById('neonGrid');
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeStyle = `rgba(0,255,255,${0.08 + 0.08*Math.sin(t + (x+y)/200)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    t += 0.03;
    requestAnimationFrame(draw);
  }
  draw();
}

// UI logic
async function loadAndRender() {
  document.getElementById('loading').style.display = '';
  document.getElementById('error').style.display = 'none';
  try {
    const candles = await fetchCandles(selectedSymbol, selectedPeriod, selectedInterval);
    renderCandlesticks(candles);
  } catch (e) {
    document.getElementById('error').textContent = e.message;
    document.getElementById('error').style.display = '';
    d3.select("#chart").selectAll("*").remove();
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

document.getElementById('fetchBtn').onclick = () => {
  loadAndRender();
};

document.getElementById('addToWatchlistBtn').onclick = () => {
  const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
  if (symbol) {
    addToWatchlist(symbol);
    selectedSymbol = symbol;
    renderWatchlist();
    loadAndRender();
  }
};

document.getElementById('symbolInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.getElementById('addToWatchlistBtn').click();
  }
});

function setupMAControls() {
  document.getElementById('maToggle').onchange = loadAndRender;
  document.getElementById('maType').onchange = loadAndRender;
  document.getElementById('maPeriod').onchange = loadAndRender;
}
// --- Company Info & News ---
async function fetchCompanyInfo(symbol) {
  // FMP free endpoint
  const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=demo`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No company info');
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) throw new Error('No company info');
    return data[0];
  } catch {
    return null;
  }
}
async function fetchCompanyNews(symbol) {
  // FMP free endpoint
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=8&apikey=demo`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No news');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('No news');
    return data;
  } catch {
    return [];
  }
}
function renderCompanyInfo(info) {
  const logoDiv = document.getElementById('companyLogo');
  const nameDiv = document.getElementById('companyName');
  const sectorDiv = document.getElementById('companySector');
  if (!info) {
    logoDiv.innerHTML = '';
    nameDiv.textContent = '';
    sectorDiv.textContent = '';
    return;
  }
  logoDiv.innerHTML = info.image ? `<img src="${info.image}" alt="logo" />` : '';
  nameDiv.textContent = info.companyName || info.symbol;
  sectorDiv.textContent = info.sector ? `Sector: ${info.sector}` : '';
}
function renderNews(news) {
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '';
  if (!news || news.length === 0) {
    newsList.innerHTML = '<li>No news found.</li>';
    return;
  }
  news.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.textContent = item.title;
    li.appendChild(a);
    if (item.publishedDate) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'news-date';
      dateSpan.textContent = ' ' + item.publishedDate;
      li.appendChild(dateSpan);
    }
    newsList.appendChild(li);
  });
}
async function updateCompanyPanel(symbol) {
  renderCompanyInfo(null);
  renderNews([]);
  if (!symbol) return;
  fetchCompanyInfo(symbol).then(renderCompanyInfo);
  fetchCompanyNews(symbol).then(renderNews);
}

// Initial load
window.onload = () => {
  animateNeonGrid();
  loadWatchlist();
  renderWatchlist();
  setupSelectors();
  setupMAControls();
  loadAndRender();
  updateCompanyPanel(selectedSymbol);
};

// Update company/news when symbol changes
function onSymbolChange() {
  updateCompanyPanel(selectedSymbol);
}
// Hook into symbol selection
const origRenderWatchlist = renderWatchlist;
renderWatchlist = function() {
  origRenderWatchlist.apply(this, arguments);
  updateCompanyPanel(selectedSymbol);
};
