"use client";

import Head from 'next/head';
import DashboardLayout from "@/app/gms/components/DashboardLayout";
import { useState, useEffect } from 'react';
import { supabase } from '@/database/supabaseClient';

const Configurations = () => {
    const SMARTCAMPUSMAUA_SERVER = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

    const [DDD, setDDD] = useState("");
    const [fone, setFone] = useState("");
    const [numIncompleto, setAviso] = useState(false);
    const [currentPhone, setCurrentPhone] = useState<string | null>("");

    useEffect(() => {
        fetchCurrentPhone();
    }, []);

    const fetchCurrentPhone = async () => {
        try {
            const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
            const dataEmail = await response.json();

            const { data, error } = await supabase
                .from('User')
                .select('phone')
                .eq('email', dataEmail.displayName)
                .single();

            if (error) {
                console.error('Error fetching current phone from database', error);
            } else {
                setCurrentPhone(data.phone || "");
            }
        } catch (error) {
            console.error('Error fetching current phone:', error);
        }
    };

    const deletePhone = async () => {
      try {
        const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
        const dataEmail = await response.json();
    
        const { data, error } = await supabase
          .from('User')
          .update({ phone: "" })
          .eq('email', dataEmail.displayName)
          .select(); 
    
        if (error) {
          console.error('Erro ao excluir número de telefone:', error.message);
        } else {
          console.log('Número excluído com sucesso:', data);
          setCurrentPhone(""); 
        }
      } catch (error) {
        console.error('Erro ao excluir número de telefone:', error);
      }
    };

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
        try {
            const response = await fetch(`${SMARTCAMPUSMAUA_SERVER}/api/auth/email`);
            const dataEmail = await response.json();

            const { error } = await supabase
                .from('User')
                .update({ phone: (DDD + fone) })
                .eq('email', dataEmail.displayName);

            if (error) {
                console.error('Error updating phone in database', error);
            } else {
                setCurrentPhone(DDD + fone);
            }
        } catch (error) {
            console.error('Error updating phone:', error);
        }
    };

    return (
      <DashboardLayout>
          <Head>
              <title>Configurações</title>
          </Head>
          <div className="p-6 max-w-3xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Número celular para notificações</h1>
  
              <div className="bg-white p-6 rounded-md border border-gray-300 mb-6">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Número cadastrado</h2>
                  <div className="text-gray-600 mb-4">
                      <strong className="text-gray-800">Número atual:</strong> {currentPhone || "Não cadastrado"}
                  </div>
  
                  {currentPhone && (
                      <div>
                          <button
                              className="font-bold bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              onClick={deletePhone}
                          >
                              Excluir número
                          </button>
                      </div>
                  )}
              </div>
  
              <div className="bg-white p-6 rounded-md border border-gray-300">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Atualizar número de telefone</h2>
  
                  <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                          <input
                              type="text"
                              placeholder="DDD"
                              value={DDD}
                              onChange={handleDDDChange}
                              className="border border-gray-300 rounded-md p-3 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                      <div className="flex-1">
                          <input
                              type="text"
                              placeholder="Telefone"
                              value={fone}
                              onChange={handleFoneChange}
                              className="border border-gray-300 rounded-md p-3 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                      <div className="flex-none">
                          <button
                              className="font-bold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={handleEnviarClick}
                          >
                              Enviar
                          </button>
                      </div>
                  </div>
  
                  {numIncompleto && (
                      <div className="text-red-500 mt-2">
                          <p>Por favor, preencha o DDD e o telefone corretamente.</p>
                      </div>
                  )}
              </div>
          </div>
      </DashboardLayout>
  );
  
};

export default Configurations;
