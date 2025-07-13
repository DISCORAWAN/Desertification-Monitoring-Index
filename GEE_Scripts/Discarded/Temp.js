// 1. Import AOI

function maskClouds(image) {
    var qa = image.select('State').toInt16(); //ensure integer type
  
    // Bits 0–1: Cloud state (00 = clear)
    var cloudState = qa.bitwiseAnd(3); // 0000000000000011
    var clear = cloudState.eq(0);
  
    // Bit 2: Cloud shadow (0 = no shadow)
    var cloudShadow = qa.bitwiseAnd(1 << 2).eq(0); // Bit 2
  
    // Bits 4–5: Aerosol quantity (00 = climatology)
    var aerosol = qa.bitwiseAnd(3 << 4).eq(0); // Bits 4-5
  
    // Combine all masks
    var mask = clear.and(cloudShadow).and(aerosol);
  
    return image.updateMask(mask);
  }
  
  
  // 3. Load and filter MOD09Q1
  var modis = ee.ImageCollection('MODIS/061/MOD09Q1')
    .filterBounds(aoi)
    .filterDate('2015-06-01', '2015-10-31')
    .map(maskClouds)
    .select(['sur_refl_b01', 'sur_refl_b02']); // Red and NIR
  
  // 4. Take median and calculate NDVI
  var median = modis.median().clip(aoi);
  var ndvi = median.normalizedDifference(['sur_refl_b02', 'sur_refl_b01']).rename('NDVI');
  
  // print NDVI
  var ndviStats = ndvi.reduceRegion({
    reducer: ee.Reducer.median(),
    geometry: aoi,
    scale: 250,
    maxPixels: 1e13
  });
  
  print('Median NDVI value over AOI (June–Oct 2015):', ndviStats.get('NDVI'));
  
  // 5. Display
  Map.centerObject(aoi, 9);
  Map.addLayer(ndvi, {
    min: -0.2,
    max: 1,
    palette: ['blue', 'white', 'green']
  }, 'NDVI');
  
  // 6. Export NDVI image to Google Drive
  Export.image.toDrive({
    image: ndvi,
    description: 'NDVI_JuneOct2015',
    folder: 'GEE_NDVI_Exports',  //change this to your actual Drive folder name if needed
    fileNamePrefix: 'NDVI_JuneOct2015',
    region: aoi,
    scale: 250,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
  