// Import Assets 

var ddi = ddiImage.select(0).clip(aoi);

// Only keep valid DDI range
var validDDI = ddi.updateMask(ddi.gte(-1.432854233).and(ddi.lte(1.862462059)));

// Classify directly without initializing with 0
var class1 = validDDI.gte(-1.432854233).and(validDDI.lt(0.208342508)).multiply(1);
var class2 = validDDI.gte(0.208342508).and(validDDI.lt(0.44095307)).multiply(2);
var class3 = validDDI.gte(0.44095307).and(validDDI.lt(0.725254868)).multiply(3);
var class4 = validDDI.gte(0.725254868).and(validDDI.lte(1.862462059)).multiply(4);

// Combine classes
var classified = class1.add(class2).add(class3).add(class4)
  .rename('Degree_of_')
  .int();

// Remove class 0 entirely before export
var finalClassified = classified.updateMask(classified.neq(0));

var dfinalClassified = finalClassified.select(0).clip(aoi);



// Export
Export.image.toDrive({
  image: dfinalClassified,
  description: 'DDI_Classified_2015_2016',
  folder: 'xx',
  fileNamePrefix: 'Degree_of_LD_2015_2016',
  region: aoi,
  scale: 250,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});
