let emotionRadarChart = null;
let detectionTimelineChart = null;
let dangerPieChart = null;
let objectsBarChart = null;
let chartsInitialized = false;

window.initAnalyticsCharts = function() {
  if (chartsInitialized) return;
  chartsInitialized = true;
  
  // Set Chart.js defaults for dark theme
  Chart.defaults.color = '#8494b2';
  Chart.defaults.borderColor = '#1c2d4a';
  Chart.defaults.font.family = 'Cairo, sans-serif';
  
  // 1. Emotion Radar Chart
  const emotionCtx = document.getElementById('emotionRadarChart');
  if (emotionCtx) {
    emotionRadarChart = new Chart(emotionCtx, {
      type: 'radar',
      data: {
        labels: ['سعادة', 'حزن', 'غضب', 'خوف', 'دهشة', 'اشمئزاز', 'حياد'],
        datasets: [{
          label: 'متوسط المشاعر',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, display: false },
            grid: { color: '#1c2d4a' },
            pointLabels: { font: { size: 12, family: 'Cairo' }, color: '#8494b2' },
            angleLines: { color: '#1c2d4a' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
  
  // 2. Detection Timeline (Line Chart)
  const timelineCtx = document.getElementById('detectionTimelineChart');
  if (timelineCtx) {
    detectionTimelineChart = new Chart(timelineCtx, {
      type: 'line',
      data: {
        labels: [], // timestamps
        datasets: [
          {
            label: 'اكتشافات',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'مسحات آمنة',
            data: [],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { maxTicksLimit: 10 }, grid: { color: '#1c2d4a33' } },
          y: { beginAtZero: true, grid: { color: '#1c2d4a33' } }
        },
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } }
      }
    });
  }
  
  // 3. Danger Level Pie Chart
  const dangerCtx = document.getElementById('dangerPieChart');
  if (dangerCtx) {
    dangerPieChart = new Chart(dangerCtx, {
      type: 'doughnut',
      data: {
        labels: ['عالي الخطورة', 'متوسط الخطورة', 'منخفض الخطورة'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#ef4444', '#eab308', '#22c55e'],
          borderColor: '#131f38',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 12 } } }
        }
      }
    });
  }
  
  // 4. Objects Bar Chart
  const objectsCtx = document.getElementById('objectsBarChart');
  if (objectsCtx) {
    objectsBarChart = new Chart(objectsCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'عدد المرات',
          data: [],
          backgroundColor: 'rgba(234, 179, 8, 0.6)',
          borderColor: '#eab308',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, grid: { color: '#1c2d4a33' } },
          y: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

window.updateEmotionRadar = function(emotionAccumulator) {
  if (!emotionRadarChart || !emotionAccumulator || emotionAccumulator.count === 0) return;
  const c = emotionAccumulator.count;
  emotionRadarChart.data.datasets[0].data = [
    Math.round((emotionAccumulator.happy / c) * 100),
    Math.round((emotionAccumulator.sad / c) * 100),
    Math.round((emotionAccumulator.angry / c) * 100),
    Math.round((emotionAccumulator.fearful / c) * 100),
    Math.round((emotionAccumulator.surprised / c) * 100),
    Math.round((emotionAccumulator.disgusted / c) * 100),
    Math.round((emotionAccumulator.neutral / c) * 100)
  ];
  emotionRadarChart.update('none'); // no animation for frequent updates
}

window.addTimelinePoint = function(timeLabel, detections, safeScans) {
  if (!detectionTimelineChart) return;
  const data = detectionTimelineChart.data;
  data.labels.push(timeLabel);
  data.datasets[0].data.push(detections);
  data.datasets[1].data.push(safeScans);
  // Keep last 20 points
  if (data.labels.length > 20) {
    data.labels.shift();
    data.datasets[0].data.shift();
    data.datasets[1].data.shift();
  }
  detectionTimelineChart.update('none');
}

window.updateDangerPie = function(high, medium, low) {
  if (!dangerPieChart) return;
  dangerPieChart.data.datasets[0].data = [high, medium, low];
  dangerPieChart.update('none');
}

window.updateObjectsChart = function(objectsAccumulator) {
  if (!objectsBarChart) return;
  const sorted = Object.entries(objectsAccumulator).sort((a,b) => b[1]-a[1]).slice(0, 10);
  objectsBarChart.data.labels = sorted.map(([name]) => name);
  objectsBarChart.data.datasets[0].data = sorted.map(([,count]) => count);
  objectsBarChart.update('none');
}

window.updateStatCards = function(totalScans, criminalsFound, safeScans, threatAlerts) {
  const el = (id) => document.getElementById(id);
  if (el('statTotalScans')) el('statTotalScans').textContent = totalScans;
  if (el('statCriminalsFound')) el('statCriminalsFound').textContent = criminalsFound;
  if (el('statSafeScans')) el('statSafeScans').textContent = safeScans;
  if (el('statThreatAlerts')) el('statThreatAlerts').textContent = threatAlerts;
}
