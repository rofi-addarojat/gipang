import React, { useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ScriptInjector() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;

    const fetchAndInject = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "landingPage"));
        if (snap.exists() && snap.data()) {
          const { customHeadScripts, customBodyScripts, faviconImage, googleAnalyticsId, googleSearchConsole } = snap.data();

          if (faviconImage && faviconImage.trim() !== "") {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = faviconImage;
          }

          if (googleSearchConsole && googleSearchConsole.trim() !== "") {
            let meta = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = 'google-site-verification';
              document.head.appendChild(meta);
            }
            meta.content = googleSearchConsole;
          }

          if (googleAnalyticsId && googleAnalyticsId.trim() !== "") {
            const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${googleAnalyticsId}"]`);
            if (!existingScript) {
              // Add GA script
              const gaScript = document.createElement("script");
              gaScript.async = true;
              gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
              document.head.appendChild(gaScript);

              // Add GA config
              const configScript = document.createElement("script");
              configScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `;
              document.head.appendChild(configScript);
            }
          }

          if (customHeadScripts && customHeadScripts.trim() !== "") {
            const headContainer = document.createElement("div");
            headContainer.innerHTML = customHeadScripts;

            // Recreate script tags to ensure they execute
            Array.from(headContainer.childNodes).forEach((node) => {
              if (node.nodeName.toLowerCase() === "script") {
                const scriptNode = document.createElement("script");
                Array.from((node as HTMLScriptElement).attributes).forEach(
                  (attr) => {
                    scriptNode.setAttribute(attr.name, attr.value);
                  },
                );
                scriptNode.textContent = node.textContent;
                document.head.appendChild(scriptNode);
              } else {
                document.head.appendChild(node.cloneNode(true));
              }
            });
          }

          if (customBodyScripts && customBodyScripts.trim() !== "") {
            const bodyContainer = document.createElement("div");
            bodyContainer.innerHTML = customBodyScripts;

            Array.from(bodyContainer.childNodes).forEach((node) => {
              if (node.nodeName.toLowerCase() === "script") {
                const scriptNode = document.createElement("script");
                Array.from((node as HTMLScriptElement).attributes).forEach(
                  (attr) => {
                    scriptNode.setAttribute(attr.name, attr.value);
                  },
                );
                scriptNode.textContent = node.textContent;
                document.body.appendChild(scriptNode);
              } else {
                document.body.appendChild(node.cloneNode(true));
              }
            });
          }
        }
      } catch (err) {
        console.error("Failed to inject custom scripts", err);
      }
    };
    fetchAndInject();
    injected.current = true;
  }, []);

  return null;
}
