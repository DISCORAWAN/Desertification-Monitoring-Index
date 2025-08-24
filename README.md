# Spatio-Temporal Assessment of Desertification Using Spectral Feature Space Model

## Overview
This repository contains the code, scripts, and workflows developed for the project **“Spatio-Temporal Assessment of Desertification Using Spectral Feature Space Model”**. The study focuses on analyzing land degradation and desertification trends across twelve districts of western Rajasthan using long-term satellite datasets and machine learning techniques.

### Key highlights of the project:
- Developed a **Desertification Monitoring Index (DMI)** using **NDVI-Albedo spectral space modeling**.  
- Assessed spatio-temporal trends from **2001–2024** using **MODIS time-series data**.  
- **Predicted future DMI trends for 2025–2050** using Random Forest regression trained on historical climate and spectral datasets.  
- Integrated climate variables (**rainfall, temperature, wind speed**) for validation and forecasting.  
- Aimed to support **India’s Desert Development Programme (DDP)** and **Land Degradation Neutrality (LDN)** initiatives.

---

## Methodology Summary

### Satellite Data Preprocessing
- Extracted NDVI and Albedo from MODIS datasets.  
- Climate variables derived from GPM and TerraClimate datasets (2001–2024).

### DMI Computation
- **Applied linear regression in NDVI-Albedo space** to derive the Desertification Monitoring Index (DMI).

### Machine Learning Integration
- Used Random Forest regression for DMI prediction and validation using climatic drivers.  
- **Generated future projections of DMI for the period 2025–2050 based on projected climate scenarios.**

### Trend Analysis
- Applied Sen’s slope and Mann–Kendall tests for temporal trend detection.

---

## Tech Stack
- **Programming & Scripting:** Python (NumPy, Pandas, GDAL, scikit-learn, matplotlib), Google Earth Engine (JavaScript API)  
- **Machine Learning:** Random Forest (scikit-learn), Linear Regression  
- **Remote Sensing Data Sources:** MODIS, GPM, TerraClimate  
- **GIS & Visualization:** QGIS, ArcGIS  
- **Development Environment:** Jupyter Notebook, Google Colab, Anaconda
