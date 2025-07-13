// Import Assests 

//This code extracts class values from reference and classify points on target image

// Stack them together
var stacked = refDDI.rename('refClass').addBands(targetDDI.rename('targetDDI'));

// Define a list of class codes (1 to 4)
var classCodes = ee.List.sequence(1, 4);

// Function to compute stats for each class
var statsPerClass = classCodes.map(function(classValue) {
  classValue = ee.Number(classValue);
  
  // Mask to select only pixels of the current class
  var masked = stacked.updateMask(stacked.select('refClass').eq(classValue));
  
  // Reduce region to get stats
  var stats = masked.reduceRegion({
    reducer: ee.Reducer.min()
              .combine(ee.Reducer.max(), '', true)
              .combine(ee.Reducer.mean(), '', true)
              .combine(ee.Reducer.median(), '', true),
    geometry: aoi,    // define your area of interest
    scale: 250,       // adjust based on your image resolution
    maxPixels: 1e13
  });
  
  // Return a dictionary with class value and stats
  return ee.Feature(null, {
    'class': classValue,
    'min': stats.get('targetDDI_min'),
    'max': stats.get('targetDDI_max'),
    'mean': stats.get('targetDDI_mean'),
    'median': stats.get('targetDDI_median')
  });
});

// Convert results to a FeatureCollection
var resultTable = ee.FeatureCollection(statsPerClass);

// Print the results
print('DDI Stats per Reference Class:', resultTable);

// Optionally export
Export.table.toDrive({
  collection: resultTable,
  description: 'DDI_stats_by_class',
  fileFormat: 'CSV'
});
