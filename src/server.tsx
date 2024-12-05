import { ReactNode } from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";

import {
    mockLocation,
    cleanRenderingData,
    getRenderingHeaders,
    getRenderingData,
    setRenderingData,
    setRenderingValueToData
} from "./renderingData";

export async function render(origin: string, url: string, app: ReactNode): Promise<{ headers: string, root: string, renderingData: string }> {
    const timeStart = new Date().getTime();

    cleanRenderingData();
    mockLocation(origin + url);
    renderToStaticMarkup(app);

    const timeFirstRender = new Date().getTime();

    const data = getRenderingData();

    for (const url of Object.keys(data)) {
        try {
            const response = await fetch(url.startsWith("/") ? origin + url : url);
            if (response.status !== 200) throw new Error(`Response status: ${response.status}`);
            const value = await response.json();
            setRenderingValueToData(data, url, value);
        } catch (e) {
            if (e instanceof Error) {
                setRenderingValueToData(data, url, e);
            } else {
                setRenderingValueToData(data, url, new Error("Unknown error"));
            }
        }
    }

    const timeFetchData = new Date().getTime();

    // End await zone. The rendering can be run different render and rewrite rendering data.

    cleanRenderingData();
    mockLocation(origin + url);
    setRenderingData(data);

    const root = renderToString(app);
    const head = getRenderingHeaders();
    const renderingData = `<script type="text/javascript">window.RENDERING_DATA=${JSON.stringify(data)};</script>`;

    const headers = renderToString(<>
        {head.title && <title>{head.title}</title>}
        {head.description && <meta name="description" content={head.description} />}

        {head.title && <meta property="og:title" content={head.title} />}
        {head.description && <meta property="og:description" content={head.description} />}
        {head.image && <meta property="og:image" content={head.image} />}
        {head.canonical && <meta property="og:url" content={head.canonical} />}

        {head.canonical && <link rel="canonical" href={head.canonical} />}
    </>);

    const timeEnd = new Date().getTime();

    const timeDiffFirstRender = timeFirstRender - timeStart;
    const timeDiffFetchData = timeFetchData - timeFirstRender;
    const timeDiffFinalRender = timeEnd - timeFetchData;
    const timeDiff = timeEnd - timeStart;
    console.log(
        "SSR:", timeDiff, "ms", url,
        "(first render:", timeDiffFirstRender, "ms, fetch data:", timeDiffFetchData,
        "ms, final render:", timeDiffFinalRender, "ms)",
        Object.keys(data),
    );
    if (!head.title) console.warn("Warning: No title in", url);

    return { headers, root, renderingData };
}

export async function renderToHTML(origin: string, url: string, indexHtml: string, app: ReactNode): Promise<string> {
    const { headers, root, renderingData } = await render(origin, url, app);

    return indexHtml
        .replace("<head>", `<head>${headers}`)
        .replace("<div id=\"root\"></div>", `<div id="root">${root}</div>${renderingData}`);
}
