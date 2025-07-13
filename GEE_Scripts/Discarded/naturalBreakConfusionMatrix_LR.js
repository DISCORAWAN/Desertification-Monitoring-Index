//Import Assets

// Step 1: Rename bands
var predicted = predictedDDI.rename('predicted');
var reference = refeDDI.rename('reference');

// Step 2: Apply strict valid mask
var validMask = predicted.gte(1).and(predicted.lte(4))   // Only predicted 1-4
                  .and(reference.gte(1)).and(reference.lte(4));  // Only reference 1-4

// Step 3: Apply the mask to both bands
var maskedStacked = predicted.addBands(reference).updateMask(validMask);

// Step 4: Sample only valid points
var validationPoints = maskedStacked.sample({
  region: aoi,
  scale: 250,
  numPixels: 5000,
  seed: 42,
  geometries: false
});

// Step 5: Generate confusion matrix and metrics
var confusionMatrix = validationPoints.errorMatrix('reference', 'predicted');
print('Confusion Matrix:', confusionMatrix);
print('Overall Accuracy:', confusionMatrix.accuracy());
print('Kappa Coefficient:', confusionMatrix.kappa());
