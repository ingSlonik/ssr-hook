export type SiteMap = {
    url: string;
    lastModified: string;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
};

export type Item = {
    id: string;
    title: string,
    description: string,
};