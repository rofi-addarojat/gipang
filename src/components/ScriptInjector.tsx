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
          const { customHeadScripts, customBodyScripts, faviconImage } = snap.data();

          if (faviconImage && faviconImage.trim() !== "") {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = faviconImage;
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
