"use client";

import Head from 'next/head';
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from 'react';
import { supabase } from '@/database/supabaseClient';

const Configurations = () => {
    const [DDD, setDDD] = useState("");
    const [fone, setFone] = useState("");
    const [numIncompleto, setAviso] = useState(false);

    const handleDDDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,2}$/.test(value)) {
            setDDD(value);
        }
    };

    const handleFoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,9}$/.test(value)) {
            setFone(value);
        }
    };

    const handleEnviarClick = () => {
        if (DDD.length === 2 && fone.length === 9) {
            setAviso(false);
            updateDatabasePhones();
        } else setAviso(true);
    };

    const updateDatabasePhones = async () => {

        const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/email`);
        const dataEmail = await response.json();

        const { error } = await supabase
            .from('User')
            .update({ phone: (DDD + fone) })
            .eq('email', dataEmail.displayName);

        if (error) {
            console.error('Error updating alarm on database', error);
        }
    };

    return (
        <DashboardLayout>
            <Head>
                <title>Configurações</title>
            </Head>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Número celular para notificações</h1>
                <div className="flex space-x-4 text-xl">
                    <div>
                        <input
                            type="text"
                            placeholder="DDD"
                            value={DDD}
                            onChange={handleDDDChange}
                            className="border-2 border-gray-400 rounded-lg p-2 w-20 text-center"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Fone"
                            value={fone}
                            onChange={handleFoneChange}
                            className="border-2 border-gray-400 rounded-lg p-2 w-32 text-center"
                        />
                    </div>
                    <div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={handleEnviarClick}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
                <div className="mt-4 text-lg">
                    {numIncompleto ? (
                        <p className="text-red-500">Por favor, preencha o DDD e o telefone corretamente.</p>
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Configurations;