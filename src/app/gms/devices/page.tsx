"use client";

import Head from "next/head";
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from "react";
import { GenericSensor } from "@/database/dataTypes";
import { supabase } from '@/database/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { fetchSensors } from '@/database/timeseries';

const Sensores = () => {
  const [sensors, setSensors] = useState<GenericSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredSensores, setFilteredSensores] = useState<GenericSensor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

  useEffect(() => {
    async function getSensors() {
      setSensors(await fetchSensors());
      setLoading(false);
    }

    getSensors();
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

  const [exportInfoPopupOpen, setExportInfoPopupOpen] = useState(false);
  const [selectedSensorsExport, setSelectedSensorsExport] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState<GenericSensor>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [interval, setInterval] = useState(30); // Estado para armazenar o intervalo de dias na exportação (.csv) de um sensor

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
        const { data, error } = await supabase.from('Alarms').insert([
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
        if (!error) {
          setAlarmInsertAttempt(false);
          setAlarmPopupOpen(false);
        }
      }
    }
  }

  const addSensorToList = (sensor) => {
    const isSensorAlreadyAdded = selectedSensorsExport.some(existingSensor => existingSensor.name === sensor.name);
  
    if (isSensorAlreadyAdded) {
      alert("Este sensor já foi adicionado à lista.");
      return;
    }
  
    setSelectedSensorsExport([...selectedSensorsExport, sensor]);
  };
  const removeSensorFromList = (index) => {
    const updatedSensors = selectedSensorsExport.filter((_, i) => i !== index);
    setSelectedSensorsExport(updatedSensors);
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 30);
    return today.toISOString().split("T")[0]; 
  };

  const calculateMinutesInterval = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - selectedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60)); 
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    const interval = calculateMinutesInterval(selected);

    if (interval > 43200 || interval <= 0 || Number.isNaN(interval)) {
      alert("Por favor, selecione uma data dentro dos últimos 30 dias ou no máximo 43200 minutos.");
      setSelectedDate("");
      setInterval(30);
    } else {
      setSelectedDate(selected);
      setInterval(interval);
    }
  };

  const handleExportSensor = async (measurement, id, interval) => {
  
    try {
      const url = `https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/${measurement}/deviceId/${id}?interval=${interval}`;
      
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error("Erro ao obter os dados da API");
      }
  
      const jsonData = await response.json();
  
      const jsonToCsv = (json) => {
        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("JSON inválido ou vazio");
        }
  
        const extractKeys = (obj, prefix = "") =>
          Object.keys(obj).reduce((keys, key) => {
            const value = obj[key];
            if (typeof value === "object" && value !== null) {
              return keys.concat(extractKeys(value, `${prefix}${key}.`));
            }
            return keys.concat(`${prefix}${key}`);
          }, []);
  
        const headers = [
          ...new Set(
            json.flatMap((item) => extractKeys(item))
          )
        ];
  
        const rows = json.map((row) => {
          return headers.map((header) => {
            const keys = header.split(".");
            let value = row;
  
            for (const key of keys) {
              value = value?.[key] ?? ""; 
            }
            return typeof value === "object" ? "" : value;
          }).join(",");
        }).join("\n");
  
        return `${headers.join(",")}\n${rows}`;
      };
  
      const csvData = jsonToCsv(jsonData);
  
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");

      const urlBlob = URL.createObjectURL(blob);

      link.href = urlBlob;
      link.download = `${measurement}-${id}-${interval}_minutes.csv`;

      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);

    } catch (error) {
      console.error("Erro ao processar os dados:", error);
    }
  };
  
  
  const handleListExportSensors = async (interval) => {
    try {
      const sensorIds = selectedSensorsExport.map((sensor) => sensor.tags[0]);
      const allData = [];
  
      for (const id of sensorIds) {
        const sensor = selectedSensorsExport.find(sensor => sensor.tags[0] === id);
        const measurement = sensor.type;
  
        console.log(`Buscando dados para o sensor ${id}, Measurement: ${measurement}, Intervalo: ${interval}`);
  
        const url = `https://smartcampus-k8s.maua.br/api/timeseries/v0.3/IMT/LNS/${measurement}/deviceId/${id}?interval=${interval}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();  
          console.error(`Erro ao obter dados do sensor ID ${id} com measurement ${measurement}: ${errorText}`);
          continue;
        }
  
        const jsonData = await response.json();
        allData.push(...jsonData);
      }
  
      if (allData.length === 0) {
        console.warn("Nenhum dado foi coletado para os sensores selecionados.");
        return;
      }
  
      const jsonToCsv = (json) => {
        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("JSON inválido ou vazio");
        }
  
        const extractKeys = (obj, prefix = "") =>
          Object.keys(obj).reduce((keys, key) => {
            const value = obj[key];
            if (typeof value === "object" && value !== null) {
              return keys.concat(extractKeys(value, `${prefix}${key}.`));
            }
            return keys.concat(`${prefix}${key}`);
          }, []);
  
        const headers = [
          ...new Set(
            json.flatMap((item) => extractKeys(item))
          )
        ];
  
        const rows = json.map((row) => {
          return headers.map((header) => {
            const keys = header.split(".");
            let value = row;
  
            for (const key of keys) {
              value = value?.[key] ?? "";
            }
            return typeof value === "object" ? "" : value;
          }).join(",");
        }).join("\n");
  
        return `${headers.join(",")}\n${rows}`;
      };
  
      const csvData = jsonToCsv(allData);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
  
      link.href = urlBlob;
      link.download = `sensors-data-${Date.now()}.csv`;
  
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);
  
      console.log("Exportação concluída com sucesso!");
  
    } catch (error) {
      console.error("Erro ao processar os dados:", error);
    }
  };
  
  

  return (
    <DashboardLayout>
      {exportInfoPopupOpen ? (
        <div className="flex flex-col w-full">
          <div className="m-4">
            <button
              onClick={() => setExportInfoPopupOpen(!exportInfoPopupOpen)}
              className="m-2 bg-red-500 hover:bg-red-700 text-white text-2xl font-bold py-3 px-6 rounded">
              Voltar
            </button>
          </div>
          <div className="container max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 justify-items-center">
          <div className="m-2 flex justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
              <div className="m-2">
                <p className="font-bold text-3xl text-center">Sensor Selecionado</p>
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                  {selectedSensor.name || "Nome não disponível"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Local: {selectedSensor.local}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  DEVEUI: {selectedSensor.tags[0]}
                </p>
                <ul className="text-sm space-y-2">
                {
                        selectedSensor.type === "SmartLight" && selectedSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>BatteryVoltage: </strong>{selectedSensor.fields[0]}
                            </li>
                            <li>
                              <strong>BoardVoltage: </strong>{selectedSensor.fields[1]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{selectedSensor.fields[2]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{selectedSensor.fields[3]}
                            </li>
                            <li>
                              <strong>Movement: </strong>{selectedSensor.fields[4]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{selectedSensor.fields[5]}
                            </li>
                          </ul>
                        ) : selectedSensor.type === "WaterTankLevel" && selectedSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{selectedSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Distância: </strong>{selectedSensor.fields[1]}
                            </li>
                          </ul>
                        ) : selectedSensor.type === "Hydrometer" && selectedSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{selectedSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Counter: </strong>{selectedSensor.fields[1]}
                            </li>
                          </ul>
                        ) : selectedSensor.type === "EnergyMeter" && selectedSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{selectedSensor.fields[0]}
                            </li>
                            <li>
                              <strong>ForwardEnergy: </strong>{selectedSensor.fields[1]}
                            </li>
                            <li>
                              <strong>ReverseEnergy: </strong>{selectedSensor.fields[2]}
                            </li>
                          </ul>
                        ) : selectedSensor.type === "WeatherStation" && selectedSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Pressão Atmosférica: </strong>{selectedSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Velocidade do Vento: </strong>{selectedSensor.fields[1]}
                            </li>
                            <li>
                              <strong>Velocidade Rajada de Vento: </strong>{selectedSensor.fields[2]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{selectedSensor.fields[3]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{selectedSensor.fields[4]}
                            </li>
                            <li>
                              <strong>Nivel de Chuva: </strong>{selectedSensor.fields[5]}
                            </li>
                            <li>
                              <strong>Radiação Solar: </strong>{selectedSensor.fields[6]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{selectedSensor.fields[7]}
                            </li>
                            <li>
                              <strong>Índice UV: </strong>{selectedSensor.fields[8]}
                            </li>
                            <li>
                              <strong>C1State: </strong>{selectedSensor.fields[9]}
                            </li>
                            <li>
                              <strong>C2State: </strong>{selectedSensor.fields[10]}
                            </li>
                          </ul>
                        ) : selectedSensor.fields[0] === "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Sensor Offline</strong>
                            </li>
                          </ul>
                        ) : (
                          <p></p>
                        )
                      }
                      {selectedSensor.timestamp && (
                        <li>
                          <strong>Atualizado há: </strong> {formatDistanceToNow(new Date(selectedSensor.timestamp), { locale: pt })}
                        </li>
                      )}
                </ul>
              </div>
            </div>
            {/* Field to define the time interval */}
            <div className="m-2 flex justify-center h-fit max-w-[24rem] bg-grey-500 rounded">
              <div className="m-2">
                <label htmlFor="dateInput" className="text-black font-bold">
                  Selecione uma data (máximo: últimos 30 dias):
                </label>
                <input
                  type="date"
                  id="dateInput"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split("T")[0]} 
                  min={getMaxDate()} 
                  className="py-2 px-4 rounded border"
                />
                <label htmlFor="minutesInput" className="text-black font-bold mt-4 block">
                Escolha um intervalo de tempo em minutos:
              </label>
              <input
                type="number"
                id="minutesInput"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                min={1} 
                max={43200} 
                className="py-2 px-4 rounded border w-full"
                placeholder="Digite o período em minutos"
              />
                {interval !== null && (
                  <p className="text-sm text-gray-600 mt-2">
                    Você selecionou um período de {interval} minutos.<br/>Aproximadamente {Math.round(interval / 1440)} dias.
                  </p>
                )}
              </div>
              
              <div className="m-2">
                <button
                  onClick={() => {
                    setExportInfoPopupOpen(false);
                    handleExportSensor(selectedSensor.type, selectedSensor.tags[0], interval);
                  }}
                  className="bg-left text-white font-bold py-2 px-4 rounded border border-green-400 bg-green-400 hover:bg-green-700 "
                >
                  Exportar .csv
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
                {
                        alarmSensor.type === "SmartLight" && alarmSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>BatteryVoltage: </strong>{alarmSensor.fields[0]}
                            </li>
                            <li>
                              <strong>BoardVoltage: </strong>{alarmSensor.fields[1]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{alarmSensor.fields[2]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{alarmSensor.fields[3]}
                            </li>
                            <li>
                              <strong>Movement: </strong>{alarmSensor.fields[4]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{alarmSensor.fields[5]}
                            </li>
                          </ul>
                        ) : alarmSensor.type === "WaterTankLevel" && alarmSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{alarmSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Distância: </strong>{alarmSensor.fields[1]}
                            </li>
                          </ul>
                        ) : alarmSensor.type === "Hydrometer" && alarmSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{alarmSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Counter: </strong>{alarmSensor.fields[1]}
                            </li>
                          </ul>
                        ) : alarmSensor.type === "EnergyMeter" && alarmSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>boardVoltage: </strong>{alarmSensor.fields[0]}
                            </li>
                            <li>
                              <strong>ForwardEnergy: </strong>{alarmSensor.fields[1]}
                            </li>
                            <li>
                              <strong>ReverseEnergy: </strong>{alarmSensor.fields[2]}
                            </li>
                          </ul>
                        ) : alarmSensor.type === "WeatherStation" && alarmSensor.fields[0] !== "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Pressão Atmosférica: </strong>{alarmSensor.fields[0]}
                            </li>
                            <li>
                              <strong>Velocidade do Vento: </strong>{alarmSensor.fields[1]}
                            </li>
                            <li>
                              <strong>Velocidade Rajada de Vento: </strong>{alarmSensor.fields[2]}
                            </li>
                            <li>
                              <strong>Humidade: </strong>{alarmSensor.fields[3]}
                            </li>
                            <li>
                              <strong>Luminosidade: </strong>{alarmSensor.fields[4]}
                            </li>
                            <li>
                              <strong>Nivel de Chuva: </strong>{alarmSensor.fields[5]}
                            </li>
                            <li>
                              <strong>Radiação Solar: </strong>{alarmSensor.fields[6]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{alarmSensor.fields[7]}
                            </li>
                            <li>
                              <strong>Índice UV: </strong>{alarmSensor.fields[8]}
                            </li>
                            <li>
                              <strong>C1State: </strong>{alarmSensor.fields[9]}
                            </li>
                            <li>
                              <strong>C2State: </strong>{alarmSensor.fields[10]}
                            </li>
                          </ul>
                        ) : alarmSensor.fields[0] === "Sensor Offline" ? (
                          <ul>
                            <li>
                              <strong>Sensor Offline</strong>
                            </li>
                          </ul>
                        ) : (
                          <p></p>
                        )
                      }
                      {alarmSensor.timestamp && (
                        <li>
                          <strong>Atualizado há: </strong> {formatDistanceToNow(new Date(alarmSensor.timestamp), { locale: pt })}
                        </li>
                      )}
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
                      <option value={"counter"}> counter</option>
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
                      <option value={"c1State"}> C1State</option>
                      <option value={"c2State"}> C2State</option>
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
      ) : null}
      {!exportInfoPopupOpen && !alarmPopupOpen && (
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
              {/* Title */}
              <h1 className="text-3xl font-bold mb-8 text-center">Dados dos Sensores</h1>

             {/* Button to show or hide the list */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="mb-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg "
              >
                {isDropdownOpen ? "Esconder lista de sensores" : "Lista de sensores"}
              </button>

              {isDropdownOpen && (
                <div className="absolute bg-gray-50 border rounded-lg shadow-lg mt-2 w-80 max-h-80 overflow-y-auto transition-all duration-300 ease-in-out opacity-0 transform translate-y-4 opacity-100 translate-y-0">
                  <ul className="space-y-3 p-4">
                    {selectedSensorsExport.length === 0 ? (
                      <div className="text-center text-gray-600">Selecione sensores para exportar seus dados em .csv</div>
                    ) : (
                      selectedSensorsExport.map((sensor, index) => (
                        <li key={index} className="border-b pb-3 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-lg">{sensor.name || 'Nome não disponível'}</p>
                            <p className="text-sm text-gray-500">Local: {sensor.local}</p>
                            <p className="text-sm text-gray-500">DEVEUI: {sensor.tags[0]}</p>
                          </div>
                          <button
                            onClick={() => removeSensorFromList(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            aria-label="Remover sensor"
                          >
                            X
                          </button>
                        </li>
                      ))
                    )}
                  </ul>

                  {/* Field to define the time interval */}
                  {selectedSensorsExport.length > 0 && (
                    <div className="mt-4 p-4 shadow-md">
                      <div className="mb-4">
                        <label htmlFor="interval" className="block text-sm font-medium text-gray-700">Intervalo:</label>
                        <input
                          type="date"
                          id="dateInput"
                          value={selectedDate}
                          onChange={handleDateChange}
                          max={new Date().toISOString().split("T")[0]} 
                          min={getMaxDate()} 
                          className="w-full py-2 px-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="minutesInput" className="block text-sm font-medium text-gray-700">Escolha um intervalo de tempo em minutos:</label>
                        <input
                          type="number"
                          id="minutesInput"
                          value={interval}
                          onChange={(e) => setInterval(Number(e.target.value))}
                          min={1} 
                          max={43200} 
                          className="w-full py-2 px-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                          placeholder="Digite o período em minutos"
                        />
                        {interval !== null && (
                          <p className="text-sm text-gray-600 mt-2">
                            Você selecionou um período de {interval} minutos. Aproximadamente {Math.round(interval / 1440)} dias.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  {selectedSensorsExport.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => handleListExportSensors(interval)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Exportar .csv
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row md:justify-around gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded p-3 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* List of sensors */}
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
                              <strong>Movement: </strong>{sensor.fields[4]}
                            </li>
                            <li>
                              <strong>Temperatura: </strong>{sensor.fields[5]}
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
                            <li>
                              <strong>C1State: </strong>{sensor.fields[9]}
                            </li>
                            <li>
                              <strong>C2State: </strong>{sensor.fields[10]}
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
                      <button onClick={() => { setAlarmPopupOpen(!alarmPopupOpen); setAlarmSensor(sensor) }} className="bg-blue-500  hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Adicionar Alarme
                      </button>
                    </div>
                    <div className="flex mt-2 space-x-2">
                    <button
                      onClick={() => {
                        setExportInfoPopupOpen(true);
                        setSelectedSensor(sensor); 
                      }}
                      className="w-1/2 bg-blue-500 text-white font-bold py-3 px-6 rounded-l-lg hover:bg-blue-600"
                    >
                      Exportar .csv
                    </button>
                    <button
                      onClick={() => addSensorToList(sensor)}
                      className="w-1/2 bg-blue-500 text-white font-bold py-3 px-6 rounded-r-lg hover:bg-blue-600"
                    >
                      Adicionar à lista
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
