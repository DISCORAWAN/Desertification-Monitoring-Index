// 1. Define AOI please


// 2. List of years
var years = ee.List.sequence(2015, 2025);

// 3. Function to calculate median Albedo for a given year
function getYearlyAlbedo(year) {
  year = ee.Number(year);
  var start = ee.Date.fromYMD(year, 6, 1);
  var end = ee.Date.fromYMD(year, 10, 31);

  var albedo = ee.ImageCollection('MODIS/061/MCD43A3')
    .filterBounds(aoi)
    .filterDate(start, end)
    .select('Albedo_BSA_Band1');

  var median = albedo.median()
    .multiply(0.001) // scale factor
    .clip(aoi)
    .rename(ee.List([ee.String('Albedo_').cat(year.format('%d'))])); // safe band name

  return median;
}

// 4. Map over all years to create a list of images
var albedoImages = years.map(function(year) {
  return getYearlyAlbedo(year);
});

// 5. Convert list to a single multi-band image
var multiBandAlbedo = ee.ImageCollection.fromImages(albedoImages).toBands();

// 6. Clean up band names (strip 0_, 1_, etc.)
var cleanBandNames = years.map(function(year) {
  return ee.String('Albedo_').cat(ee.Number(year).format('%d'));
});
multiBandAlbedo = multiBandAlbedo.rename(cleanBandNames);

// 7. Display a specific year (e.g., 2020)
Map.centerObject(aoi, 9);
Map.addLayer(multiBandAlbedo.select('Albedo_2020'), {
  min: 0,
  max: 1,
  palette: ['black', 'gray', 'white']
}, 'Albedo 2020');

// 8. Export the multi-band image to Drive
Export.image.toDrive({
  image: multiBandAlbedo,
  description: 'Albedo_MultiBand_2015_2025',
  folder: 'MEDIAN_ALBEDO',
  fileNamePrefix: 'Albedo_MultiBand_2015_2025',
  region: aoi,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});
