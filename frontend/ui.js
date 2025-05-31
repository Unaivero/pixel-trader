// ui.js - Handles UI logic, watchlist, selectors, loading, error, and ties everything together
import { fetchCandles, fetchCompanyInfo, fetchCompanyNews } from './api.js';
import { renderChart } from './chart.js';
import { calculatePerformanceMetrics, renderPerformancePanel } from './performance.js';

const WATCHLIST_KEY = 'pixel_trader_watchlist';
let watchlist = [];
let selectedSymbol = 'AAPL';
let selectedPeriod = '1mo';
let selectedInterval = '1d';
let currentTheme = localStorage.getItem('pixel_trader_theme') || 'dark';
let currentData = []; // Store current chart data for export

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
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      errDiv.style.display = 'none';
    }, 5000);
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
    currentData = data; // Store for export
    
    renderChart(data, {
      showMA: document.getElementById('maToggle').checked,
      maType: document.getElementById('maType').value,
      maPeriod: parseInt(document.getElementById('maPeriod').value) || 10,
      theme: currentTheme
    });
    
    // Calculate and display performance metrics
    const metrics = calculatePerformanceMetrics(data);
    renderPerformancePanel(metrics, selectedSymbol);
    
    showNotification(`${selectedSymbol} chart updated`, 'success');
  } catch (err) {
    showError(err.message || 'Failed to load chart data');
    showNotification('Failed to load data', 'error');
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
  setupKeyboardShortcuts();
  setTheme(currentTheme);
  loadAndRender();
  updateCompanyPanel(selectedSymbol);
  
  document.getElementById('addToWatchlistBtn').onclick = () => {
    const input = document.getElementById('symbolInput');
    addToWatchlist(input.value);
    input.value = '';
    input.focus(); // Keep focus for easy multiple additions
    renderWatchlist();
    loadAndRender();
    updateCompanyPanel(selectedSymbol);
  };
  
  // Add Enter key support for symbol input
  document.getElementById('symbolInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('addToWatchlistBtn').click();
    }
  });
  
  document.getElementById('fetchBtn').onclick = () => {
    loadAndRender();
    updateCompanyPanel(selectedSymbol);
  };
  
  // Export functionality
  document.getElementById('exportBtn').onclick = () => {
    exportData();
  };
  
  // Theme toggle button
  let themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) {
    themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggleBtn';
    themeBtn.textContent = '🎨 Theme';
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
  chartDiv.setAttribute('role', 'img');
};

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    switch(e.key.toLowerCase()) {
      case 'r':
        e.preventDefault();
        loadAndRender();
        showNotification('Chart refreshed');
        break;
      case 't':
        e.preventDefault();
        toggleTheme();
        break;
      case '/':
        e.preventDefault();
        document.getElementById('symbolInput').focus();
        break;
      case 'escape':
        e.preventDefault();
        showError(''); // Clear errors
        break;
    }
  });
}

function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      z-index: 1000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  // Set style based on type
  const styles = {
    info: 'background: #0ff; color: #111;',
    success: 'background: #0f0; color: #111;',
    error: 'background: #f44; color: #fff;'
  };
  
  notification.style.cssText += styles[type] || styles.info;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 3000);
}

function exportData() {
  if (!currentData || currentData.length === 0) {
    showNotification('No data to export', 'error');
    return;
  }
  
  try {
    // Create CSV content
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const csvContent = [
      headers.join(','),
      ...currentData.map(d => [
        d.date || d.time,
        d.open,
        d.high, 
        d.low,
        d.close,
        d.volume || 0
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSymbol}_${selectedPeriod}_${selectedInterval}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
  } catch (error) {
    showNotification('Export failed', 'error');
    console.error('Export error:', error);
  }
}
