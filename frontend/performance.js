// performance.js - Performance indicators and statistics
export function calculatePerformanceMetrics(data) {
  if (!data || data.length < 2) return null;
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = last.close - first.close;
  const changePercent = (change / first.close) * 100;
  
  const high52w = d3.max(data, d => d.high);
  const low52w = d3.min(data, d => d.low);
  
  const avgVolume = d3.mean(data, d => d.volume);
  
  return {
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    high52w: high52w.toFixed(2),
    low52w: low52w.toFixed(2),
    avgVolume: Math.round(avgVolume).toLocaleString(),
    currentPrice: last.close.toFixed(2)
  };
}

export function renderPerformancePanel(metrics, symbol) {
  let panel = document.getElementById('performancePanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'performancePanel';
    panel.className = 'performance-panel';
    panel.style.cssText = `
      background: rgba(0,0,0,0.85);
      border: 2px solid #0ff;
      border-radius: 10px;
      padding: 16px;
      margin-top: 16px;
      color: #0ff;
      font-family: inherit;
    `;
    document.querySelector('.main-panel').appendChild(panel);
  }
  
  if (!metrics) {
    panel.innerHTML = '<div>No performance data available</div>';
    return;
  }
  
  const isPositive = parseFloat(metrics.change) >= 0;
  const changeColor = isPositive ? '#0f0' : '#f44';
  
  panel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #ff0cf7;">${symbol} Performance</h3>
      <div style="color: ${changeColor}; font-size: 1.2rem; font-weight: bold;">
        ${isPositive ? '+' : ''}$${metrics.change} (${isPositive ? '+' : ''}${metrics.changePercent}%)
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; font-size: 0.9rem;">
      <div>
        <div style="color: #666;">Current</div>
        <div style="color: #0ff; font-weight: bold;">$${metrics.currentPrice}</div>
      </div>
      <div>
        <div style="color: #666;">52W High</div>
        <div style="color: #0ff;">$${metrics.high52w}</div>
      </div>
      <div>
        <div style="color: #666;">52W Low</div>
        <div style="color: #0ff;">$${metrics.low52w}</div>
      </div>
      <div>
        <div style="color: #666;">Avg Volume</div>
        <div style="color: #0ff;">${metrics.avgVolume}</div>
      </div>
    </div>
  `;
}
