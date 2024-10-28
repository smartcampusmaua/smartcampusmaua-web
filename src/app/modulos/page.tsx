"use client";

import {outfit} from "@/app/ui/fonts";
import Head from 'next/head';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [displayName, setDisplayName] = useState("Carregando..."); // Estado para o nome de exibição

  const router = useRouter();

  const handleMicrosoftLogout = async () => {
    router.push(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/auth/logout`)
  };

  useEffect(() => {
    const fetchDisplayName = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/auth/displayname`);
        if (!response.ok) {
          throw new Error('Erro ao obter o nome de exibição');
        }
        const data = await response.json();
        setDisplayName(data.displayName || "Nome não disponível"); // Atualiza o estado com o nome de exibição
      } catch (error) {
        console.error(error);
        setDisplayName("Erro ao carregar nome"); // Define um estado de erro se a chamada falhar
      }
    };

    fetchDisplayName(); // Chama a função para buscar o nome de exibição
  }, [`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/auth/displayname`]); 
    
  return (
      <>
        <Head>
          <title>EcoVision</title>
        </Head>
        <div className="flex h-screen items-center justify-center bg-neutral-100">
          <div className='rounded-xl bg-white p-8 w-1/2 animate-fade-in' style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className='text-xl'>Seja bem-vindo, <span className='font-medium'>{displayName}</span>.</h1>
                    <p className=' text-neutral-600'>Selecione o módulo que deseja acessar.</p>
                </div>
                <button onClick={handleMicrosoftLogout}>Sair</button>
            </div>
            <div className='grid mt-10 place-items-center text-center'>
                <a href={`${process.env.NEXT_PUBLIC_GMS_WEB_URL}:${process.env.NEXT_PUBLIC_GMS_WEB_PORT}/gms`}>
                <div className='w-72 p-6 hover:opacity-75 transition rounded-xl flex flex-col space-y-3 justify-center bg-gms-secondary' style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}>
                    <img className="object-contain h-20" src='images/logo_gms_filled.svg' alt="EcoVision" />
                    <span className={`text-2xl text-gms-tertiary ${outfit.className} antialiased`}><span className="text-white">Eco</span>Vision</span>
                </div>
                </a>
            </div>
          </div>
        </div>
      </>
  );
}
