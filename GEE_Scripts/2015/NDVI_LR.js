// 1. Define your AOI (replace with your actual AOI if needed)

// 2. Cloud mask function for MOD09Q1
function maskClouds(image) {
  var qa = image.select('State').toInt16();
  var cloudState = qa.bitwiseAnd(3).eq(0);        // Bits 0–1: clear
  var cloudShadow = qa.bitwiseAnd(1 << 2).eq(0);  // Bit 2: no shadow
  return image.updateMask(cloudState.and(cloudShadow));
}

// 3. List of years
var years = ee.List.sequence(2015, 2025);

// 4. Get yearly NDVI and rename the band to NDVI_<year>
var ndviImages = years.map(function(year) {
  year = ee.Number(year);
  var start = ee.Date.fromYMD(year, 6, 1);
  var end = ee.Date.fromYMD(year, 10, 31);

  var modis = ee.ImageCollection('MODIS/061/MOD09Q1')
    .filterBounds(aoi)
    .filterDate(start, end)
    .map(maskClouds)
    .select(['sur_refl_b01', 'sur_refl_b02']);

  var median = modis.median().clip(aoi);

  var ndvi = median.normalizedDifference(['sur_refl_b02', 'sur_refl_b01'])
    .rename(ee.List([ee.String('NDVI_').cat(year.format('%d'))]));  // Format to avoid '.0'

  return ndvi;
});

// 5. Combine NDVI images into a multi-band image
var multiBandNDVI = ee.ImageCollection.fromImages(ndviImages).toBands();

// 6. Rename bands to strip any prefixes like '0_', '1_' from toBands
var cleanBandNames = years.map(function(year) {
  return ee.String('NDVI_').cat(ee.Number(year).format('%d'));
});
multiBandNDVI = multiBandNDVI.rename(cleanBandNames);

// 7. Display NDVI for one year (e.g., 2020)
Map.centerObject(aoi, 8);
Map.addLayer(multiBandNDVI.select('NDVI_2020'), {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 2020');

// 8. Export the multi-band NDVI image to Google Drive
Export.image.toDrive({
  image: multiBandNDVI,
  description: 'NDVI_MultiBand_2015_2025',
  folder: 'EarthEngineExports',
  fileNamePrefix: 'NDVI_MultiBand_2015_2025',
  region: aoi,
  scale: 250,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
