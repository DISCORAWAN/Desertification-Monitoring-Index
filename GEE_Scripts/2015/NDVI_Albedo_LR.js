// 1. Define AOI 


//  2. Cloud mask for MOD09Q1 (NDVI) 
function maskMOD09Q1(image) {
    var qa = image.select('State').toInt16();
    var cloudState = qa.bitwiseAnd(3).eq(0);        // Bits 0-1: clear
    var cloudShadow = qa.bitwiseAnd(1 << 2).eq(0);  // Bit 2: no shadow
    return image.updateMask(cloudState.and(cloudShadow));
  }
  
  //  3. List of years 
  var years = ee.List.sequence(2022, 2024);
  
  //  4. Create one NDVI + Albedo image per year 
  var yearlyImages = years.map(function(y) {
    var year = ee.Number(y);
    var start = ee.Date.fromYMD(year, 6, 1);
    var end = ee.Date.fromYMD(year, 10, 31);
  
    // MOD09Q1: Surface Reflectance (NDVI)
    var modisSR = ee.ImageCollection('MODIS/061/MOD09Q1')
      .filterBounds(aoi)
      .filterDate(start, end)
      .map(maskMOD09Q1)
      .select(['sur_refl_b01', 'sur_refl_b02']);
  
    var medianSR = modisSR.median().clip(aoi);
    var ndvi = medianSR.normalizedDifference(['sur_refl_b02', 'sur_refl_b01'])
                .rename('NDVI');
  
    // MCD43A3: Albedo
    var albedo = ee.ImageCollection('MODIS/061/MCD43A3')
      .filterBounds(aoi)
      .filterDate(start, end)
      .select('Albedo_BSA_Band1');
  
    var medianAlbedo = albedo.median().multiply(0.001).rename('Albedo').clip(aoi);
  
    // Combine both into one image
    return ndvi.addBands(medianAlbedo).toFloat().set('year', year);
  });
  
  //  5. Convert to ImageCollection 
  var combinedCollection = ee.ImageCollection.fromImages(yearlyImages);
  print('Combined NDVI+Albedo Collection:', combinedCollection);
  
  //  6. Export all 26 images to Drive 
  years.evaluate(function(yearList) {
    yearList.forEach(function(y) {
      var year = ee.Number(y);
      var img = combinedCollection.filter(ee.Filter.eq('year', year)).first();
  
      // Fix the filename using ee.String().cat()
      var filename = ee.String('NDVI_Albedo_LR_').cat(year.format());
  
      Export.image.toDrive({
        image: img,
        description: filename.getInfo(),  // Convert server-side string to client-side
        folder: '2015-2025',
        fileNamePrefix: filename.getInfo(), // Same here
        region: aoi,
        scale: 500,
        crs: 'EPSG:4326',
        maxPixels: 1e13,
        fileFormat: 'GeoTIFF'
      });
    });
  });
  