import { AppProps } from 'next/app';
import Head from 'next/head';
import '../globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}