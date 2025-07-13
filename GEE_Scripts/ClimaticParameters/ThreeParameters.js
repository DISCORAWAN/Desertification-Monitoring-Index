var point = ee.Geometry.Point([71.2, 26.9]);  // Central Western Rajasthan
// import climateStack and aoi
var sample = climateStack.sample({
  region: point,
  scale: 250,
  numPixels: 1,
  geometries: true
}).first();

print('Sample values:', sample);

Map.centerObject(point, 7);
Map.addLayer(climateStack.select(0), {min: 0, max: 1500}, 'First Climate Band');
Map.addLayer(point, {color: 'red'}, 'Test Point');
