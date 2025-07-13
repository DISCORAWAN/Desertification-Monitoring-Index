//  1. Define AOI 

//  2. Define slopes per year 
var yearSlopeDict = ee.Dictionary({
    2001: 2.36966824645, 2002: 1.59489633174, 2003: 2.1645021645, 2004: 2.0325203252,
    2005: 2.07039337474, 2006: 2.0202020202, 2007: 2.26244343891, 2008: 2.17391304348,
    2009: 2.0325203252, 2010: 2.59067357513, 2011: 2.6525198939, 2012: 2.48756218905,
    2013: 2.5974025974, 2014: 2.32558139535, 2015: 2.4154589372, 2016: 2.48756218905,
    2017: 2.38663484487, 2018: 2.39808153477, 2019: 2.48138957816, 2020: 2.46305418719,
    2021: 2.45098039216, 2022: 2.6455026455, 2023: 2.72479564033, 2024: 2.99401197605
  });
  
  //  3. List of years 
  var years = ee.List.sequence(2001, 2024);
  
  //  4. Loop to create and export DDI images 
  years.getInfo().forEach(function(year) {
   var slope = yearSlopeDict.getNumber(year.toString());
  
    var k = slope;
  
    var path = 'projects/indices-461804/assets/2001-25/NDVI_Albedo_LR_' + year;
    var image = ee.Image(path).select(['b1', 'b2'], ['NDVI', 'Albedo']);
  
    var ndvi = image.select('NDVI');
    var albedo = image.select('Albedo');
    var ddi = ndvi.multiply(k).subtract(albedo).rename('DDI');
  
    var final = image.addBands(ddi);
  
    Export.image.toDrive({
      image: final.toFloat(),
      description: 'NDVI_Albedo_DDI_' + year,
      folder: 'DDI_Results',
      fileNamePrefix: 'NDVI_Albedo_DDI_LR_' + year,
      region: aoi,
      scale: 250,
      crs: 'EPSG:4326',
      maxPixels: 1e13
    });
  });
  