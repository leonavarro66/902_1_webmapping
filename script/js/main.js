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

let isClassificationActive = false;

function updateCursor() {
  if (isClassificationActive) {
    map._container.style.cursor = "pointer"; // Curseur interactif
  } else {
    map._container.style.cursor = ""; // Curseur par défaut
  }
}

function toggleLayer(checkbox, layerObj) {
  if (checkbox.checked) {
    layerObj.layer.addTo(map);
    document.getElementById(layerObj.plotId).style.display = 'block';

    if (layerObj.layer.options.layers === "lnavarro:carte_essences_echelle_pixel") {
      isClassificationActive = true;
      loadWMSLegend();
    } else {
      // Si une autre couche est activée après, on désactive l'interaction sur Classification Pixel
      isClassificationActive = false;
    }

  } else {
    map.removeLayer(layerObj.layer);
    document.getElementById(layerObj.plotId).style.display = 'none';

    if (layerObj.layer.options.layers === "lnavarro:carte_essences_echelle_pixel") {
      isClassificationActive = false;
      document.getElementById('wms-legend').innerHTML = "";
    }
  }

  updateCursor(); // Met à jour le curseur en fonction de l'état
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

function showPopup(latlng, content) {
  L.popup()
    .setLatLng(latlng)
    .setContent(content)
    .openOn(map);
}

// Mapping des clés valeurs
const essencesMapping = {
  0: "NoData",
  11: "Autres feuillus",
  12: "Chêne",
  13: "Robinier",
  14: "Peupleraie",
  21: "Autres conifères autre que pin",
  23: "Douglas",
  24: "Pin laricio ou pin noir"
};

function getFeatureInfo(latlng) {

  if (!isClassificationActive) return;


  const wmsUrl = "https://www.geotests.net/geoserver/lnavarro/wms";

  // Paramètres de la requête GetFeatureInfo
  const params = {
    service: "WMS",
    version: "1.1.1",
    request: "GetFeatureInfo",
    layers: "lnavarro:carte_essences_echelle_pixel",
    query_layers: "lnavarro:carte_essences_echelle_pixel",
    styles: "",
    bbox: map.getBounds().toBBoxString(),
    width: map.getSize().x,
    height: map.getSize().y,
    srs: "EPSG:4326",
    format: "image/png",
    transparent: "true",
    info_format: "application/json",  // JSON pour récupérer la valeur
    x: Math.round(map.latLngToContainerPoint(latlng).x),
    y: Math.round(map.latLngToContainerPoint(latlng).y)
  };

  // Construire l'URL finale
  const url = wmsUrl + "?" + new URLSearchParams(params).toString();

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        const code = data.features[0].properties.GRAY_INDEX;
        const essence = essencesMapping[code] || "Inconnu"; // Récupère le nom ou "Inconnu" si absent

        // Création d'un affichage plus stylisé avec HTML
        const popupContent = `
                    <div style="font-family: Arial, sans-serif; font-size: 14px;">
                        <strong>Valeur du pixel :</strong> ${code} <br>
                        <strong>Essence associée :</strong> ${essence}
                    </div>
                `;

        showPopup(latlng, popupContent);
      } else {
        showPopup(latlng, "Aucune donnée trouvée.");
      }
    })
    .catch(error => console.error("Erreur GetFeatureInfo:", error));
}

map.on('click', function (e) {
  getFeatureInfo(e.latlng);
});