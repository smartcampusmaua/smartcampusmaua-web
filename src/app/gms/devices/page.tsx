"use client";

import Head from "next/head";
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from "react";
import { fetchAllSensors } from "@/database/timeseries";
import {
  // Luz, 
  // Local, 
  GenericSensor
} from "@/database/dataTypes";
import {
  supabase,
  // getData 
} from '@/database/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const Sensores = () => {
  const [sensors, setSensores] = useState<GenericSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredSensores, setFilteredSensores] = useState<GenericSensor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

  const sanitize = (value: any) => (value === "" || value === null ? "Indisponível" : value);

  useEffect(() => {
    const fetchSensors = async () => {
      const { data: sensorsInfo, error } = await supabase
        .from('SensorsNew')
        .select("Nome, DEVEUI, Local, Tipo");

      if (error) {
        console.error('Error fetching sensors data: ', error);
        return;
      }

      const sensorsData = await fetchAllSensors();

      setSensores(prevSensores => {
        const updatedSensores = [...prevSensores];

        sensorsData.forEach(sensorData => {
          const isDuplicate = updatedSensores.some(
            sensor => sanitize(sensor.tags[0]) === sanitize(sensorData.tags.deviceId)
          );
          var sensorAlreadyExists = false;

          if (!isDuplicate) {
            let newSensor;
            if (sensorData.name === "SmartLight" && !sensorAlreadyExists) {
              sensorsInfo.forEach(sensorInfo => {
                if (sensorInfo.DEVEUI == sensorData.tags.deviceId) {
                  newSensor = new GenericSensor(
                    sanitize(sensorInfo.Nome),
                    sensorData.name,
                    [
                      sanitize((Number(sensorData.fields.batteryVoltage) / 1000).toFixed(1)) + " V",
                      sanitize(sensorData.fields.boardVoltage) + " V",
                      sanitize(sensorData.fields.humidity) + " %",
                      sanitize((Math.pow(Number(sensorData.fields.luminosity), -3.746) * 140000000000000).toFixed(1)) + " lux",
                      sanitize(sensorData.fields.temperature) + " °C",
                      sanitize(sensorData.fields.movement)
                    ],
                    [sanitize(sensorData.tags.deviceId)],
                    sanitize(sensorInfo.Local),
                    new Date(Number(sensorData.timestamp) / 1e6)
                  );
                  sensorAlreadyExists = true;
                }
              });
              if (!sensorAlreadyExists) {
                newSensor = new GenericSensor(
                  "Indisponível",
                  sensorData.name,
                  [
                    sanitize((Number(sensorData.fields.batteryVoltage) / 1000).toFixed(1)) + " V",
                    sanitize(sensorData.fields.boardVoltage) + " V",
                    sanitize(sensorData.fields.humidity) + " %",
                    sanitize((Math.pow(Number(sensorData.fields.luminosity), -3.746) * 140000000000000).toFixed(1)) + " lux",
                    sanitize(sensorData.fields.temperature) + " °C",
                    sanitize(sensorData.fields.movement)
                  ],
                  [sanitize(sensorData.tags.deviceId)],
                  "Indisponível",
                  new Date(Number(sensorData.timestamp) / 1e6)
                );
              }
            } else if (sensorData.name === "WaterTankLevel") {
              sensorsInfo.forEach(sensorInfo => {
                if (sensorInfo.DEVEUI == sensorData.tags.deviceId) {
                  newSensor = new GenericSensor(
                    sanitize(sensorInfo.Nome),
                    sensorData.name,
                    [
                      sanitize((sensorData.fields.boardVoltage).toFixed(1)) + " V",
                      sanitize((Number(sensorData.fields.distance) / 1000).toFixed(1)) + " metros"
                    ],
                    [sanitize(sensorData.tags.deviceId)],
                    sanitize(sensorInfo.Local),
                    new Date(Number(sensorData.timestamp) / 1e6)
                  );
                  sensorAlreadyExists = true;
                }
              });
              if (!sensorAlreadyExists) {
                newSensor = new GenericSensor(
                  "Indisponível",
                  sensorData.name,
                  [
                    sanitize((sensorData.fields.boardVoltage).toFixed(1)) + " V",
                    sanitize((Number(sensorData.fields.distance) / 1000).toFixed(1)) + " metros"
                  ],
                  [sanitize(sensorData.tags.deviceId)],
                  "Indisponível",
                  new Date(Number(sensorData.timestamp) / 1e6)
                );
              }
            } else if (sensorData.name === "Hydrometer") {
              sensorsInfo.forEach(sensorInfo => {
                if (sensorInfo.DEVEUI == sensorData.tags.deviceId) {
                  newSensor = new GenericSensor(
                    sanitize(sensorInfo.Nome),
                    sensorData.name,
                    [
                      sanitize(sensorData.fields.boardVoltage).toFixed(1) + " V",
                      sanitize(sensorData.fields.counter)
                    ],
                    [sanitize(sensorData.tags.deviceId)],
                    sanitize(sensorInfo.Local),
                    new Date(Number(sensorData.timestamp) / 1e6)
                  );
                  sensorAlreadyExists = true;
                }
              });
              if (!sensorAlreadyExists) {
                newSensor = new GenericSensor(
                  "Indisponível",
                  sensorData.name,
                  [
                    sanitize(sensorData.fields.boardVoltage).toFixed(1) + " V",
                    sanitize(sensorData.fields.counter)
                  ],
                  [sanitize(sensorData.tags.deviceId)],
                  "Indisponível",
                  new Date(Number(sensorData.timestamp) / 1e6)
                );
              }
            } else if (sensorData.name === "EnergyMeter") {
              sensorsInfo.forEach(sensorInfo => {
                if (sensorInfo.DEVEUI == sensorData.tags.deviceId) {
                  newSensor = new GenericSensor(
                    sanitize(sensorInfo.Nome),
                    sensorData.name,
                    [
                      sanitize(sensorData.fields.boardVoltage).toFixed(1) + " V",
                      sanitize(sensorData.fields.forwardEnergy).toFixed(1) + " kWh",
                      sanitize(sensorData.fields.reverseEnergy).toFixed(1) + " kWh"
                    ],
                    [sanitize(sensorData.tags.deviceId)],
                    sanitize(sensorInfo.Local),
                    new Date(Number(sensorData.timestamp) / 1e6)
                  );
                  sensorAlreadyExists = true;
                }
              });
              if (!sensorAlreadyExists) {
                newSensor = new GenericSensor(
                  "Indisponível",
                  sensorData.name,
                  [
                    sanitize(sensorData.fields.boardVoltage).toFixed(1) + " V",
                    sanitize(sensorData.fields.forwardEnergy).toFixed(1) + " kWh",
                    sanitize(sensorData.fields.reverseEnergy).toFixed(1) + " kWh"
                  ],
                  [sanitize(sensorData.tags.deviceId)],
                  "Indisponível",
                  new Date(Number(sensorData.timestamp) / 1e6)
                );
              }
            } else if (sensorData.name === "WeatherStation") {
              sensorsInfo.forEach(sensorInfo => {
                if (sensorInfo.DEVEUI == sensorData.tags.deviceId) {
                  newSensor = new GenericSensor(
                    sanitize(sensorInfo.Nome),
                    sensorData.name,
                    [
                      sanitize(sensorData.fields.emwAtmPres),
                      sanitize(sensorData.fields.emwAvgWindSpeed),
                      sanitize(sensorData.fields.emwGustWindSpeed),
                      sanitize(sensorData.fields.emwHumidity) + " %",
                      sanitize(sensorData.fields.emwLuminosity),
                      sanitize(sensorData.fields.emwRainLevel),
                      sanitize(sensorData.fields.emwSolarRadiation),
                      sanitize(sensorData.fields.emwTemperature) + " °C",
                      sanitize(sensorData.fields.emwUv)
                    ],
                    [sanitize(sensorData.tags.deviceId)],
                    sanitize(sensorInfo.Local),
                    new Date(Number(sensorData.timestamp) / 1e6)
                  );
                  sensorAlreadyExists = true;
                }
              });
              if (!sensorAlreadyExists) {
                newSensor = new GenericSensor(
                  "Indisponível",
                  sensorData.name,
                  [
                    sanitize(sensorData.fields.emwAtmPres),
                    sanitize(sensorData.fields.emwAvgWindSpeed),
                    sanitize(sensorData.fields.emwGustWindSpeed),
                    sanitize(sensorData.fields.emwHumidity) + " %",
                    sanitize(sensorData.fields.emwLuminosity),
                    sanitize(sensorData.fields.emwRainLevel),
                    sanitize(sensorData.fields.emwSolarRadiation),
                    sanitize(sensorData.fields.emwTemperature) + " °C",
                    sanitize(sensorData.fields.emwUv)
                  ],
                  [sanitize(sensorData.tags.deviceId)],
                  "Indisponível",
                  new Date(Number(sensorData.timestamp) / 1e6)
                );
              }
            }

            if (newSensor) {
              updatedSensores.push(newSensor);
            }
          }
        });

        sensorsInfo.forEach(sensorInfo => {
          const isMissingInSensorsData = !sensorsData.some(sensorData =>
            sanitize(sensorData.tags.deviceId) === sanitize(sensorInfo.DEVEUI)
          );

          if (isMissingInSensorsData) {
            const alreadyExists = updatedSensores.some(sensor =>
              sanitize(sensor.tags[0]) === sanitize(sensorInfo.DEVEUI)
            );

            if (!alreadyExists) {
              updatedSensores.push(
                new GenericSensor(
                  sanitize(sensorInfo.Nome),
                  sanitize(sensorInfo.Tipo),
                  ["Sensor Offline"],
                  [sanitize(sensorInfo.DEVEUI)],
                  sanitize(sensorInfo.Local)
                )
              );
            }
          }
        });

        return updatedSensores;
      });

      setLoading(false);
    };

    fetchSensors();
  }, []);


  // Filtra os sensores com base no filtro e na busca
  useEffect(() => {
    const filtered = sensors.filter((sensor) => {
      return Object.values(sensor).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredSensores(filtered);
  }, [searchQuery, sensors]);

  const [alarmPopupOpen, setAlarmPopupOpen] = useState(false);
  const [alarmSensor, setAlarmSensor] = useState<GenericSensor>();
  const [triggerType, setTriggerType] = useState('');
  const [trigger, setTrigger] = useState<string>('0');
  const [triggerAt, setTriggerAt] = useState<string>('higher');
  const [alarmInsertAttempt, setAlarmInsertAttempt] = useState<boolean>(false);

  const handleNewAlarm = async () => {
    setAlarmInsertAttempt(true);
    const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
    const userEmailResponse = await response.json();
    const userEmail = userEmailResponse.displayName;

    const { data: userData, error } = await supabase
      .from('User')
      .select('id')
      .eq('email', userEmail);

    if (error) {
      console.error('Error fetching user data: ', error);
    }
    else {
      if (triggerType !== "") {
        const { data, error } = await supabase
          .from('Alarms')
          .insert([
            {
              userId: userData[0].id,
              type: alarmSensor.type,
              local: alarmSensor.local,
              deveui: alarmSensor.tags[0],
              trigger: trigger,
              triggerAt: triggerAt,
              triggerType: triggerType,
              alreadyPlayed: false
            },
          ]);
          if (!error) setAlarmInsertAttempt(false);
      }
    } 

    if (alarmInsertAttempt === true) setAlarmPopupOpen(false);
  }

  return (
    <DashboardLayout>
      {alarmPopupOpen ? (
        <div className="flex flex-col w-full">
          <div className="m-4">
            <button
              onClick={() => setAlarmPopupOpen(!alarmPopupOpen)}
              className="m-2 bg-red-500 hover:bg-red-700 text-white text-2xl font-bold py-3 px-6 rounded">
              Voltar
            </button>
          </div>
          <div className="container max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 justify-items-center">
            <div className="m-2 flex justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
              <div className="m-2">
                <p className="font-bold text-3xl text-center">Sensor Selecionado</p>
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                  {alarmSensor.name || "Nome não disponível"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {alarmSensor.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Local: {alarmSensor.local}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  DEVEUI: {alarmSensor.tags[0]}
                </p>
                <ul className="text-sm space-y-2">
                  {alarmSensor.timestamp && <li><strong>Atualizado há:</strong> {formatDistanceToNow(new Date(alarmSensor.timestamp), { locale: pt })}</li>}
                </ul>
              </div>
            </div>
            <div className="m-2 flex flex-col justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
              <div className="m-2">
                <p className="font-bold text-3xl text-center">Criar Alarme</p>
                <p>
                  Escolha o campo para o alarme
                </p>
                {
                  alarmSensor.type == "SmartLight" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={""}></option>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"batteryVoltage"}> batteryVoltage</option>
                      <option value={"humidity"}> humidity</option>
                      <option value={"luminosity"}> luminosity</option>
                      <option value={"temperature"}> temperature</option>
                      <option value={"movement"}> movement</option>
                      <option value={"pressure"}> pressure</option>
                      <option value={"co2"}> co2</option>
                    </select>
                  ) : alarmSensor.type === "WaterTankLevel" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={""}></option>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"distance"}> Distância</option>
                    </select>
                  ) : alarmSensor.type === "Hydrometer" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={""}></option>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"counter"}> Counter</option>
                    </select>
                  ) : alarmSensor.type === "EnergyMeter" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={""}></option>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"forwardEnergy"}> forwardEnergy</option>
                      <option value={"reverseEnergy"}> reverseEnergy</option>
                    </select>
                  ) : alarmSensor.type === "WeatherStation" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={""}></option>
                      <option value={"emwAtmPres"}> Pressão Atmosférica</option>
                      <option value={"emwAvgWindSpeed"}> Velocidade do Vento</option>
                      <option value={"emwGustWindSpeed"}> Velocidade Rajada de Vento</option>
                      <option value={"emwHumidity"}> Humidade</option>
                      <option value={"emwLuminosity"}> Luminosidade</option>
                      <option value={"emwRainLevel"}> Nivel de Chuva</option>
                      <option value={"emwSolarRadiation"}> Radiação Solar</option>
                      <option value={"emwTemperature"}> Temperatura</option>
                      <option value={"emwUv"}> Índice UV</option>
                    </select>
                  ) : (
                    <p></p>
                  )
                }
                <p className="">Quando tocar</p>
                <div className="flex">
                  <select className="border border-black rounded p-1 text-lg" value={triggerAt} onChange={(event) => setTriggerAt(event.target.value)}>
                    <option value={"higher"}> Acima de</option>
                    <option value={"lower"}> Abaixo de</option>
                  </select>
                  <input type="text" id="alarmTrigger" className="mx-1 w-32 border border-black rounded p-1 text-lg" placeholder="Valor" required value={trigger} onChange={(event) => setTrigger(event.target.value)} />
                </div>
              </div>
              <button
                onClick={handleNewAlarm}
                className="m-2 bg-blue-500 text-white px-3 py-1 rounded h-8 text-lg font-bold hover:bg-blue-700"
              >Criar alarme</button>
            </div>
          </div>
          <div className="mt-4 text-5xl text-center font-bold">
            {triggerType == "" && alarmInsertAttempt ? (
              <p className="text-red-500">Insira todos os dados</p>
            ) : (
              <p></p>
            )
            }
          </div>
        </div>
      ) : (
        <div>
          <Head>
            <title>Dados de Sensores | EcoVision GMS</title>
          </Head>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-2xl text-black">Carregando...</p>
            </div>
          ) : (
            <div className="container mx-auto p-8">
              {/* Título */}
              <h1 className="text-3xl font-bold mb-8 text-center">Dados dos Sensores</h1>

              {/* Barra de Pesquisa e Filtro */}
              <div className="flex flex-col md:flex-row md:justify-around gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded p-3 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lista de Sensores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredSensores.map((sensor, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-lg hover:shadow-2xl transition-shadow h-fit"
                  >
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                      {sensor.name || "Nome não disponível"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      {sensor.type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      Local: {sensor.local}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">DeviceId: {sensor.tags[0]}</p>

                    <ul className="text-sm space-y-2">
                      {
                        sensor.type === "SmartLight" && sensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>BatteryVoltage: </strong>{sensor.fields[0]}
                            </li>
                            <li>
                              <strong>BoardVoltage: </strong>{sensor.fields[1]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{sensor.fields[2]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{sensor.fields[3]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{sensor.fields[4]}
                            </li>
                            <li>
                              <strong>Movement: </strong>{sensor.fields[5]}
                            </li>
                          </ul>
                        ) : sensor.type === "WaterTankLevel" && sensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{sensor.fields[0]}
                            </li>
                            <li>
                              <strong>Distância: </strong>{sensor.fields[1]}
                            </li>
                          </ul>
                        ) : sensor.type === "Hydrometer" && sensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{sensor.fields[0]}
                            </li>
                            <li>
                              <strong>Counter: </strong>{sensor.fields[1]}
                            </li>
                          </ul>
                        ) : sensor.type === "EnergyMeter" && sensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{sensor.fields[0]}
                            </li>
                            <li>
                              <strong>ForwardEnergy: </strong>{sensor.fields[1]}
                            </li>
                            <li>
                              <strong>ReverseEnergy: </strong>{sensor.fields[2]}
                            </li>
                          </ul>
                        ) : sensor.type === "WeatherStation" && sensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Pressão Atmosférica: </strong>{sensor.fields[0]}
                            </li>
                            <li>
                              <strong>Velocidade do Vento: </strong>{sensor.fields[1]}
                            </li>
                            <li>
                              <strong>Velocidade Rajada de Vento: </strong>{sensor.fields[2]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{sensor.fields[3]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{sensor.fields[4]}
                            </li>
                            <li>
                              <strong>Nivel de Chuva: </strong>{sensor.fields[5]}
                            </li>
                            <li>
                              <strong>Radiação Solar: </strong>{sensor.fields[6]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{sensor.fields[7]}
                            </li>
                            <li>
                              <strong>Índice UV: </strong>{sensor.fields[8]}
                            </li>
                          </ul>
                        ) : sensor.fields[0] === "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Sensor Offline</strong>
                            </li>
                          </ul>
                        ) : (
                          <p></p>
                        )
                      }
                      {sensor.timestamp && (
                        <li>
                          <strong>Atualizado há: </strong> {formatDistanceToNow(new Date(sensor.timestamp), { locale: pt })}
                        </li>
                      )}
                    </ul>
                    <div>
                      <button onClick={() => { setAlarmPopupOpen(!alarmPopupOpen); setAlarmSensor(sensor) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Adicionar Alarme
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Sensores;
