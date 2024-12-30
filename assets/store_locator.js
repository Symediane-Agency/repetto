var map;
var positionMarker;
var markers;
var stores;
var mapIcon;
var mapIconSelected;
var mapIconCluster;
var markerCluster;
var bounds;

// Alpine
document.addEventListener('alpine:init', () => {
  Alpine.data('store_locator', () => ({
    tagFilter: "All",
    popupOpen: true,

    updateFilters() {
      
      const markersToAdd = []
      for (const marker of markers) {
        if (this.tagFilter == "All") {
          marker.setVisible(true)
          markersToAdd.push(marker)
        }
        else {
          if (marker.store.tags.includes(this.tagFilter)) {
            marker.setVisible(true)
            markersToAdd.push(marker)
          }
          else {
            marker.setVisible(false)
          }
        }
      }

      markerCluster.clearMarkers();
      markerCluster.addMarkers(markersToAdd)

      document.querySelectorAll('.store-item').forEach((item) => {
        if (this.tagFilter == "All") {
          item.classList.remove('hidden')
        }
        else {
          if (item.getAttribute('data-tags').includes(this.tagFilter)) {
            item.classList.remove('hidden')
          }
          else {
            item.classList.add('hidden')
          }
        }
      })
    }
  }))

  Alpine.data('store_list', () => ({
    selectedStore: null,
    stores: [],

    init() {
      fetch("https://xnkosumdt5.execute-api.eu-west-3.amazonaws.com/prod/getStoreLocators")
        .then((response) => response.json())
        .then((json) => {
          
          json.forEach(store => {
            // Assuming store.tags is an array of tags
            // translation object will come from the liquid template
            if(store.tags){
              store.tags = store.tags.map(tag => SHOPIFY_TRANSLATIONS[tag] || tag);
            }
          });
          
          this.stores = json;
          stores = json

          initMaps()
        });
    },

    selectStore(latlng) {

      this.selectedStore = latlng;
      let selectedMarker;

      if (!markers) {
        return;
      }

      // select marker
      for (const marker of markers) {
        const position = marker.getPosition();

        if (latlng == position.lat().toString() + position.lng().toString()) {
          marker.setIcon(mapIconSelected)
          selectedMarker = marker;

          this.$nextTick(() => {
            const storeList = document.querySelector('.store-list');
            const storeItem = document.querySelector('.store-item.selected');
            storeList.scrollTop = storeItem.offsetTop - storeList.offsetTop
          })
        }
        else {
          marker.setIcon(mapIcon)
        }
      }

      if (positionMarker && positionMarker.getPosition()) {
        bounds = new google.maps.LatLngBounds()
        bounds.extend(positionMarker.getPosition());
        bounds.extend(selectedMarker.getPosition());
        map.fitBounds(bounds);
      }
      else {
        map.panTo(selectedMarker.getPosition())

        const interval = setInterval(() => {
          if (selectedMarker.map == null) {
            map.setZoom(map.getZoom() + 1)
          }
          else {
            clearInterval(interval)
          }
        }, 800)
      }

    }
  }))
})

document.addEventListener("DOMContentLoaded", function () {

});

function initMaps() {
  var mapElement = document.querySelector('#map');
  var googleMapsKey = mapElement.getAttribute('data-api-key')
  // var stores = JSON.parse(mapElement.getAttribute('data-stores'))

  mapIcon = mapElement.getAttribute('data-mapicon')
  mapIconSelected = mapElement.getAttribute('data-mapicon-selected')
  mapIconCluster = mapElement.getAttribute('data-mapicon-cluster')



  loadGoogleMaps(googleMapsKey, function () {
    const mapOptions = {
      center: { lat: 47.066000, lng: 2.429056 }, // Set initial map center
      zoom: 5, // Set initial zoom level
      styles: mapStyle,
      linksControl: false,
      panControl: false,
      addressControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      enableCloseButton: false,
      zoomControl: true,
      fullscreenControl: false,
      enableCloseButton: false,
    };

    map = new google.maps.Map(mapElement, mapOptions);
    positionMarker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
      visible: false,
    });

    // Setup markers
    markers = stores.map(function (store, i) {
      let marker = new google.maps.Marker({
        position: new google.maps.LatLng(store.latitude, store.longitude),
        icon: mapIcon,
        // label: store.name,
        // map: map
      });

      marker.store = store

      marker.addListener("click", () => {
        const position = marker.getPosition();
        document.getElementById('store-list').dispatchEvent(new CustomEvent('select-store', {
          detail: {
            latlng: position.lat().toString() + position.lng().toString()
          }
        }));
      });

      return marker;
    });

    // Enable marker clustering
    const algorithm = new markerClusterer.GridAlgorithm({ maxDistance: 400000, gridSize: 40 })
    const renderer = {
      render: ({ count, position }) =>
        new google.maps.Marker({
          label: { text: String(count), color: "black", fontSize: "9px" },
          icon: {
            url: mapIconCluster,
            labelOrigin: { x: 30, y: 7 },
            // fillColor: '#000000',
            // labelOrigin: new google.maps.Point(26.5, 20),
            // anchor: new google.maps.Point(26.5, 20),
            scale: 1
          },
          position,
          // adjust zIndex to be above other markers
          zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
        }),
    };
    markerCluster = new markerClusterer.MarkerClusterer({ markers, map, algorithm, renderer });

    // Infowindow
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    // Autocomplete
    const input = document.querySelector("#location-autocomplete");
    const options = {
      fields: ["formatted_address", "geometry", "name"],
      strictBounds: false,
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener("place_changed", () => {
      infowindow.close();
      positionMarker.setVisible(false);

      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        positionMarker = new google.maps.Marker({
          map,
          anchorPoint: new google.maps.Point(0, -29),
          visible: false,
        });
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.panTo(place.geometry.location);
        map.setZoom(17);
      }

      // Calculate the closest marker
      var closestMarker = findClosestMarker(place.geometry.location, markers);

      positionMarker.setPosition(place.geometry.location);
      positionMarker.setVisible(true);

      // Extend the map bounds to include both the selected place and the closest marker
      bounds = new google.maps.LatLngBounds();
      bounds.extend(place.geometry.location);
      bounds.extend(closestMarker.getPosition());
      map.fitBounds(bounds);
      if (map.getZoom() > 16) {
        map.setZoom(16);
      }
    });
  });

  function findClosestMarker(referenceLocation, markers) {
    var closestMarker = null;
    var closestDistance = Number.POSITIVE_INFINITY;

    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      var distance = google.maps.geometry.spherical.computeDistanceBetween(
        marker.getPosition(),
        referenceLocation
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestMarker = marker;
      }
    }

    return closestMarker;
  }
}

const mapStyle = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#edb6c3"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#000000"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "landscape",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#edb6c3"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.local",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#faf0f2"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
];