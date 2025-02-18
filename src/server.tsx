import { ReactNode } from "react";
import { renderToString } from "react-dom/server";

import {
    mockLocation,
    cleanRenderingData,
    getRenderingHeaders,
    getRenderingData,
    setRenderingData,
    setRenderingValueToData,

    RenderingData,
    RenderingHeaders
} from "./renderingData";

export type RenderingResult = {
    headers: string,
    root: string,
    data: string,
    lang?: string,
}

export async function render(origin: string, url: string, app: ReactNode): Promise<RenderingResult> {
    const timeStart = new Date().getTime();

    let i = 0;
    let root = "";
    let renderingData: RenderingData = {};
    let renderingHeaders: Partial<RenderingHeaders> = {};

    do {
        i++;

        for (const [url, value] of Object.entries(renderingData)) {
            if (value !== null) continue;

            try {
                const response = await fetch(url.startsWith("/") ? origin + url : url);
                if (response.status !== 200) throw new Error(`Response status: ${response.status}`);
                const value = await response.json();
                setRenderingValueToData(renderingData, url, value);
            } catch (e) {
                if (e instanceof Error) {
                    setRenderingValueToData(renderingData, url, e);
                } else {
                    setRenderingValueToData(renderingData, url, new Error("Unknown error"));
                }
            }
        }

        // End await zone. The rendering can be run different render and rewrite rendering data.

        cleanRenderingData();
        mockLocation(origin + url);
        setRenderingData(renderingData);

        root = renderToString(app);
        renderingHeaders = getRenderingHeaders();

        renderingData = getRenderingData();

    } while (Object.values(renderingData).includes(null));
    // there is not more data to get

    const data = `<script type="text/javascript">window.RENDERING_DATA=${JSON.stringify(renderingData)};</script>`;

    const headers = renderToString(<>
        {renderingHeaders.title && <title>{renderingHeaders.title}</title>}
        {renderingHeaders.description && <meta name="description" content={renderingHeaders.description} />}

        {renderingHeaders.title && <meta property="og:title" content={renderingHeaders.title} />}
        {renderingHeaders.description && <meta property="og:description" content={renderingHeaders.description} />}
        {renderingHeaders.image && <meta property="og:image" content={renderingHeaders.image} />}
        {renderingHeaders.canonical && <meta property="og:url" content={renderingHeaders.canonical} />}

        {renderingHeaders.canonical && <link rel="canonical" href={renderingHeaders.canonical} />}
    </>);

    const timeEnd = new Date().getTime();
    const timeDiff = timeEnd - timeStart;

    console.log("SSR:", timeDiff, "ms", "Rendering (data loop):", i, "x", url, Object.keys(renderingData));

    if (!renderingHeaders.title) console.warn("Warning: No title in", url);

    return { headers, root, data, lang: renderingHeaders.lang };
}

export async function renderToHTML(origin: string, url: string, indexHtml: string, app: ReactNode): Promise<string> {
    const { headers, root, data, lang } = await render(origin, url, app);

    if (lang)
        indexHtml = getHtmlWithLang(indexHtml, lang);

    return indexHtml
        .replace("<head>", `<head>${headers}`)
        .replace("<div id=\"root\"></div>", `<div id="root">${root}</div>${data}`);
}

function getHtmlWithLang(html: string, lang: string) {

    const htmlLang = html.indexOf(` lang="`);
    if (htmlLang > -1) {
        const htmlLangEnd = html.indexOf(`"`, htmlLang + 7);
        return html.slice(0, htmlLang + 7) + lang + html.slice(htmlLangEnd);
    }

    const htmlTag = html.indexOf(`<html`);
    if (htmlTag > -1) {
        return html.slice(0, htmlTag + 5) + ` lang="${lang}"` + html.slice(htmlTag + 5);
    }

    const htmlDoctype = html.indexOf(`<!doctype html>`);
    if (htmlDoctype > -1) {
        return html.slice(0, htmlDoctype + 15) + `<html lang="${lang}">` + html.slice(htmlDoctype + 15) + `</html>`;
    }

    return `<!doctype html><html lang="${lang}">${html}</html>`;
}