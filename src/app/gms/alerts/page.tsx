"use client";

import Head from 'next/head';
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from 'react';
import { Alarme, Luz } from '@/database/dataTypes';
import { fetchSmartLight } from '@/database/timeseries';
import { supabase, getData } from '@/database/supabaseClient';

const Alarmes = () => {
  const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

  const [alarmes, setAlarmes] = useState<Alarme[]>([]);
  const [sensors, setSensors] = useState<Luz[]>([]);

  class AlarmeValue {
    deveui: string;
    trigger: string;
    triggerAt: string; // higher / lower than trigger
    triggerType: string; // boardVoltage
    local: string;
    type: string; // Smartlight
    currentValue: string;

    constructor(deveui: string, trigger: string, triggerAt: string, triggerType: string, local: string, type: string, currentValue: string) {
      this.deveui = deveui;
      this.trigger = trigger;
      this.triggerAt = triggerAt;
      this.triggerType = triggerType;
      this.local = local;
      this.type = type;
      this.currentValue = currentValue;
    }
  }
  const [alarmesCurrentValues, setAlarmesCurrentValues] = useState<AlarmeValue[]>([]);

  const deleteAlarme = (deveui, triggerType, trigger) => {
    const updatedAlarmes = alarmesCurrentValues.filter(
      (alarme) =>
        alarme.deveui !== deveui ||
        alarme.triggerType !== triggerType ||
        alarme.trigger !== trigger
    );

    setAlarmes(updatedAlarmes);
  };


  useEffect(() => {
    const getSensors = async () => {
      const newSensors = await fetchSmartLight();
      var alarmsArray = [];
      const processItems = () => {
        for (let i = 0; i < newSensors.length; i++) {
          const newAlarmData = new Luz(
            newSensors[i].fields.boardVoltage,
            newSensors[i].fields.batteryVoltage,
            newSensors[i].fields.humidity,
            newSensors[i].fields.luminosity,
            newSensors[i].fields.temperature,
            newSensors[i].fields.movement,
            newSensors[i].tags.deviceId,
          );
          alarmsArray.push(newAlarmData);
        }
      }
      processItems();

      const uniqueAlarms = alarmsArray.filter(
        (alarm, index, self) =>
          index === self.findIndex(a => a.deviceId === alarm.deviceId)
      );
      setSensors(uniqueAlarms);
    }
    getSensors();
  }, [])

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
      // const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/email`);
      const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
      const dataEmail = await response.json();

      const queries = alarmes.map((alarme) => ({
        type: alarme.type,
        local: alarme.local,
        deveui: alarme.deveui,
        trigger: alarme.trigger,
        triggerAt: alarme.triggerAt,
        triggerType: alarme.triggerType,
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
  }, [alarmesCurrentValues]);

  useEffect(() => {
    const updateAlarmValues = () => {
      if (alarmes && sensors) {
        var newAlarmes = [];
        alarmes.map((alarme) => {
          sensors.map((sensor) => {
            if (sensor.deviceId === alarme.deveui) {
              var newAlarme = new AlarmeValue(
                alarme.deveui,
                alarme.trigger,
                alarme.triggerAt,
                alarme.triggerType,
                alarme.local,
                alarme.type,
                alarme.triggerType == "boardVoltage" ? sensor.boardVoltage.toString() :
                  alarme.triggerType == "batteryVoltage" ? sensor.batteryVoltage.toString() :
                    alarme.triggerType == "humidity" ? sensor.humidity.toString() :
                      alarme.triggerType == "luminosity" ? sensor.luminosity.toString() :
                        alarme.triggerType == "temperature" ? sensor.temperature.toString() : sensor.movement.toString()
              );
              newAlarmes.push(newAlarme);
            }
          })
        })
        setAlarmesCurrentValues(newAlarmes);
      }
    }

    updateAlarmValues();
  }, [alarmes, sensors])

  useEffect(() => {
    console.log(alarmesCurrentValues)
  }, [alarmesCurrentValues])

  return (
    <DashboardLayout>
      <div>
        <Head>
          <title>Alarmes | EcoVision GMS</title>
        </Head>
        <div className="sticky top-0 z-40 w-full p-8"></div>

        <div className="3xl:grid-cols-6 grid grid-cols-3 justify-items-center gap-y-10 xl:grid-cols-4 2xl:grid-cols-5">
          {alarmesCurrentValues.map((alarme, index) => {
            const isTriggered = alarme.triggerAt == "higher" ? alarme.currentValue > alarme.trigger : alarme.currentValue < alarme.trigger;

            return (
              <div
                key={index}
                className={`animate-fade-in relative h-64 w-56 overflow-hidden rounded-xl ${isTriggered ? "bg-red-500 text-red-100" : "bg-white dark:bg-neutral-900 dark:text-neutral-700"} shadow-md`}
                style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}
              >
                <button
                  onClick={() => { deleteAlarme(alarme.deveui, alarme.triggerType, alarme.trigger); }}
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
                      Tocar: {alarme.triggerAt ? "Abaixo de " : "Acima de "}{alarme.trigger}{
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
      </div>
    </DashboardLayout>
  );
};

export default Alarmes;
