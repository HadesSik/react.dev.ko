/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
import {useEffect, useRef} from 'react';
import {AppProps} from 'next/app';
import {useRouter} from 'next/router';
import Script from 'next/script';

import '@docsearch/css';
import '../styles/algolia.css';
import '../styles/index.css';
import '../styles/sandpack.css';
import '../styles/translate.css';
import {useSetTheme, useTheme} from '../jotai/theme';

if (typeof window !== 'undefined') {
  const terminationEvent = 'onpagehide' in window ? 'pagehide' : 'unload';
  window.addEventListener(terminationEvent, function () {
    // @ts-ignore
    gtag('event', 'timing', {
      event_label: 'JS Dependencies',
      event: 'unload',
    });
  });
}

export default function MyApp({Component, pageProps}: AppProps) {
  const router = useRouter();
  const theme = useTheme();
  const setTheme = useSetTheme();
  const initiated = useRef(false);

  useEffect(() => {
    // Taken from StackOverflow. Trying to detect both Safari desktop and mobile.
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      // This is kind of a lie.
      // We still rely on the manual Next.js scrollRestoration logic.
      // However, we *also* don't want Safari grey screen during the back swipe gesture.
      // Seems like it doesn't hurt to enable auto restore *and* Next.js logic at the same time.
      history.scrollRestoration = 'auto';
    } else {
      // For other browsers, let Next.js set scrollRestoration to 'manual'.
      // It seems to work better for Chrome and Firefox which don't animate the back swipe.
    }
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChangeTheme = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    darkQuery.addEventListener('change', handleChangeTheme);
    if (!initiated.current) {
      setTheme(theme || (darkQuery.matches ? 'dark' : 'light'));
      initiated.current = true;
    }

    return () => {
      darkQuery.removeEventListener('change', handleChangeTheme);
    };
  }, [theme, setTheme]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const cleanedUrl = url.split(/[\?\#]/)[0];
      // @ts-ignore
      gtag('event', 'pageview', {
        event_label: cleanedUrl,
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-Q6QK93W310"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', 'G-Q6QK93W310');
            `,
        }}
      />
    </>
  );
}
