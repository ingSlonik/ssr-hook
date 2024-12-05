import { resolve } from "path";
import { readFile } from "fs/promises";

import express from "express";
import cors from "cors";

import { renderToHTML } from "ssr-hook/server";

import App from "../src/App";

import { SiteMap } from "../types";


const PORT = 1200;
const ORIGIN = `http://localhost:${PORT}`;

const INDEX_HTML_PATH = resolve("..", "src", "index.html");


const app = express();

if (process.env.NODE_ENV === "development") {
    console.log("Starting development server...");
    app.use(cors());
}

// ---------------------------- SSR for index ----------------------------------
app.get(["/", "/index.html"], async (req, res) => {
    try {
        const indexHtml = await readFile(INDEX_HTML_PATH, "utf-8");
        const html = await renderToHTML(ORIGIN, req.url, indexHtml, <App />);
        res.set("Content-Type", "text/html");
        res.send(html);
    } catch (e) {
        console.error("SSR error:", e);
        res.status(500);
        res.json({ message: "Internal server error" });
    }
});

// builded app
app.use(express.static("dist"));
// public files
app.use(express.static("public"));

// --------------------------------- SEO ---------------------------------------
app.get("/robots.txt", (_, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Disallow:
Sitemap: ${ORIGIN}/sitemap.xml`);
});

app.get("/sitemap.xml", async (_, res) => {
    // TODO: add all pages
    const sitemap: SiteMap[] = [{
        url: ORIGIN + "/",
        lastModified: "2022-01-01",
        changeFrequency: "weekly",
        priority: 1,
    }];

    res.set("Content-Type", "text/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(s => `<url>
        <loc>${s.url}</loc>
        <lastmod>${s.lastModified}</lastmod>
        ${s.changeFrequency ? `<changefreq>${s.changeFrequency}</changefreq>` : ""}
        <priority>${s.priority}</priority>
    </url>`).join("\n")}</urlset>`);
});


// --------------------------------- API ---------------------------------------
app.use(express.json({ limit: "1MB" }));

// just example of an endpoint
const items: Item[] = [{
    id: "item1",
    title: "Item1",
    description: "Description of item1",
}, {
    id: "item2",
    title: "Item2",
    description: "Description of item1",
}];

app.get("/api/items", async (req, res) => {
    return items;
});
app.get("/api/item/:id", async (req, res) => {
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json(item);
});


// --------------------------------- SSR ---------------------------------------
app.get("*", async (req, res) => {
    try {
        const indexHtml = await readFile(INDEX_HTML_PATH, "utf-8");
        const html = await renderToHTML(ORIGIN, req.url, indexHtml, <App />);
        res.set("Content-Type", "text/html");
        res.send(html);
    } catch (e) {
        console.error("SSR error:", e);
        res.status(500);
        res.json({ message: "Internal server error" });
    }
});

// ----------------------------- Run server ------------------------------------
app.listen(PORT, () => console.log(`SSR-hook server is listening on ${ORIGIN}`));
