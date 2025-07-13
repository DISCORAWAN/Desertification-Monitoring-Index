// Load or define your NDVI and Albedo images

// Clip to Area of Interest
ndviImage = ndviImage.clip(aoi);
albedoImage = albedoImage.clip(aoi);

// (Optional) Scale the values if needed
// For example, if NDVI is in MODIS scale, multiply by 0.0001
ndviImage = ndviImage.multiply(1).rename('NDVI');
albedoImage = albedoImage.multiply(0.001).rename('Albedo');

// Stack the NDVI and Albedo into a 2-band image
var stackedImage = ndviImage.addBands(albedoImage);

/* Display result
Map.centerObject(aoi, 8);
Map.addLayer(stackedImage.select('NDVI'), {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI');
Map.addLayer(stackedImage.select('Albedo'), {min: 0, max: 1, palette: ['black', 'blue']}, 'Albedo'); */


// Sample the image to get pixel values as a FeatureCollection
var training = stackedImage.sample({
  region: aoi,
  scale: 250, // adjust based on your image resolution
  numPixels: 5000, // number of pixels to use for training
  seed: 42,
  geometries: true
});

// Apply K-means clustering
var clusterer = ee.Clusterer.wekaKMeans(60).train(training);  // 3 clusters (change as needed)

// Cluster the stacked image
var clustered = stackedImage.cluster(clusterer);

// Display the clustered result
Map.addLayer(clustered.randomVisualizer(), {}, 'K-means Clusters');

// Step 1: Attach the cluster labels to the sampled training points
var trainingWithClusters = training.cluster(clusterer);

// Step 2: Group by cluster label, compute mean NDVI and Albedo
var centroids = trainingWithClusters.reduceColumns({
  selectors: ['cluster', 'NDVI', 'Albedo'],
  reducer: ee.Reducer.mean().repeat(2).group({
    groupField: 0,
    groupName: 'cluster'
  })
});

// Step 3: Print centroids to Console
print('Cluster Centroids (mean NDVI, Albedo):', centroids);


// Define your reference point
var refNDVI = 0.7266378608243219;
var refAlbedo = 0.00004725862068965518;

// Compute Euclidean Distance = DDI
var ddi = stackedImage.expression(
  'sqrt(pow(NDVI - refN, 2) + pow(Albedo - refA, 2))',
  {
    NDVI: stackedImage.select('NDVI'),
    Albedo: stackedImage.select('Albedo'),
    refN: refNDVI,
    refA: refAlbedo
  }
).rename('DDI');

// Display the DDI layer
Map.addLayer(ddi, {min: 0, max: 1, palette: ['white', 'yellow', 'red']}, 'DDI (Euclidean Distance)');
