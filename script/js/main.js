// Intialiser la carte
const map = L.map('map').setView([43.58, 1.21], 9);

// Ajouter le fond de plan OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Ajouter le vecteur de l'emprise
var emprise = L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
  layers: 'lnavarro:emprise_etude',
  format: 'image/png',
  transparent: true,
  version: '1.1.0'
}).addTo(map);

// Définition des couches WMS
const wmsLayers = {
  Serie_temp_NDVI: L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
    layers: 'lnavarro:Serie_temp_S2_ndvi',
    format: 'image/png',
    transparent: true,
    version: '1.1.0'
  }),
  Classification_pixel: L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
    layers: 'lnavarro:carte_essences_echelle_pixel',
    format: 'image/png',
    transparent: true,
    version: '1.1.0'
  })
};

// Création du panneau de droite avec le contrôle des couches
const legend = document.querySelector('.legend');
legend.innerHTML = '<h3>Couches raster</h3>';

Object.entries(wmsLayers).forEach(([name, layer]) => {
  const layerDiv = document.createElement('div');
  layerDiv.className = 'legend-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.className = 'layer-toggle';

  const label = document.createElement('label');
  label.htmlFor = name;
  label.textContent = name;

  // Ajoute la gestion de l'affichage des couches et des graphes
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      layer.addTo(map);
      if (name === 'Serie_temp_NDVI') {
        document.getElementById('bar-plot').style.display = 'block';
      }
      if (name === 'Classification_pixel') {
        document.getElementById('bar-plot-2').style.display = 'block';
      }
    } else {
      layer.remove();
      if (name === 'Serie_temp_NDVI') {
        document.getElementById('bar-plot').style.display = 'none';
      }
      if (name === 'Classification_pixel') {
        document.getElementById('bar-plot-2').style.display = 'none';
      }
    }
  });

  layerDiv.appendChild(checkbox);
  layerDiv.appendChild(label);
  legend.appendChild(layerDiv);
});
