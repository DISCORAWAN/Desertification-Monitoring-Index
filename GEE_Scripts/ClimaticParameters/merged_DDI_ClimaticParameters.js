
// 1. Assume these two are already defined

// var climateStack = ... (75 bands)
// var ddiStack = ... (72 bands at 250m)


// 2. Resample ClimateStack to 250m

var climateResampled = climateStack
  .resample('bilinear')  // for smooth interpolation
  .reproject({
    crs: ddiStack.projection(),  // Match DDI projection
    scale: 250
  });


// 3. Merge DDI with Resampled Climate Data

var mergedStack = ddiStack.addBands(climateResampled);


// 4. Print & Visualize

print('Merged DDI + Climate stack (72 + 75 = 147 bands)', mergedStack);

Map.centerObject(ddiStack, 6);
Map.addLayer(mergedStack.select(0), {}, 'Merged: First Band Preview');  // just a sample band

/*Check1
print('All band names:', mergedStack.bandNames());
print('DDI Projection:', ddiStack.projection());
print('Resampled Climate Projection:', climateResampled.projection()); */

/*Check2
var testBand1 = mergedStack.select('temp_2010');  // example from climate
var testBand2 = mergedStack.select(0);           // example from DDI

var diff = testBand1.subtract(testBand2);
Map.addLayer(diff, {min: -1, max: 1, palette: ['red', 'white', 'green']}, 'Band Difference Check'); */

/*check3
var samplePoints = mergedStack.sample({
  region: aoi,
  scale: 250,
  numPixels: 500,
  geometries: true
});
print(samplePoints.limit(5));

print('Sample point band names:', samplePoints.first().propertyNames()); */


