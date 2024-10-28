"use client";

import {noto_serif} from "@/app/ui/fonts";
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  const apiBaseUrl = `${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}`;

  const loginUrl = `${apiBaseUrl}/auth/login`;

  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    router.push(loginUrl)
    setLoading(false);
  };

  return (
      <>
        <Head>
          <title>SmartCampus Mauá</title>
        </Head>
          <div className='bg-neutral-100'>
              <Image className="w-[6%] ml-auto pt-3 pr-3 object-contain" src="/images/logo_maua.svg" alt="Instituto Mauá de Tecnologia" width={160} height={160} />
              <div className="flex h-screen items-center justify-center">
                  <div>
                      <div className="flex space-x-5 items-center">
                          <Image className="h-24 w-fit mx-auto" src="/images/logo_smartcampus.svg"
                                 alt="Instituto Mauá de Tecnologia" width={160} height={160}/>
                          <h1 className={`text-center text-maua_blue text-5xl font-medium tracking-wider ${noto_serif.className} antialiased`}>
                              SmartCampus IMT
                          </h1>
                      </div>
                      <div className="mt-20 h-40">
                          {!loading ? (
                              <>
                                  <div className="mt-28 flex justify-center">
                                      <button
                                          className="mx-auto flex items-center space-x-5 rounded-full bg-white px-7 py-4 transition duration-150 ease-in hover:bg-neutral-300"
                                          style={{boxShadow: '8px 8px 25px rgba(0,0,0,.2)'}}
                                          onClick={handleMicrosoftLogin}
                                      >
                                          <span className="text-center text-[0.825rem] uppercase tracking-wider">ENTRAR COM</span>
                                          <Image src="/images/Microsoft_365.svg" alt="Microsoft" width={100}
                                                 height={100}/>
                                      </button>
                                  </div>
                              </>
                          ) : (
                              <div className="flex h-full items-center justify-center">
                                  <svg
                                      className="animate-spin"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="50"
                                      height="50"
                                      viewBox="0 0 24 24"
                                  >
                                      <g fill="none" fillRule="evenodd">
                                          <path
                                              d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z"/>
                                          <path
                                              fill="currentColor"
                                              d="M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15M1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5 1.5 17.799 1.5 12"
                                              opacity=".1"
                                          />
                                          <path
                                              fill="currentColor"
                                              d="M12 4.5a7.458 7.458 0 0 0-5.187 2.083 1.5 1.5 0 0 1-2.075-2.166A10.458 10.458 0 0 1 12 1.5a1.5 1.5 0 0 1 0 3"
                                          />
                                      </g>
                                  </svg>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </>
  );
}
