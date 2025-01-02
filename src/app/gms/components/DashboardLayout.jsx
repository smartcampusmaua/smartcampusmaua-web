"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'

const Layout = ({ children }) => {
    const pathname = usePathname();
    const [darkMode, setDarkMode] = useState(false); // Example state for dark mode
    const [displayName, setDisplayName] = useState("Carregando..."); // Estado para o nome de exibição
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // Implement your dark mode logic here
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const router = useRouter();

    const handleMicrosoftLogout = async () => {
        router.push(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/logout`)
    };

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/displayname`);
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
    }, [`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/displayname`]); // O efeito depende da URL da API

    return (
        <>
            <Head>
                {/* Define meta tags, title, etc. */}
                <title>EcoVision</title>
                <meta name="description" content="Your description here" />
                {/* Add more meta tags as needed */}
            </Head>
            <nav
                className={`fixed top-0 z-50 w-full border-b border-neutral-300 bg-white`}>
                <div className="mx-auto flex h-14 items-center justify-between px-6">
                    <div className="flex space-x-8 items-center">
                        <div className="flex items-center space-x-2">
                            <button className="p-2 text-neutral-900 dark:text-neutral-100" onClick={toggleSidebar}>
                                <svg className="w-12 h-12 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" />
                                </svg>
                            </button>
                            <div>
                                <img className="h-8 dark:hidden" src="/images/logo.svg" alt="EcoVision" />
                                <img className="hidden h-8 dark:block" src="/images/logo_negative.svg" alt="EcoVision" />
                            </div>
                            <p className="font-outfit font-medium text-primary lg:text-2xl text-xl">
                                Eco<span className="text-tertiary dark:text-white">Vision</span>
                                {true && (
                                    <span
                                        className="ml-1.5 font-outfit font-normal text-tertiary">
                                        | admin
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <p className={`w-0 text-transparent font-medium lg:text-neutral-900 lg:w-56 dark:text-neutral-100`}>{displayName}</p>
                        <button
                            className="rounded-full bg-neutral-200 p-1.5 transition duration-150 ease-in hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                            onClick={handleMicrosoftLogout}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M5 5h6c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6c.55 0 1-.45 1-1s-.45-1-1-1H5z"
                                />
                                <path
                                    fill="currentColor"
                                    d="m20.65 11.65l-2.79-2.79a.501.501 0 0 0-.86.35V11h-7c-.55 0-1 .45-1 1s.45 1 1 1h7v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.19.2-.51.01-.7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
            <div
                className="mx-auto flex h-screen divide-x divide-neutral-300">
                <nav className={`fixed top-14 w-60 overflow-y-auto px-5 py-8 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ height: 'calc(100vh - 56px)' }}>
                    <div className="flex h-full flex-col justify-between space-y-16">
                        <div className="space-y-4">
                            <p className="pl-3 font-medium dark:text-white">Sensores</p>
                            <div className="flex flex-col space-y-4">
                                <a
                                    href="/gms/sensores"
                                    className={`flex items-center space-x-2 text-nowrap rounded-full px-3 py-2.5 text-[0.825rem] tracking-wide transition  ${pathname === "/sensores" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2m-3-3h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1m3-17C7.86 2 4.5 5.36 4.5 9.5c0 3.82 2.66 5.86 3.77 6.5h7.46c1.11-.64 3.77-2.68 3.77-6.5C19.5 5.36 16.14 2 12 2"
                                        />
                                    </svg>
                                    <span>SENSORES</span> 
                                </a>
                            </div>
                            <p className="pl-3 font-medium dark:text-white">Alarme</p>
                            <div className="mt-4 flex flex-col space-y-3">
                                <a
                                    className={`flex items-center space-x-2 text-nowrap rounded-full px-3 py-2.5 text-[0.825rem] tracking-wide transition ${pathname.match(/alarmes/g) ? 'water-button-pressed' : 'water-button-unpressed'}`}
                                    href="/gms/alarmes"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 18"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M13.654,0.659 C12.342,-0.292 10.604,-0.105 9.664,1.042 C10.615,1.358 11.535,1.827 12.393,2.449 C13.25,3.073 13.983,3.807 14.586,4.622 C15.35,3.347 14.965,1.614 13.654,0.659 L13.654,0.659 Z M2.644,2.427 C3.502,1.811 4.422,1.347 5.374,1.032 C4.433,-0.104 2.694,-0.288 1.383,0.654 C0.072,1.6 -0.314,3.316 0.451,4.579 C1.055,3.773 1.788,3.045 2.644,2.427 L2.644,2.427 Z M13.924,8.633 C13.924,8.435 13.912,8.24 13.896,8.047 C13.624,4.907 11.198,2.401 8.131,2.081 L8.131,2.081 C7.995,2.065 7.858,2.064 7.719,2.059 C7.637,2.055 7.555,2.045 7.471,2.045 L7.469,2.045 L7.467,2.045 C3.899,2.045 1.008,4.994 1.008,8.633 C1.008,8.662 1.012,8.692 1.013,8.721 C1.035,10.574 1.815,12.235 3.041,13.415 C2.633,13.627 2.348,14.056 2.348,14.558 C2.348,15.267 2.912,15.842 3.608,15.842 C4.274,15.842 4.812,15.315 4.858,14.648 C5.547,14.959 6.298,15.155 7.089,15.202 C7.215,15.21 7.34,15.222 7.467,15.222 C7.612,15.222 7.752,15.209 7.897,15.2 C8.698,15.146 9.458,14.939 10.153,14.614 C10.182,15.298 10.729,15.843 11.406,15.843 C12.102,15.843 12.665,15.268 12.665,14.559 C12.665,14.036 12.36,13.589 11.922,13.388 C13.152,12.19 13.924,10.506 13.924,8.633 L13.924,8.633 Z M7.527,13.314 C4.964,13.314 2.88,11.198 2.88,8.598 C2.88,5.998 4.964,3.884 7.527,3.884 C10.089,3.884 12.174,5.998 12.174,8.598 C12.174,11.198 10.089,13.314 7.527,13.314 L7.527,13.314 Z"
                                        />
                                        <rect x="7" y="5" width="1" height="4" className="si-glyph-fill"></rect>
                                        <rect x="7" y="8" width="3" height="1" className="si-glyph-fill"></rect>
                                    </svg
                                    >
                                    <span>ALARMES</span></a
                                >
                            </div>
                        </div>
                        <div>
                            <a
                                className={`flex items-center space-x-2 text-nowrap rounded-full px-3 py-2.5 text-[0.825rem] tracking-wide transition ${pathname.match(/configuracoes/g) ? 'water-button-pressed' : 'water-button-unpressed'}`}
                                href="/gms/configuracoes"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23a.987.987 0 0 0-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41a7.343 7.343 0 0 0 0 1.35l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68m-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5"
                                    />
                                </svg>
                                <span>CONFIGURAÇÕES</span></a>
                        </div>
                    </div>
                </nav>
                <div className={`w-full h-full size-full pb-8 pt-14 ${isSidebarVisible ? 'ml-60 hidden lg:block' : 'ml-0'}`}>
                    {children}
                </div>
            </div>
            <dialog className="rounded-xl backdrop:backdrop-blur-[2px] dark:bg-neutral-900">
                <div className="p-8">
                    <p className="dark:text-white">Tem certeza que deseja sair?</p>
                    <div className="mt-4 flex justify-center">
                        <button
                            className="rounded-full bg-neutral-200 px-3 py-1.5 text-[0.825rem] tracking-wider transition duration-150 ease-in hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                        >SAIR
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default Layout;
