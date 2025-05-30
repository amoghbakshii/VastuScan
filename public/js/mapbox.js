mapboxgl.accessToken = mapboxToken;

const map = new mapboxgl.Map({
  container: 'map', 
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [businessLocation.lng, businessLocation.lat], 
  zoom: 12
});

new mapboxgl.Marker()
  .setLngLat([businessLocation.lng, businessLocation.lat])
  .addTo(map);