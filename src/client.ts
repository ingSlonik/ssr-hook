import { useEffect, useMemo, useRef, useState } from "react";
import { getRenderingValue, RenderingHeaders, setRenderingHeader } from "./renderingData";


let origin = "";
export function setSSROrigin(url: string) {
    origin = url;
}

export function useHeaders(headers: Partial<RenderingHeaders>) {
    for (const [key, value] of Object.entries(headers)) {
        setRenderingHeader(key as keyof RenderingHeaders, value);

        if (key === "title" && window && window.document) {
            window.document.title = value;
        }
    }
}

type UseSSRHook<T> =
    | [response: null, error: null, isLoading: boolean, reload: () => void]
    | [response: T, error: null, isLoading: boolean, reload: () => void]
    | [response: null, error: Error, isLoading: boolean, reload: () => void];

export function useSSRHook<T>(url: string): UseSSRHook<T> {
    const refMounted = useRef(false);
    useEffect(() => {
        refMounted.current = true;
        return () => {
            refMounted.current = false;
        };
    }, []);

    const [response, setResponse] = useState<null | Error | T>(() => getRenderingValue<T>(url));

    const [reloadVariable, setReloadVariable] = useState(0);
    const reload = useMemo(() => () => setReloadVariable(v => v + 1), []);

    // null for first render to keep SSR 
    const refLast = useRef<object | null>(null);
    useEffect(() => {
        if (refLast.current === null) {
            refLast.current = {};
            if (response !== null) return;
        }

        // set origin for browser by default
        if (origin === "") origin = window.location.origin;

        (async () => {
            try {
                const last = refLast.current = {};
                const res = await fetch(url.startsWith("/") ? origin + url : url);
                if (res.status !== 200) throw new Error(`Response status: ${res.status}`);

                const value = await res.json() as T;

                // if last !== refLast.current there is running last called fetch
                if (last === refLast.current && refMounted.current) setResponse(value);

            } catch (e) {
                if (e instanceof Error) {
                    if (refMounted.current) setResponse(e);
                } else {
                    if (refMounted.current) setResponse(new Error("Unknown error"));
                }
            }
        })();
    }, [url, reloadVariable]);

    if (response === null) {
        return [null, null, true, reload];
    } else if (response instanceof Error) {
        return [null, response, false, reload];
    } else {
        return [response, null, false, reload];
    }
}
