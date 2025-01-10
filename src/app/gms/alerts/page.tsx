"use client";

import Head from 'next/head';
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from 'react';
import { GenericSensor, AlarmeValue } from '@/database/dataTypes';
import { fetchSensors } from '@/database/timeseries';
import { supabase } from '@/database/supabaseClient';

const Alarmes = () => {
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

  const [alarmes, setAlarmes] = useState<AlarmeValue[]>([]);
  const [alarmEditPopupOpen, setAlarmEditPopupOpen] = useState(false);
  const [triggerType, setTriggerType] = useState('boardVoltage');
  const [trigger, setTrigger] = useState<string>('0');
  const [triggerAt, setTriggerAt] = useState<string>('higher');
  const [sensors, setSensors] = useState<GenericSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlarme, setSelectedAlarme] = useState<AlarmeValue>();
  const [sendingNewAlarm, setSendingNewAlarm] = useState<boolean>(false);

  useEffect(() => {
    async function getSensors() {
      setSensors(await fetchSensors());
      setLoading(false);
    }

    getSensors();
  }, []);

  async function deleteAlarme(alarme) {
    const { data, error } = await supabase
      .from("Alarms")
      .delete()
      .eq('id', alarme.id);

    if (error) {
      console.error('Error deleting alarm:', error);
      return { success: false, error };
    }

    setAlarmes(alarmes.filter((item) => item.id !== alarme.id));
  };

  useEffect(() => {
    const getAlarmes = async () => {
      const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
      const userEmailResponse = await response.json();
      const userEmail = userEmailResponse.displayName;

      const { data: userData, error } = await supabase
        .from('User')
        .select('id')
        .eq('email', userEmail);

      if (error) {
        console.error('Error fetching user data: ', error);
      } else {
        const { data: alarmsData, error } = await supabase
          .from('Alarms')
          .select('id, userId, type, local, deveui, trigger, triggerAt, triggerType, alreadyPlayed')
          .eq('userId', userData[0].id);

        if (error) {
          console.error('Error fetching user alarms: ', error);
        }
        else {
          var newAlarmes = [];

          alarmsData.forEach(alarmData => {
            var currentValue;
            sensors.forEach(sensor => {
              if (sensor.tags[0] === alarmData.deveui) {
                function getNumericValue(value) {
                  value += ""; // Fix caso value não seja string
                  return parseFloat(value.split(' ')[0]);
                }
                switch (alarmData.triggerType) {
                  case "boardVoltage": {
                    currentValue = getNumericValue(sensor.fields[0]).toFixed(1);
                    break;
                  }
                  case "batteryVoltage": {
                    currentValue = getNumericValue(sensor.fields[1]).toFixed(1);
                    break;
                  }
                  case "humidity": {
                    currentValue = getNumericValue(sensor.fields[2]).toFixed(1);
                    break;
                  }
                  case "luminosity": {
                    currentValue = getNumericValue(sensor.fields[3]).toFixed(1);
                    break;
                  }
                  case "movement": {
                    currentValue = getNumericValue(sensor.fields[4]).toFixed(1);
                    break;
                  }
                  case "temperature": {
                    currentValue = getNumericValue(sensor.fields[5]).toFixed(1);
                    break;
                  }
                  case "distance": {
                    currentValue = getNumericValue(sensor.fields[1]).toFixed(1);
                    break;
                  }
                  case "counter": {
                    currentValue = getNumericValue(sensor.fields[1]).toFixed(1);
                    break;
                  }
                  case "forwardEnergy": {
                    currentValue = getNumericValue(sensor.fields[1]).toFixed(1);
                    break;
                  }
                  case "reverseEnergy": {
                    currentValue = getNumericValue(sensor.fields[2]).toFixed(1);
                    break;
                  }
                  case "emwAtmPres": {
                    currentValue = getNumericValue(sensor.fields[0]).toFixed(1);
                    break;
                  }
                  case "emwAvgWindSpeed": {
                    currentValue = getNumericValue(sensor.fields[1]).toFixed(1);
                    break;
                  }
                  case "emwGustWindSpeed": {
                    currentValue = getNumericValue(sensor.fields[2]).toFixed(1);
                    break;
                  }
                  case "emwHumidity": {
                    currentValue = getNumericValue(sensor.fields[3]).toFixed(1);
                    break;
                  }
                  case "emwLuminosity": {
                    currentValue = getNumericValue(sensor.fields[4]).toFixed(1);
                    break;
                  }
                  case "emwRainLevel": {
                    currentValue = getNumericValue(sensor.fields[5]).toFixed(1);
                    break;
                  }
                  case "emwSolarRadiation": {
                    currentValue = getNumericValue(sensor.fields[6]).toFixed(1);
                    break;
                  }
                  case "emwTemperature": {
                    currentValue = getNumericValue(sensor.fields[7]).toFixed(1);
                    break;
                  }
                  case "emwUv": {
                    currentValue = getNumericValue(sensor.fields[8]).toFixed(1);
                    break;
                  }
                }

              }
            });
            newAlarmes.push(new AlarmeValue(
              alarmData.id,
              alarmData.userId,
              alarmData.type,
              alarmData.local,
              alarmData.deveui,
              alarmData.trigger,
              alarmData.triggerAt,
              alarmData.triggerType,
              alarmData.alreadyPlayed,
              currentValue
            ));
          });
          setAlarmes(newAlarmes);
        }
      }
      setSendingNewAlarm(false);
    };

    getAlarmes();
  }, [sensors, sendingNewAlarm]);

  const openEditPopup = (alarme: AlarmeValue) => {
    const newSelectedAlarme = new AlarmeValue(
      alarme.id,
      alarme.userId,
      alarme.type,
      alarme.local,
      alarme.deveui,
      alarme.trigger,
      alarme.triggerAt,
      alarme.triggerType,
      alarme.alreadyPlayed,
      alarme.currentValue
    );
    setSelectedAlarme(newSelectedAlarme);
    setTrigger(newSelectedAlarme.trigger);
    setTriggerAt(newSelectedAlarme.triggerAt);
    setTriggerType(newSelectedAlarme.triggerType);
    setAlarmEditPopupOpen(true);
  };

  const handleEditAlarm = async (editedAlarme: AlarmeValue) => {
    const { error } = await supabase
      .from('Alarms')
      .update({
        type: editedAlarme.type,
        local: editedAlarme.local,
        deveui: editedAlarme.deveui,
        trigger: editedAlarme.trigger,
        triggerAt: editedAlarme.triggerAt,
        triggerType: editedAlarme.triggerType,
        alreadyPlayed: editedAlarme.alreadyPlayed,
      })
      .eq('id', editedAlarme.id);

    if (error) {
      console.error('Erro ao atualizar alarme no banco de dados', error);
    }
  };

  const [alarmError, setAlarmError] = useState<boolean>(false);
  function updateAlarm() {
    if (selectedAlarme.triggerType === "") {
      setAlarmError(true);
      return;
    }

    setAlarmError(false);

    const updatedAlarme = new AlarmeValue(
      selectedAlarme.id,
      selectedAlarme.userId,
      selectedAlarme.type,
      selectedAlarme.local,
      selectedAlarme.deveui,
      trigger,
      triggerAt,
      triggerType,
      selectedAlarme.alreadyPlayed,
      selectedAlarme.currentValue
    );

    handleEditAlarm(updatedAlarme);
    setAlarmEditPopupOpen(false);
    setSendingNewAlarm(true); // Atualiza alarmes, mais rápido fazer o fetch no supabase outra vez do que atualizar os valores pelos sensores
  }

  return (
    <DashboardLayout>
      <div>
        <Head>
          <title>Alarmes | EcoVision GMS</title>
        </Head>

        {/* Edição de alarme */}
        {loading || sendingNewAlarm ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-2xl text-black">Carregando...</p>
          </div>
        ) : alarmEditPopupOpen && selectedAlarme ? (
          <div className="flex flex-col w-full">
            <div className="m-4">
              <button
                onClick={() => setAlarmEditPopupOpen(!alarmEditPopupOpen)}
                className="m-2 bg-red-500 hover:bg-red-700 text-white text-2xl font-bold py-3 px-6 rounded">
                Voltar
              </button>
            </div>
            <div className="container max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 justify-items-center">
              <div className="m-2 flex justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
                <div className="m-2">
                  <p className="font-bold text-3xl text-center">Alarme Selecionado</p>
                  <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                    {selectedAlarme.type || "Nome não disponível"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    Local: {selectedAlarme.local}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    DEVEUI: {selectedAlarme.deveui}
                  </p>
                  <ul className="text-sm space-y-2 font-bold">
                    <li>
                      Tipo: {selectedAlarme.type}
                    </li>
                    <li>
                      Valor escolhido: {selectedAlarme.triggerType}
                    </li>
                    <li>
                      Tocar: {selectedAlarme.triggerAt === "higher" ? "Acima de " : "Abaixo de "}{selectedAlarme.trigger}
                    </li>
                    <li>
                      Valor atual: {selectedAlarme.currentValue}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="m-2 flex flex-col justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
                <div className="m-2">
                  <p className="font-bold text-3xl text-center">Editar Alarme</p>
                  <p>
                    Escolha o campo para o alarme
                  </p>
                  {selectedAlarme.type === "SmartLight" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"batteryVoltage"}> batteryVoltage</option>
                      <option value={"humidity"}> humidity</option>
                      <option value={"luminosity"}> luminosity</option>
                      <option value={"temperature"}> temperature</option>
                      <option value={"movement"}> movement</option>
                    </select>
                  ) : selectedAlarme.type === "WaterTankLevel" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"distance"}> distance</option>
                    </select>
                  ) : selectedAlarme.type === "Hydrometer" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"counter"}> counter</option>
                    </select>
                  ) : selectedAlarme.type === "EnergyMeter" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                      <option value={"boardVoltage"}> boardVoltage</option>
                      <option value={"forwardEnergy"}> forwardEnergy</option>
                      <option value={"reverseEnergy"}> reverseEnergy</option>
                    </select>
                  ) : selectedAlarme.type === "WeatherStation" ? (
                    <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
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
                  )}
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
                  onClick={() => { updateAlarm() }}
                  className="m-2 bg-blue-500 text-white px-3 py-1 rounded h-8 text-lg font-bold hover:bg-blue-700"
                >Editar alarme</button>
              </div>
            </div>
            <div className="mt-4 text-5xl text-center font-bold">
              {alarmError ? (
                <p className="text-red-500">Insira todos os dados</p>
              ) : (
                <p></p>
              )}
            </div>
          </div>
        ) : (


          <div className="flex-col space-around justify-center items-center p-8">

            <div className="grid w-full gap-10 mx-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

              {alarmes.map((alarme, index) => {
                const isTriggered = alarme.triggerAt == "higher" ? alarme.currentValue > Number(alarme.trigger) : alarme.currentValue < Number(alarme.trigger);

                return (
                  <div
                    key={index}
                    className={`animate-fade-in relative h-64 w-56 overflow-hidden rounded-xl ${isTriggered ? "bg-red-500 text-red-100" : "bg-white dark:bg-neutral-900 dark:text-neutral-700"} shadow-md`}
                    style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}
                  >
                    <div className="flex justify-between">
                      <button
                        onClick={() => { deleteAlarme(alarme); }}
                        className={`${isTriggered ? "text-white" : "text-black"} text-4xl ml-2`}
                      >
                        &times;
                      </button>
                      <button
                        onClick={() => openEditPopup(alarme)}
                        className={`${isTriggered ? "text-white" : "text-black"} font-bold p-2`}
                      >
                        Editar
                      </button>
                    </div>
                    <div className="">
                      <svg
                        className="z-10 mx-auto mt-2 fill-current shadow-yellow-300 drop-shadow-2xl"
                        xmlns="http://www.w3.org/2000/svg"
                        width="90"
                        height="90"
                        viewBox="0 0 16 16"
                      >
                        <g fill="currentColor" transform="translate(1.000000, 0.000000)">
                          <path d="M13.654,0.659 C12.342,-0.292 10.604,-0.105 9.664,1.042 C10.615,1.358 11.535,1.827 12.393,2.449 C13.25,3.073 13.983,3.807 14.586,4.622 C15.35,3.347 14.965,1.614 13.654,0.659 Z" />
                          <path d="M2.644,2.427 C3.502,1.811 4.422,1.347 5.374,1.032 C4.433,-0.104 2.694,-0.288 1.383,0.654 C0.072,1.6 -0.314,3.316 0.451,4.579 C1.055,3.773 1.788,3.045 2.644,2.427 Z" />
                          <path d="M13.924,8.633 C13.924,8.435 13.912,8.24 13.896,8.047 C13.624,4.907 11.198,2.401 8.131,2.081 L8.131,2.081 C7.995,2.065 7.858,2.064 7.719,2.059 C7.637,2.055 7.555,2.045 7.471,2.045 L7.469,2.045 L7.467,2.045 C3.899,2.045 1.008,4.994 1.008,8.633 C1.008,8.662 1.012,8.692 1.013,8.721 C1.035,10.574 1.815,12.235 3.041,13.415 C2.633,13.627 2.348,14.056 2.348,14.558 C2.348,15.267 2.912,15.842 3.608,15.842 C4.274,15.842 4.812,15.315 4.858,14.648 C5.547,14.959 6.298,15.155 7.089,15.202 C7.215,15.21 7.34,15.222 7.467,15.222 C7.612,15.222 7.752,15.209 7.897,15.2 C8.698,15.146 9.458,14.939 10.153,14.614 C10.182,15.298 10.729,15.843 11.406,15.843 C12.102,15.843 12.665,15.268 12.665,14.559 C12.665,14.036 12.36,13.589 11.922,13.388 C13.152,12.19 13.924,10.506 13.924,8.633 Z M7.527,13.314 C4.964,13.314 2.88,11.198 2.88,8.598 C2.88,5.998 4.964,3.884 7.527,3.884 C10.089,3.884 12.174,5.998 12.174,8.598 C12.174,11.198 10.089,13.314 7.527,13.314 Z" />
                          <rect x="7" y="5" width="1" height="4" />
                          <rect x="7" y="8" width="3" height="1" />
                        </g>
                      </svg>
                    </div>
                    <div className="absolute left-3">
                      <h1 className="text-sm font-semibold">
                        <p className={`mt-3 mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                          {alarme.local}
                        </p>
                        <p className={`mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                          {alarme.type}
                        </p>
                        <p className={`mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                          {alarme.triggerType}
                        </p>
                        <p className={`mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                          Tocar: {alarme.triggerAt == 'higher' ? "Acima de " : "Abaixo de "}{alarme.trigger}{
                            alarme.triggerType === "boardVoltage" ? "V" :
                              alarme.triggerType === "batteryVoltage" ? "V" :
                                alarme.triggerType === "humidity" ? "%" :
                                  alarme.triggerType === "luminosity" ? " lux" :
                                    alarme.triggerType === "temperature" ? "°C" : ""
                          }
                        </p>
                        <p className={`mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                          Valor atual: {String(alarme.currentValue)}{
                            alarme.triggerType === "boardVoltage" ? "V" :
                              alarme.triggerType === "batteryVoltage" ? "V" :
                                alarme.triggerType === "humidity" ? "%" :
                                  alarme.triggerType === "luminosity" ? "lux" :
                                    alarme.triggerType === "temperature" ? "°C" : ""
                          }
                        </p>
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>)}
      </div>
    </DashboardLayout>
  );
};

export default Alarmes;
