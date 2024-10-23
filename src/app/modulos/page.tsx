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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className='text-xl'>Seja bem-vindo, <span className='font-medium'>Enrico Ricardo Saez</span>.</h1>
                    <p className=' text-neutral-600'>Selecione o módulo que deseja acessar.</p>
                </div>
                <button>Sair</button>
            </div>
            <div className='grid mt-10 place-items-center text-center'>
                <a href="/gms">
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
