import { Toaster } from "react-hot-toast";
import { type AppType } from "next/app";
import Head from "next/head";

import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";

import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Tweetoji</title>
        <meta name="description" content="Twitter clone with emojis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
