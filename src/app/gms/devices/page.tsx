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
import { Alarme } from "@/database/dataTypes";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const Sensores = () => {
  const [sensores, setSensors] = useState<GenericSensor[]>([]);
  const [filteredSensores, setFilteredSensores] = useState<GenericSensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("local");
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;


  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const { data: sensors, error } = await supabase.from('Sensors').select("Nome, DEVEUI, Bloco, Sala");
        if (error) {
          console.error('Error fetching sensors data: ', error);
          return;
        }
        const deveuiToLocalMap: Record<string, string> = {};
        sensors?.forEach((sensor) => {
          deveuiToLocalMap[sensor.DEVEUI] = `${sensor.Bloco} - ${sensor.Sala}`;
        });

        const allSensorsData = await fetchAllSensors();
        const uniqueDeviceIds = new Set();
        const newSensors = allSensorsData.filter((entry: any) => {
          const { deviceId } = entry.tags;
          if (uniqueDeviceIds.has(deviceId)) {
            return false;
          }
          uniqueDeviceIds.add(deviceId);
          return true;
        })
          .map((entry: any) => {
            const { fields, tags, name, timestamp} = entry;
            const { boardVoltage, batteryVoltage, humidity, luminosity, temperature, movement, pressure, co2 } = fields;
            const { deviceId, type } = tags;

            const local = deveuiToLocalMap[deviceId] || "ID não encontrado";

            return new GenericSensor(
              name,
              type,
              deviceId, // deveui
              boardVoltage,
              batteryVoltage ? batteryVoltage / 1000 : null,
              humidity,
              luminosity,
              temperature,
              movement,
              pressure,
              co2,
              local,
              new Date(Number(timestamp) / 1000000)
            );
          });
        const sortedSensors: GenericSensor[] = newSensors.sort((a: { local }, b: { local }) => // RC-EDIT
          a.local.localeCompare(b.local)
        );
        setSensors(sortedSensors);
      } catch (err) {
        console.error('Unexpected error occurred:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, []);

  // Filtra os sensores com base no filtro e na busca
  useEffect(() => {
    const filtered = sensores.filter((sensor) => {
      // Corrigir a chamada do método toString()
      const value = sensor[selectedFilter as keyof GenericSensor]?.toString() || "";
      return value.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredSensores(filtered);
  }, [searchQuery, selectedFilter, sensores]);

  const [alarmPopupOpen, setAlarmPopupOpen] = useState(false);
  const [alarmSensor, setAlarmSensor] = useState<GenericSensor>();
  const [triggerType, setTriggerType] = useState('boardVoltage');
  const [trigger, setTrigger] = useState<string>('0');
  const [triggerAt, setTriggerAt] = useState<string>('higher');
  var [newAlarm, setNewAlarm] = useState<Alarme>();
  // const [alarmError, setAlarmError] = useState<boolean>(); // Removendo até fazer um popup bonito ao invés do texto verde

  const handleNewAlarm = () => {
    const newAlarmData = new Alarme(
      alarmSensor.deveui,
      trigger,
      triggerAt,
      triggerType,
      alarmSensor.local,
      alarmSensor.name,
      false
    )

    setNewAlarm(newAlarmData);
  }

  useEffect(() => {
    const updateDatabaseAlarmes = async () => {
      try {
        if(newAlarm == null) return;

        const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
        const dataEmail = await response.json();

        const newAlarmEntry = newAlarm;

        const { error } = await supabase.rpc('append_to_alarms', {
          email_param: dataEmail.displayName,
          new_alarm: newAlarmEntry,
        });

        if (error) {
          console.error('Error appending alarm to database', error);
          // setAlarmError(true);
        }
      } catch (error) {
        console.error('Unexpected error', error);
        // setAlarmError(true);
      }
      // setAlarmError(false);
    };

    updateDatabaseAlarmes();
    setAlarmPopupOpen(false);
  }, [newAlarm]);


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
                  Local: {alarmSensor.local}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  DEVEUI: {alarmSensor.deveui}
                </p>
                <ul className="text-sm space-y-2">
                  {alarmSensor.boardVoltage && <li><strong>Board Voltage:</strong> {alarmSensor.boardVoltage} V</li>}
                  {alarmSensor.batteryVoltage && <li><strong>Battery Voltage:</strong> {alarmSensor.batteryVoltage} V</li>}
                  {alarmSensor.humidity && <li><strong>Humidity:</strong> {alarmSensor.humidity}%</li>}
                  {alarmSensor.luminosity && <li><strong>Luminosity:</strong> {alarmSensor.luminosity} lux</li>}
                  {alarmSensor.temperature && <li><strong>Temperature:</strong> {alarmSensor.temperature}°C</li>}
                  {alarmSensor.movement && <li><strong>Movement:</strong> {alarmSensor.movement}</li>}
                  {alarmSensor.pressure && <li><strong>Pressure:</strong> {alarmSensor.pressure} Pa</li>}
                  {alarmSensor.co2 && <li><strong>CO2:</strong> {alarmSensor.co2} ppm</li>}
                </ul>
              </div>
            </div>
            <div className="m-2 flex flex-col justify-center h-fit max-w-[24rem] border border-gray-400 bg-gray-50 rounded">
              <div className="m-2">
                <p className="font-bold text-3xl text-center">Criar Alarme</p>
                <p>
                  Escolha o campo para o alarme
                </p>
                <select className="border border-black rounded p-1 text-lg" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                  <option value={"boardVoltage"}> boardVoltage</option>
                  <option value={"batteryVoltage"}> batteryVoltage</option>
                  <option value={"humidity"}> humidity</option>
                  <option value={"luminosity"}> luminosity</option>
                  <option value={"temperature"}> temperature</option>
                  <option value={"movement"}> movement</option>
                  <option value={"pressure"}> pressure</option>
                  <option value={"co2"}> co2</option>
                </select>
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
          {/* <div className="mt-4 text-5xl text-center font-bold">
            {!alarmError && newAlarm ? (
              <p className="text-green-500">Alarme inserido com sucesso</p>
            ) : alarmError && newAlarm ?(
              <p className="text-red-500">Por favor, preencha todos os campos</p>
            ) : <p></p>
          }
          </div> */}
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
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border rounded p-3 w-full md:w-1/4 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deveui">Deveui</option>
                  <option value="local">Local</option>
                  <option value="name">Nome</option>
                  <option value="type">Tipo</option>
                  <option value="boardVoltage">Board Voltage</option>
                  <option value="batteryVoltage">Battery Voltage</option>
                  <option value="humidity">Humidity</option>
                  <option value="luminosity">Luminosity</option>
                  <option value="temperature">Temperature</option>
                  <option value="movement">Movement</option>
                  <option value="pressure">Pressure</option>
                  <option value="co2">CO2</option>
                </select>
              </div>

              {/* Lista de Sensores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredSensores.map((sensor, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                      {sensor.name || "Nome não disponível"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      Local: {sensor.local}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">DEVEUI: {sensor.deveui}</p>

                    <ul className="text-sm space-y-2">
                      {sensor.boardVoltage && (
                        <li>
                          <strong>Board Voltage:</strong> {sensor.boardVoltage} V
                        </li>
                      )}
                      {sensor.batteryVoltage && (
                        <li>
                          <strong>Battery Voltage:</strong> {sensor.batteryVoltage} V
                        </li>
                      )}
                      {sensor.humidity && (
                        <li>
                          <strong>Humidity:</strong> {sensor.humidity}%
                        </li>
                      )}
                      {sensor.luminosity && (
                        <li>
                          <strong>Luminosity:</strong> {sensor.luminosity} lux
                        </li>
                      )}
                      {sensor.temperature && (
                        <li>
                          <strong>Temperature:</strong> {sensor.temperature}°C
                        </li>
                      )}
                      {sensor.movement && (
                        <li>
                          <strong>Movement:</strong> {sensor.movement}
                        </li>
                      )}
                      {sensor.pressure && (
                        <li>
                          <strong>Pressure:</strong> {sensor.pressure} Pa
                        </li>
                      )}
                      {sensor.co2 && (
                        <li>
                          <strong>CO2:</strong> {sensor.co2} ppm
                        </li>
                      )}
                      {sensor.timestamp && (
                        <li>
                          <strong>Atualizado há: </strong> {formatDistanceToNow(new Date(sensor.timestamp), {locale: pt})}
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
