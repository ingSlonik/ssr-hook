export type SiteMap = {
    url: string;
    lastModified: string;
    changeFrequency?: string;
    priority: number;
};

export type Item = {
    id: string;
    title: string,
    description: string,
};