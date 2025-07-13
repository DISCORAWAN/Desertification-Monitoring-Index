
// 1. Define AOI and Time Range

// var aoi = /* your geometry here */;
var startYear = 2001;
var endYear = 2024;
var years = ee.List.sequence(startYear, endYear);


// 2. Load TerraClimate Dataset

var terraclimate = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'));


// 3. Function: Compute Annual Average Wind Speed (June to October)

var annualWind = years.map(function (year) {
  year = ee.Number(year);

  // Months: June to October
  var months = ee.List([6, 7, 8, 9, 10]);

  var monthlyVs = months.map(function (m) {
    var date = ee.Date.fromYMD(year, m, 1);
    return terraclimate
      .filterDate(date, date.advance(1, 'month'))
      .select('vs')
      .mean();
  });

  var vsMean = ee.ImageCollection.fromImages(monthlyVs).mean();

  var windImage = ee.Algorithms.If(
    vsMean.bandNames().size().gt(0),
    vsMean.multiply(0.01).toFloat()
      .rename(ee.String('wind_').cat(year.int().format())),
    ee.Image.constant(0).toFloat().rename(ee.String('wind_').cat(year.int().format()))
  );

  return ee.Image(windImage).set('year', year);
});


// 4. Function: Compute Annual Average Temperature (June to October)

var annualTemp = years.map(function (year) {
  year = ee.Number(year);

  // Months: June to October
  var months = ee.List([6, 7, 8, 9, 10]);

  var tmmnMonthly = months.map(function (m) {
    var date = ee.Date.fromYMD(year, m, 1);
    return terraclimate
      .filterDate(date, date.advance(1, 'month'))
      .select('tmmn')
      .mean();
  });

  var tmmxMonthly = months.map(function (m) {
    var date = ee.Date.fromYMD(year, m, 1);
    return terraclimate
      .filterDate(date, date.advance(1, 'month'))
      .select('tmmx')
      .mean();
  });

  var tmmn = ee.ImageCollection.fromImages(tmmnMonthly).mean();
  var tmmx = ee.ImageCollection.fromImages(tmmxMonthly).mean();

  var hasBands = tmmn.bandNames().size().gt(0).and(tmmx.bandNames().size().gt(0));

  var avgTemp = ee.Algorithms.If(
    hasBands,
    tmmn.add(tmmx).divide(2).multiply(0.1).toFloat()
      .rename(ee.String('temp_').cat(year.int().format())),
    ee.Image.constant(0).toFloat().rename(ee.String('temp_').cat(year.int().format()))
  );

  return ee.Image(avgTemp).set('year', year);
});


// 5. Convert to Multi-band Images

var windImage = ee.ImageCollection.fromImages(annualWind).toBands();
var tempImage = ee.ImageCollection.fromImages(annualTemp).toBands();


// 6. Display Layers

Map.centerObject(aoi, 6);
// Map.addLayer(windImage.clip(aoi), {}, 'Annual Wind Speed (Jun–Oct)'); // Commented as per your request
Map.addLayer(tempImage.clip(aoi), {}, 'Annual Avg Temp (Jun–Oct)');


// 7. Export Both as GeoTIFFs (4638.3 m original resolution)

// Export.image.toDrive({
//   image: windImage.clip(aoi),
//   description: 'Annual_WindSpeed_JunOct',
//   folder: 'June to October',
//   fileNamePrefix: 'wind_2001_2024_JunOct',
//   region: aoi,
//   scale: 4638.3,
//   maxPixels: 1e13
// });

Export.image.toDrive({
  image: tempImage.clip(aoi),
  description: 'Annual_Temperature_JunOct',
  folder: 'June to October',
  fileNamePrefix: 'temp_2001_2024_JunOct_OG',
  region: aoi,
  scale: 4638.3,
  maxPixels: 1e13
});
