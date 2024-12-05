export type RenderingData = {
    [url: string]: null | { type: "error"; message: string } | {
        type: "data";
        value: unknown;
    };
};
export type RenderingHeaders = {
    title: string;
    description: string;
    image: string;
    canonical: string;
};

type WindowFake = {
    RENDERING_DATA: RenderingData;
    RENDERING_HEADERS: Partial<RenderingHeaders>;
    location?: URL;
    document?: { title: string };
};

function getWindow(): WindowFake {
    // @ts-expect-error Fake window for server
    if (!global.window) global.window = {};
    // @ts-expect-error Set rendering data for router and hooks to fetch data
    if (!global.window.RENDERING_DATA) global.window.RENDERING_DATA = {};
    // @ts-expect-error Set rendering headers SSR SEO
    if (!global.window.RENDERING_HEADERS) global.window.RENDERING_HEADERS = {};

    // @ts-expect-error Return fake window for SSR or window for browser
    return global.window as WindowFake;
}

export function cleanRenderingData() {
    const window = getWindow();
    window.RENDERING_DATA = {};
    window.RENDERING_HEADERS = {};
}

export function mockLocation(href: string) {
    getWindow().location = new URL(href);
}

export function getRenderingData(): RenderingData {
    return { ...getWindow().RENDERING_DATA };
}
export function setRenderingData(data: RenderingData) {
    getWindow().RENDERING_DATA = { ...data };
}
export function setRenderingValue<T>(url: string, data: null | Error | T) {
    setRenderingValueToData(getWindow().RENDERING_DATA, url, data);
}
export function setRenderingValueToData<T>(renderingData: RenderingData, url: string, data: null | Error | T) {
    if (data === null) {
        renderingData[url] = null;
    } else if (data instanceof Error) {
        renderingData[url] = { type: "error", message: data.message };
    } else {
        renderingData[url] = { type: "data", value: data };
    }
}

export function getRenderingValue<T>(url: string): null | Error | T {
    const value = getRenderingData()[url];
    if (value === undefined) {
        setRenderingValue(url, null);
        return null;
    }

    if (value === null) {
        return null;
    } else if (value.type === "error") {
        return new Error(value.message);
    } else {
        return value.value as T;
    }
}

export function removeRenderingData(url: string) {
    delete getWindow().RENDERING_DATA[url];
}

export function setRenderingHeader(key: keyof RenderingHeaders, value: string) {
    getWindow().RENDERING_HEADERS[key] = value;
}

export function getRenderingHeaders(): Partial<RenderingHeaders> {
    const window = getWindow();
    const headers = window.RENDERING_HEADERS;

    if (!headers.title) {
        const title = window?.document?.title;
        if (title) headers.title = title;
    }

    return headers;
}
