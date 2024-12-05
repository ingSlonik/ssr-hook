#!/usr/bin/env node
import { resolve } from "path";
import { execSync } from "child_process";
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from "fs";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const { version } = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8")).version;

const argv = yargs(hideBin(process.argv))
    .usage('\nSSR hook - Server-Site Rendering hook for React')
    .help('help').alias('help', 'h')
    .version('version', version).alias('version', 'v')
    .options({
        init: {
            alias: 'i',
            type: "string",
            description: "<project name> Input project name",
            requiresArg: true,
        },
    })
    .parse();

let name = (argv as any)?.init as string;

if (typeof name !== "string" || !name.trim()) {
    console.log("Missing project name!");
    process.exit(1);
}

name = name.trim();
const nameSlug = slugify(name);

const cwd = resolve(process.cwd());
const path = resolve(cwd, nameSlug);

if (existsSync(path)) {
    console.log(`Folder / Project ${nameSlug} already exists!`);
    process.exit(1);
}

console.log(`\nCreating project ${name}...`);
mkdirSync(path);

console.log("\nCopy init files...");
cpSync(resolve(__dirname, "init"), path, { recursive: true });

console.log("\nSetting project name...");
changeName("package.json", nameSlug);
changeName("README.md", name);
changeName("src/site.webmanifest", name);
changeName("src/pages/Item.tsx", name);
changeName("src/pages/Items.tsx", name);
changeName("src/pages/NotFound.tsx", name);

console.log("\nInstalling dependencies...");
execSync("cd " + path + " && npm install", { stdio: "inherit" });

console.log(`\nCreating project ${name} id done!
Go to the project: 
$ cd ${nameSlug}

Run development server:
$ npm run dev

Build project:
$ npm run build

Run production server:
$ npm run start


Tell your developer friends about RRS-hook ;)
`);

// ---------------------- helpers ----------------------

function slugify(text: string) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

function changeName(fileName: string, name: string) {
    const pathFile = resolve(path, fileName);
    const file = readFileSync(pathFile, "utf-8");
    const fileChanged = file.replaceAll("__NAME__", name);
    writeFileSync(pathFile, fileChanged);
}