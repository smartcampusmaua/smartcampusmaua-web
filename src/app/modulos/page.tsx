"use client";

import {outfit} from "@/app/ui/fonts";
import Head from 'next/head';
import Image from 'next/image';

export default function Page() {

  return (
      <>
        <Head>
          <title>EcoVision</title>
        </Head>
        <div className="flex h-screen items-center justify-center bg-neutral-100">
          <div className='rounded-xl bg-white p-8 w-1/2 animate-fade-in' style={{ boxShadow: '8px 8px 25px rgba(0,0,0,.2)' }}>
            <h1 className='text-lg'>Seja bem-vindo, <span className='font-medium'>Enrico Ricardo Saez</span>.</h1>
            <p className=' text-neutral-600'>Selecione o módulo que deseja acessar.</p>
            <div className='grid place-items-center'>
                <div className='w-96 h-40 rounded-xl'>
                    <img src='' />
                    <span>EcoVision | GMS</span>
                </div>
            </div>
          </div>
        </div>
      </>
  );
}
