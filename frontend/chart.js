// chart.js - Handles D3 chart rendering for Pixel Trader

// --- Moving Average Calculations ---
export function calcSMA(data, period) {
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
export function calcEMA(data, period) {
  let ema = [];
  let k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].close;
      ema.push(sum / period);
    } else {
      ema.push(data[i].close * k + ema[i - 1] * (1 - k));
    }
  }
  return ema;
}

// --- Chart Rendering ---
export function renderChart(data, options = {}) {
  d3.select('#chart').selectAll('*').remove();
  
  // Responsive sizing
  const container = document.getElementById('chart');
  const containerWidth = container.offsetWidth || 800;
  const width = Math.min(containerWidth, 1000);
  const height = Math.max(500, width * 0.6);
  const margin = {left: 60, right: 20, top: 20, bottom: 80};
  const priceHeight = height - 150;
  const volumeHeight = 80;
  
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
    
  if (!data || data.length === 0) {
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f44')
      .attr('font-size', 24)
      .text('No data');
    return;
  }
  
  // Parse time and ensure data quality
  const parseTime = d3.timeParse('%Y-%m-%d');
  data.forEach(d => { 
    d.time = parseTime(d.date || d.time);
    if (!d.time) d.time = new Date(d.date || d.time);
    // Ensure all values are numbers
    d.open = +d.open;
    d.high = +d.high;
    d.low = +d.low;
    d.close = +d.close;
    d.volume = +d.volume || 0;
  });
  
  // Scales for price chart
  const x = d3.scaleBand()
    .domain(data.map(d => d.time))
    .range([margin.left, width - margin.right])
    .padding(0.3);
    
  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.low),
      d3.max(data, d => d.high)
    ]).nice()
    .range([priceHeight - margin.bottom, margin.top]);
    
  // Volume scale
  const volumeY = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.volume)])
    .range([height - 20, priceHeight + 20]);
  
  // Create price chart group
  const priceGroup = svg.append('g').attr('class', 'price-chart');
  
  // Create volume chart group  
  const volumeGroup = svg.append('g').attr('class', 'volume-chart');
  // Axes
  priceGroup.append('g')
    .attr('transform', `translate(0,${priceHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')).tickValues(x.domain().filter((d, i) => !(i % Math.ceil(data.length / 10)))))
    .attr('color', '#0ff');
    
  priceGroup.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format('$.2f')))
    .attr('color', '#0ff');
    
  // Volume axis
  volumeGroup.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(volumeY).ticks(3).tickFormat(d3.format('.2s')))
    .attr('color', '#666');
  
  // Volume bars
  volumeGroup.selectAll('.volume-bar')
    .data(data)
    .join('rect')
    .attr('class', 'volume-bar')
    .attr('x', d => x(d.time))
    .attr('y', d => volumeY(d.volume))
    .attr('width', x.bandwidth())
    .attr('height', d => volumeY(0) - volumeY(d.volume))
    .attr('fill', d => d.close > d.open ? '#0ff4' : '#ff0cf74')
    .attr('opacity', 0.6);
  
  // Candlestick bodies
  priceGroup.selectAll('.candle-body')
    .data(data)
    .join('rect')
    .attr('class', 'candle-body')
    .attr('x', d => x(d.time))
    .attr('y', d => y(Math.max(d.open, d.close)))
    .attr('width', x.bandwidth())
    .attr('height', d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
    .attr('fill', d => d.close > d.open ? '#0ff' : '#ff0cf7')
    .attr('stroke', d => d.close > d.open ? '#0ff' : '#ff0cf7')
    .attr('opacity', 0.8)
    .on('mousemove', function(event, d) {
      showTooltip(event, d);
    })
    .on('mouseleave', hideTooltip);
  
  // Candlestick wicks
  priceGroup.selectAll('.candle-wick')
    .data(data)
    .join('line')
    .attr('class', 'candle-wick')
    .attr('x1', d => x(d.time) + x.bandwidth() / 2)
    .attr('x2', d => x(d.time) + x.bandwidth() / 2)
    .attr('y1', d => y(d.high))
    .attr('y2', d => y(d.low))
    .attr('stroke', d => d.close > d.open ? '#0ff' : '#ff0cf7')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8);
  // Moving Average
  if (options.showMA) {
    let ma;
    if (options.maType === 'EMA') {
      ma = calcEMA(data, options.maPeriod);
    } else {
      ma = calcSMA(data, options.maPeriod);
    }
    const maLine = d3.line()
      .defined((d, i) => ma[i] !== null)
      .x((d, i) => x(d.time) + x.bandwidth() / 2)
      .y((d, i) => y(ma[i]));
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ff0cf7')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#glow)')
      .attr('d', maLine);
    svg.append('defs').append('filter')
      .attr('id', 'glow')
      .html('<feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>');
  }
  // Tooltip
  let tooltip = d3.select('#chart').select('.chart-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('#chart').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', '#111b')
      .style('color', '#0ff')
      .style('border', '1px solid #0ff')
      .style('border-radius', '6px')
      .style('padding', '8px 12px')
      .style('font-family', 'inherit')
      .style('font-size', '0.95rem')
      .style('z-index', 100)
      .style('display', 'none');
  }
  function showTooltip(event, d, x, y) {
    const formatDate = d3.timeFormat("%b %d, %Y");
    const formatCurrency = d3.format("$.2f");
    const formatVolume = d3.format(",");
    
    tooltip.style('display', 'block')
      .style('left', (event.offsetX + 25) + 'px')
      .style('top', (event.offsetY - 20) + 'px')
      .html(`
        <b>${formatDate(d.time)}</b><br>
        Open: ${formatCurrency(d.open)}<br>
        Close: ${formatCurrency(d.close)}<br>
        High: ${formatCurrency(d.high)}<br>
        Low: ${formatCurrency(d.low)}<br>
        ${d.volume ? `Volume: ${formatVolume(d.volume)}` : ''}
      `);
  }
  function hideTooltip() {
    tooltip.style('display', 'none');
  }
  // Theme support (future: read from options.theme)
}
