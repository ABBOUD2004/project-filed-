let map = null;
let markers = [];
let mapInitialized = false;

window.initCriminalMap = function() {
  if (mapInitialized) return;
  const container = document.getElementById('criminalMap');
  if (!container) return;
  mapInitialized = true;
  
  // Initialize map centered on Cairo, Egypt
  map = L.map('criminalMap', {
    center: [30.0444, 31.2357],
    zoom: 6,
    zoomControl: true
  });
  
  // Use dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  
  // Force map to recalculate size (needed when tab is initially hidden)
  setTimeout(() => { map.invalidateSize(); }, 200);
}

window.refreshMapMarkers = async function(criminals) {
  if (!map) return;
  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  
  // Add marker for each criminal with lat/lng
  criminals.forEach(criminal => {
    if (!criminal.lat || !criminal.lng) return;
    
    // Custom colored icon based on danger level
    const colors = { high: '#ef4444', medium: '#eab308', low: '#22c55e' };
    const color = colors[criminal.dangerLevel] || '#3b82f6';
    
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:${color}; width:14px; height:14px; border-radius:50%; border:3px solid rgba(255,255,255,0.8); box-shadow:0 0 10px ${color};"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const dangerText = { high: 'عالي الخطورة', medium: 'متوسط', low: 'منخفض' };
    const statusText = { wanted: 'مطلوب', fugitive: 'هارب', surveillance: 'تحت المراقبة' };
    
    const popup = `
      <div style="direction:rtl; font-family:Cairo,sans-serif; min-width:180px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          ${criminal.photo ? `<img src="${criminal.photo}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">` : ''}
          <div>
            <strong style="font-size:14px;">${criminal.name}</strong><br>
            <span style="font-size:11px; color:#888;">${criminal.idNumber}</span>
          </div>
        </div>
        <div style="font-size:12px;">
          <span style="color:${color}; font-weight:bold;">⚠ ${dangerText[criminal.dangerLevel] || ''}</span>
          — ${statusText[criminal.status] || ''}
        </div>
        ${criminal.city ? `<div style="font-size:11px; color:#aaa; margin-top:4px;"> ${[criminal.city, criminal.district].filter(Boolean).join(' - ')}</div>` : ''}
      </div>
    `;
    
    const marker = L.marker([criminal.lat, criminal.lng], { icon }).addTo(map).bindPopup(popup);
    markers.push(marker);
    
    // Add danger circle
    const circleColor = color;
    const radius = criminal.dangerLevel === 'high' ? 2000 : criminal.dangerLevel === 'medium' ? 1500 : 1000;
    const circle = L.circle([criminal.lat, criminal.lng], {
      radius,
      color: circleColor,
      fillColor: circleColor,
      fillOpacity: 0.08,
      weight: 1
    }).addTo(map);
    markers.push(circle);
  });
  
  // Fit map to markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}
