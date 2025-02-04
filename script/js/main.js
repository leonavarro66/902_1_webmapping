// Initialiser la carte
const map = L.map('map').setView([43.58, 1.21], 9);

// Ajouter le fond de plan OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Ajouter le vecteur de l'emprise
const emprise = L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
  layers: 'lnavarro:emprise_etude',
  format: 'image/png',
  transparent: true,
  version: '1.1.0'
}).addTo(map);

// Définition des couches WMS et des graphes associés
const wmsLayers = {
  Serie_temp_NDVI: {
    layer: L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
      layers: 'lnavarro:Serie_temp_S2_ndvi',
      format: 'image/png',
      transparent: true,
      version: '1.1.0'
    }),
    plotId: 'bar-plot'
  },
  Classification_pixel: {
    layer: L.tileLayer.wms('https://www.geotests.net/geoserver/lnavarro/wms', {
      layers: 'lnavarro:carte_essences_echelle_pixel',
      format: 'image/png',
      transparent: true,
      version: '1.1.0'
    }),
    plotId: 'bar-plot-2'
  }
};

// Fonction pour récupérer la légende WMS de la couche Classification_pixel
function loadWMSLegend() {
  const legendContainer = document.getElementById('wms-legend');

  // URL du GetLegendGraphic pour la couche 'Classification_pixel'
  const legendUrl = 'https://www.geotests.net/geoserver/lnavarro/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=lnavarro:carte_essences_echelle_pixel&format=image/png&transparent=true';

  // Créer une nouvelle image pour la légende
  const legendImg = document.createElement('img');
  legendImg.src = legendUrl;
  legendImg.alt = 'Symbologie de la couche Classification Pixel';

  // Ajouter l'image à la section légende
  legendContainer.innerHTML = ''; // Réinitialiser le contenu précédent
  legendContainer.appendChild(legendImg);
}

// Fonction pour gérer l'affichage des couches et graphiques
function toggleLayer(checkbox, layerObj) {
  if (checkbox.checked) {
    layerObj.layer.addTo(map);
    document.getElementById(layerObj.plotId).style.display = 'block';
    if (layerObj.layer.options.layers === "lnavarro:carte_essences_echelle_pixel") {
      loadWMSLegend();
    }
  } else {
    map.removeLayer(layerObj.layer);
    document.getElementById(layerObj.plotId).style.display = 'none';
    if (layerObj.layer.options.layers === "lnavarro:carte_essences_echelle_pixel") {
      const legendContainer = document.getElementById('wms-legend');
      legendContainer.innerHTML = "";
    }
  }
}

// Création du panneau de gestion des couches
const legend = document.querySelector('.legend');
legend.innerHTML = '<h3>Gestion des couches</h3>';

Object.entries(wmsLayers).forEach(([name, layerObj]) => {
  const layerDiv = document.createElement('div');
  layerDiv.className = 'legend-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.className = 'layer-toggle';

  const label = document.createElement('label');
  label.htmlFor = name;
  label.textContent = name;

  checkbox.addEventListener('change', () => toggleLayer(checkbox, layerObj));

  layerDiv.appendChild(checkbox);
  layerDiv.appendChild(label);
  legend.appendChild(layerDiv);
});

// Fonction pour zoomer sur une image
function zoomImage(event) {
  const imgSrc = event.target.src;
  const zoomedImage = document.getElementById('zoomed-image');
  const zoomOverlay = document.getElementById('zoom-overlay');

  // Modifier la source de l'image zoomée
  zoomedImage.src = imgSrc;

  // Afficher le conteneur de zoom
  zoomOverlay.style.display = 'flex';
}

// Fonction pour fermer le zoom (cliquer sur l'overlay)
function closeZoom() {
  const zoomOverlay = document.getElementById('zoom-overlay');
  zoomOverlay.style.display = 'none';
}

// Ajouter l'événement de clic sur les images
const images = document.querySelectorAll('#bar-plot, #bar-plot-2');
images.forEach(img => {
  img.addEventListener('click', zoomImage);
});

// Ajouter l'événement de clic pour fermer le zoom
const zoomOverlay = document.getElementById('zoom-overlay');
zoomOverlay.addEventListener('click', closeZoom);
