// ui.js - Handles UI logic, watchlist, selectors, loading, error, and ties everything together
import { fetchCandles, fetchCompanyInfo, fetchCompanyNews } from './api.js';
import { renderChart } from './chart.js';

const WATCHLIST_KEY = 'pixel_trader_watchlist';
let watchlist = [];
let selectedSymbol = 'AAPL';
let selectedPeriod = '1mo';
let selectedInterval = '1d';
let currentTheme = localStorage.getItem('pixel_trader_theme') || 'dark';

function setTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('pixel_trader_theme', theme);
}
function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function showLoading(show) {
  document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}
function showError(msg) {
  const errDiv = document.getElementById('errorMessage');
  if (msg) {
    errDiv.textContent = msg;
    errDiv.style.display = 'inline-block';
  } else {
    errDiv.textContent = '';
    errDiv.style.display = 'none';
  }
}

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
      updateCompanyPanel(selectedSymbol);
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
      updateCompanyPanel(selectedSymbol);
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

async function loadAndRender() {
  showError('');
  showLoading(true);
  try {
    const data = await fetchCandles(selectedSymbol, selectedPeriod, selectedInterval);
    renderChart(data, {
      showMA: document.getElementById('maToggle').checked,
      maType: document.getElementById('maType').value,
      maPeriod: parseInt(document.getElementById('maPeriod').value) || 10,
      theme: currentTheme
    });
  } catch (err) {
    showError(err.message || 'Failed to load chart data');
  } finally {
    showLoading(false);
  }
}

function setupMAControls() {
  document.getElementById('maToggle').onchange = loadAndRender;
  document.getElementById('maType').onchange = loadAndRender;
  document.getElementById('maPeriod').onchange = loadAndRender;
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

window.onload = () => {
  // animateNeonGrid(); // If you have this function, import or define it here
  loadWatchlist();
  renderWatchlist();
  setupSelectors();
  setupMAControls();
  setTheme(currentTheme);
  loadAndRender();
  updateCompanyPanel(selectedSymbol);
  document.getElementById('addToWatchlistBtn').onclick = () => {
    addToWatchlist(document.getElementById('symbolInput').value);
    document.getElementById('symbolInput').value = '';
    renderWatchlist();
    loadAndRender();
    updateCompanyPanel(selectedSymbol);
  };
  document.getElementById('fetchBtn').onclick = () => {
    loadAndRender();
    updateCompanyPanel(selectedSymbol);
  };
  // Theme toggle button
  let themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) {
    themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggleBtn';
    themeBtn.textContent = 'Toggle Theme';
    themeBtn.style.marginLeft = '16px';
    themeBtn.onclick = () => {
      toggleTheme();
      loadAndRender();
    };
    document.querySelector('.controls').appendChild(themeBtn);
  }
  // Keyboard accessibility for chart
  const chartDiv = document.getElementById('chart');
  chartDiv.setAttribute('tabindex', '0');
  chartDiv.setAttribute('aria-label', 'Candlestick chart area');
};
