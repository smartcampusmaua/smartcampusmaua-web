"use client";

import Head from 'next/head';
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from 'react';
import { fetchSmartLight } from '@/database/timeseries';
import { Luz, Alarme, Local } from '@/database/dataTypes';
import Papa from 'papaparse';
import { supabase, getData } from '@/database/supabaseClient';

const Alarmes = () => {
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

    const [luzes, setLuzes] = useState<Luz[]>([]);
    const [alarmes, setAlarmes] = useState<Alarme[]>([]);
    // const [locals, setLocal] = useState<Local[]>([]);
    const locals: Local[] =[]
    const [newAlarme, setNewAlarme] = useState({
        id: 0,
        trigger: '',
        triggerAtLowerThan: true,
        triggerType: '',
        currentValue: '',
        local: '',
        type: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Luzes data and populate it
    useEffect(() => {
        // Adjusting Papa.parse to include the new CSV structure
        Papa.parse('/SmartLights_Organization_01_05(Checagem atual 14.csv', {
            download: true,
            header: true,
            complete: (result) => {
                const csvData = result.data;
                const deviceIdToLocalMap: { [key: string]: string } = {};

                // Populate map with concatenated Thingsboard and Local values
                csvData.forEach((row: any) => {
                    const { Nome, DEVEUI, Bloco, Sala } = row;
                    const combinedLocal = `${Bloco} - ${Sala}`;
                    deviceIdToLocalMap[DEVEUI] = combinedLocal;
                });

                // Fetch smart light data and match with CSV records
                fetchSmartLight().then((data) => {
                    const uniqueDeviceIds = new Set();
                    const newLuzes = data
                        .filter((entry: any) => {
                            const { deviceId } = entry.tags;
                            if (uniqueDeviceIds.has(deviceId)) {
                                return false;
                            }
                            uniqueDeviceIds.add(deviceId);
                            return true;
                        })
                        .map((entry: any) => {
                            const { fields, tags } = entry;
                            const { boardVoltage, batteryVoltage, humidity, luminosity, temperature, movement } = fields;
                            const { deviceId } = tags;

                            const local = deviceIdToLocalMap[deviceId] || "ID não encontrado";

                            if (!locals.some((item) => item.local === local)) {
                                locals.push(new Local(local, { smartLight: true }))
                            }

                            return new Luz(
                                boardVoltage,
                                batteryVoltage / 1000,
                                humidity,
                                luminosity,
                                temperature,
                                movement,
                                deviceId,
                                local
                            );
                        });

                    const sortedLuzes = newLuzes.sort((a: { local: string; }, b: { local: any; }) => a.local.localeCompare(b.local));
                    setLuzes(sortedLuzes);
                });
            }
        });
    }, []);

    const getCurrentValue = (local: string, triggerType: string) => {
        const luz = luzes.find(luz => luz.local === local);
        if (luz) {
            switch (triggerType) {
                case "boardVoltage":
                    return luz.boardVoltage;
                case "batteryVoltage":
                    return luz.batteryVoltage;
                case "humidity":
                    return luz.humidity;
                case "luminosity":
                    return luz.luminosity;
                case "temperature":
                    return luz.temperature;
                case "movement":
                    return luz.movement;
                default:
                    return null;
            }
        }
        return null;
    };

    const handleAddAlarme = () => {
        const { trigger, triggerAtLowerThan, triggerType, local, type } = newAlarme;
        if (triggerType && local) {
            const currentValue = getCurrentValue(local, triggerType);
            if (currentValue !== null) {
                const maxId = alarmes.reduce((max, alarme) => Math.max(max, alarme.id), 0);
                setAlarmes([...alarmes, new Alarme(maxId + 1, Number(trigger), triggerAtLowerThan, triggerType, Number(currentValue), local, type)]);
                setNewAlarme({ id: 0, trigger: '', triggerAtLowerThan: true, triggerType: '', local: '', type: '', currentValue: String(currentValue) });
                setIsModalOpen(false);
            }
        }
    };

    const deleteAlarme = (id: number) => {
        const updatedAlarmes = alarmes.filter((alarme) => alarme.id !== id);
        setAlarmes(updatedAlarmes);
    };

    useEffect(() => {
        const getAlarmes = async () => {
            const userData = await getData("User", "alarms");

            const setAlarmesData = (userData as unknown as { alarms: any[] }).alarms;
            setAlarmes(setAlarmesData);
        };

        getAlarmes();
    }, []);

    useEffect(() => {
        const updateDatabaseAlarmes = async () => {
            if (alarmes.length === 0) return;  // Skip if no alarms

            // const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/email`);
            const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
            const dataEmail = await response.json();

            const queries = alarmes.map((alarme) => ({
                id: alarme.id,
                type: alarme.type,
                trigger: alarme.trigger,
                triggerType: alarme.triggerType,
                triggerAtLowerThan: alarme.triggerAtLowerThan,
                local: alarme.local
            }));

            const { error } = await supabase
                .from('User')
                .update({ alarms: queries })
                .eq('email', dataEmail.displayName);

            if (error) {
                console.error('Error updating alarm on database', error);
            }
        };

        updateDatabaseAlarmes();
    }, [alarmes]);

    return (
        <DashboardLayout>
            <div>
                <Head>
                    <title>Alarmes | EcoVision GMS</title>
                </Head>
                <div className="sticky top-0 z-40 w-full p-8"></div>

                <div className="3xl:grid-cols-6 grid grid-cols-3 justify-items-center gap-y-10 xl:grid-cols-4 2xl:grid-cols-5">
                    {alarmes.map((alarme, index) => {
                        const isTriggered = alarme.triggerAtLowerThan
                            ? alarme.currentValue < alarme.trigger
                            : alarme.currentValue > alarme.trigger;

                        return (
                            <div
                                key={index}
                                className={`animate-fade-in relative h-64 w-56 overflow-hidden rounded-xl ${isTriggered ? "bg-red-500 text-red-100" : "bg-white dark:bg-neutral-900 dark:text-neutral-700"} shadow-md`}
                                style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}
                            >
                                <button
                                    onClick={() => { deleteAlarme(alarme.id); }}
                                    className={`${isTriggered ? "text-white" : "text-black"} text-4xl ml-2`}
                                >
                                    &times;
                                </button>
                                <div className="relative">
                                    <svg
                                        className="relative z-10 mx-auto mt-2 fill-current shadow-yellow-300 drop-shadow-2xl"
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
                                            Tocar: {alarme.triggerAtLowerThan ? "Abaixo de " : "Acima de "}{alarme.trigger}{
                                                alarme.triggerType === "boardVoltage" ? "V" :
                                                    alarme.triggerType === "batteryVoltage" ? "V" :
                                                        alarme.triggerType === "humidity" ? "%" :
                                                            alarme.triggerType === "luminosity" ? " lux" :
                                                                alarme.triggerType === "temperature" ? "°C" : ""
                                            }
                                        </p>
                                        <p className={`mr-2 font-medium ${isTriggered ? "text-red-100" : "text-black"}`}>
                                            Valor atual: {alarme.currentValue}{
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
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="fixed bottom-4 right-4 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500"
                    >
                        <span className="text-6xl font-bold">+</span>
                    </button>

                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
                                <h2 className="mb-4 text-xl font-bold">Adicionar Alarme</h2>
                                <label className="mb-2 block">
                                    <span className="text-sm font-medium">Local:</span>
                                    <select
                                        value={newAlarme.local}
                                        onChange={(e) => setNewAlarme({ ...newAlarme, local: e.target.value })}
                                        className="ml-2 rounded p-2 text-sm"
                                    >
                                        <option value=""></option>
                                        {
                                            locals
                                                .filter(local => local.local !== "ID não encontrado")
                                                .sort((a, b) => a.local.localeCompare(b.local))  // Sort alphabetically
                                                .map((local, index) => (
                                                    <option key={index} value={local.local}>
                                                        {local.local}
                                                    </option>
                                                ))
                                        }
                                    </select>
                                </label>

                                <label className="mb-2 block">
                                    <span className="text-sm font-medium">Tipo:</span>
                                    <select
                                        className="ml-2 rounded p-2 text-sm"
                                        onChange={(e) => setNewAlarme({ ...newAlarme, type: e.target.value })}
                                    >
                                        <option value=""></option>
                                        {["SmartLight", "WaterTankLevel", "GaugePressure", "Hydrometer", "EnergyMeter", "WeatherStation"].map((type, index) => {
                                            const isTypeAvailable = locals.some(local => {
                                                if (type === "SmartLight") {
                                                    return local.smartLight === true;
                                                } else if (type === "WaterTankLevel") {
                                                    return local.hydrometer === true;
                                                } else if (type === "GaugePressure") {
                                                    return local.hydrometer === true;
                                                } else if (type === "Hydrometer") {
                                                    return local.hydrometer === true;
                                                } else if (type === "EnergyMeter") {
                                                    return local.hydrometer === true;
                                                } else if (type === "WeatherStation") {
                                                    return local.hydrometer === true;
                                                }
                                            });

                                            return (
                                                isTypeAvailable && (
                                                    <option key={index} value={type}>
                                                        {type}
                                                    </option>
                                                )
                                            );
                                        })}
                                    </select>
                                </label>

                                <label className="mb-2 block">
                                    <span className="text-sm font-medium">Dado:</span>
                                    <select
                                        className="ml-2 rounded p-2 text-sm"
                                        onChange={(e) => setNewAlarme({ ...newAlarme, triggerType: e.target.value })}
                                    >
                                        <option value=""></option>
                                        {newAlarme.type === "SmartLight" ? [
                                            "boardVoltage",
                                            "batteryVoltage",
                                            "humidity",
                                            "luminosity",
                                            "temperature",
                                            "movement"
                                        ].map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))
                                            : [

                                            ]
                                        }
                                    </select>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Quando tocar"
                                    value={newAlarme.trigger}
                                    onChange={(e) => setNewAlarme({ ...newAlarme, trigger: e.target.value })}
                                    className="mb-2 w-full rounded p-2"
                                />
                                <label className="mb-2 block">
                                    <span className="text-sm font-medium">Tocar:</span>
                                    <select
                                        value={newAlarme.triggerAtLowerThan ? "lower" : "higher"}
                                        onChange={(e) => setNewAlarme({ ...newAlarme, triggerAtLowerThan: e.target.value === "lower" })}
                                        className="ml-2 rounded p-2 text-sm"
                                    >
                                        <option value="lower">Abaixo do valor</option>
                                        <option value="higher">Acima do valor</option>
                                    </select>
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => { handleAddAlarme(); }}
                                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Alarmes;
