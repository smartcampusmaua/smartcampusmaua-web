const apiUrlSmartLight = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/SmartLight/all?interval=30";
// const apiUrlTemperaturaSensor = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/SmartLight/all?interval=30";
const apiUrlWaterTankLevel = "https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/WaterTankLevel/all?interval=30";

async function fetchSmartLight() {
  const response = await fetch(apiUrlSmartLight);

  const data = await response.json();

  return data;
}
// async function fetchWaterTankLevel(){
//   const response = await fetch(apiUrlWaterTankLevel);

//   const data = await response.json();

//   return data;
// }

async function fetchAllSensors() {
  const luzes = await fetchSmartLight();
  // const temperatura = await fetchTemperaturaSensor();
  // const waterTanklevel = await fetchWaterTankLevel();
  return [...luzes, 
    // ...temperatura, 
    // ...waterTanklevel
  ]; 
};


export { fetchSmartLight, fetchAllSensors }