/* eslint-disable */

console.log('hello from the client side');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = `pk.eyJ1IjoicG9kZXh1czIzIiwiYSI6ImNsb2lycDgzbzF1N3kycXA5NGM0OWU3NDgifQ.zr564U0ctKS60QqXa30fIg`;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/podexus23/cloisacnk004t01o4hx5ia7t6',
  scrollZoom: false,
  // center: [-118.113491, 34.111745],
  // zoom: 4,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Add marker
  const el = document.createElement('div');
  el.className = 'marker';
  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} ${loc.description}</p>`)
    .addTo(map);

  // extends map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
