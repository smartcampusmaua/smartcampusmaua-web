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

const Sensores = () => {
    const [sensores, setSensors] = useState<GenericSensor[]>([]);
    const [filteredSensores, setFilteredSensores] = useState<GenericSensor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string>("local");

    useEffect(() => {
        const fetchSensors = async () => {
            try{
                const {data: sensors, error} = await supabase.from('Sensors').select("Nome, DEVEUI, Bloco, Sala");
                if (error){
                    console.error('Error fetching sensors data: ', error);
                    return;
                }
                const deveuiToLocalMap: Record<string, string> = {};
                sensors?.forEach((sensor) => {
                    deveuiToLocalMap[sensor.DEVEUI] = `${sensor.Bloco} - ${sensor.Sala}`;
                });

                const allSensorsData = await fetchAllSensors();
                const uniqueDeviceIds = new Set();
                const newSensors = allSensorsData.filter((entry: any)=>{
                    const {deviceId} = entry.tags;
                    if (uniqueDeviceIds.has(deviceId)) {
                        return false;
                    }
                    uniqueDeviceIds.add(deviceId);
                    return true;
                })
                .map((entry: any)=> {
                    const { fields, tags, name } = entry; 
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
                    );
                });
                const sortedSensors: GenericSensor[] = newSensors.sort((a: {local}, b: {local}) => // RC-EDIT
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

    return (
        <DashboardLayout>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">ID: {sensor.deveui}</p>

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
                            </ul>
                        </div>
                        ))}
                    </div>
                </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Sensores;
