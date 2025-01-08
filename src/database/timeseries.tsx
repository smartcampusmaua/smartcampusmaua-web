const apiUrlSmartLight = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/SmartLight/all?interval=30";
const apiUrlWaterTankLevel = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/WaterTankLevel/all?interval=30";
const apiUrlHydrometer = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/Hydrometer/all?interval=30";
const apiUrlEnergyMeter = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/EnergyMeter/all?interval=30";
const apiUrlWeatherStation = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/WeatherStation/all?interval=30";

async function fetchSmartLight() {
  const response = await fetch(apiUrlSmartLight);

  const data = await response.json();

  return data;
}
async function fetchWaterTankLevel(){
  const response = await fetch(apiUrlWaterTankLevel);

  const data = await response.json();

  return data;
}
async function fetchHydrometer(){
  const response = await fetch(apiUrlHydrometer);

  const data = await response.json();

  return data;
}
async function fetchEnergyMeter(){
  const response = await fetch(apiUrlEnergyMeter);

  const data = await response.json();

  return data;
}
async function fetchWeatherStation(){
  const response = await fetch(apiUrlWeatherStation);

  const data = await response.json();

  return data;
}

async function fetchAllSensors() {
  const luzes = await fetchSmartLight();
  const waterTanklevel = await fetchWaterTankLevel();
  const hydrometer = await fetchHydrometer();
  const energyMeter = await fetchEnergyMeter();
  const weatherStation = await fetchWeatherStation();

  return [...luzes, 
    ...waterTanklevel, 
    ...hydrometer, 
    ...energyMeter, 
    ...weatherStation]; 
};


export { fetchSmartLight, fetchAllSensors }