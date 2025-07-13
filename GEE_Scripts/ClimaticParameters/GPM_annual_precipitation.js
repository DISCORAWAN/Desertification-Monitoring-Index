
// 1. Define AOI and Time Range

// var aoi = /* your geometry here */;
var startYear = 2001;
var endYear = 2024;
var years = ee.List.sequence(startYear, endYear);


// 2. Load Monthly GPM IMERG v07 (mm/hr)

var gpm = ee.ImageCollection('NASA/GPM_L3/IMERG_MONTHLY_V07')
            .select('precipitation');


// 3. Function: Get Days in a Month

var daysInMonth = function(date) {
  var thisMonth = ee.Date(date);
  var nextMonth = thisMonth.advance(1, 'month');
  return nextMonth.difference(thisMonth, 'day');
};


// 4. Function: Compute Annual Precipitation

var annualPrecip = years.map(function(year) {
  year = ee.Number(year);
  var start = ee.Date.fromYMD(year, 1, 1);
  var end = start.advance(1, 'year');
  
  // var months = ee.List.sequence(1, 12); annualy 
  var months = ee.List([6, 7, 8, 9, 10]);

  
  // Compute monthly precipitation in mm/month
  var monthlyImages = months.map(function(m) {
  var date = ee.Date.fromYMD(year, m, 1);
  var monthly = gpm.filterDate(date, date.advance(1, 'month')).first();
  var days = daysInMonth(date);
  
  // Handle missing images
  var image = ee.Algorithms.If(
    monthly,
    ee.Image(monthly).multiply(24).multiply(days),
    ee.Image.constant(0).rename('precipitation')
  );
  
  return ee.Image(image).set('system:time_start', date.millis());
});
  
  // Sum monthly images to get annual total
  var annual = ee.ImageCollection.fromImages(monthlyImages)
                                 .sum()
                                 .set('year', year)
                                 .rename(ee.String('prec_').cat(year.int().format()));
  return annual;
});


// 5. Convert to Multi-band Image and Display

var precipImage = ee.ImageCollection.fromImages(annualPrecip).toBands();
// var palette = [
//   '000096','0064ff', '00b4ff', '33db80', '9beb4a',
//   'ffeb00', 'ffb300', 'ff6400', 'eb1e00', 'af0000'
// ];
// var precipitationVis = {min: 0.0, max: 1.5, palette: palette};
// Map.centerObject(aoi, 6);
Map.addLayer(precipImage.clip(aoi),{}, 'Annual Precipitation (mm/year)');


// 6. Export as Multi-band GeoTIFF

// Export.image.toDrive({
//   image: precipImage.clip(aoi),
//   description: 'Annual_Precipitation_mm_per_year_2000_2025',
//   folder: 'GEE_Exports',
//   fileNamePrefix: 'precip_2000_2025_mm_year',
//   region: aoi,
//   scale: 11132,  // Adjust to your need
//   maxPixels: 1e13
// });



// Final Export (11132 m, original resolution)

Export.image.toDrive({
  image: precipImage.clip(aoi),
  description: 'Annual_Rainfall_11132m_JunOct_OG',
  folder: 'June to October',
  fileNamePrefix: 'precip_2001_2024_JunOct_11132m',
  region: aoi,
  scale: 11132,  // Original GPM resolution
  maxPixels: 1e13
});

