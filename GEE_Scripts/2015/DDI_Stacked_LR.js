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
  
  // 3. List of years 
  var years = ee.List.sequence(2001, 2024);
  
  //  4. Create a list of yearly images with renamed bands 
  var imageList = years.getInfo().map(function(year) {
    var slope = yearSlopeDict.getNumber(year.toString()).getInfo();  // client-side
    var k = slope;
  
    var path = 'projects/indices-461804/assets/2001-25/NDVI_Albedo_LR_' + year;
    var image = ee.Image(path).select(['b1', 'b2'], ['NDVI', 'Albedo']);
  
    var ndvi = image.select('NDVI').rename('NDVI_' + year);
    var albedo = image.select('Albedo').rename('Albedo_' + year);
    var ddi = ndvi.multiply(k).subtract(albedo).rename('DDI_' + year);
  
    return ddi;
  });
  
  //  5. Merge all yearly images into one 
  var combined = ee.ImageCollection(imageList).toBands().clip(aoi);
  
  //  6. Export the final combined image 
  Export.image.toDrive({
    image: combined.toFloat(),
    description: 'NDVI_Albedo_DDI_All_Years',
    folder: 'GEE_Exports',
    fileNamePrefix: 'Combined_NDVI_Albedo_DDI_2001_2024',
    region: aoi,
    scale: 250,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });
  