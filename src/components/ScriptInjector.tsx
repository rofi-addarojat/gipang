import React, { useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ScriptInjector() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;

    const injectNodes = async (nodes: Node[], target: HTMLElement) => {
      for (const node of nodes) {
        if (node.nodeName.toLowerCase() === "script") {
          await new Promise<void>((resolve) => {
            const scriptNode = document.createElement("script");
            const originalScript = node as HTMLScriptElement;
            
            Array.from(originalScript.attributes).forEach((attr) => {
              scriptNode.setAttribute(attr.name, attr.value);
            });
            scriptNode.textContent = originalScript.textContent;

            if (originalScript.src) {
              scriptNode.onload = () => resolve();
              scriptNode.onerror = () => resolve(); // continue even if it fails
              target.appendChild(scriptNode);
            } else {
              target.appendChild(scriptNode);
              resolve();
            }
          });
        } else {
          target.appendChild(node.cloneNode(true));
        }
      }
    };

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

          const parser = new DOMParser();

          if (customHeadScripts && customHeadScripts.trim() !== "") {
            const parsedDoc = parser.parseFromString(customHeadScripts, "text/html");
            await injectNodes(Array.from(parsedDoc.head.childNodes), document.head);
          }

          if (customBodyScripts && customBodyScripts.trim() !== "") {
            const parsedDoc = parser.parseFromString(customBodyScripts, "text/html");
            await injectNodes(Array.from(parsedDoc.body.childNodes), document.body);
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
