![SSR hook logo](./images/ssr-hook.png)

# SSR hook - Server-Site Rendering hook for React

Make Server-Site Rendering as easy as possible without any framework.
Move your website to SSR almost without changes in your code.

## Usage

Only one line difference

### Client

```js
import { useSSRHook } from "ssr-hook";

const [items, error, isLoading, reload] = useSSRHook<Item[]>("/api/items");
```

#### SEO

```js
import { useHeaders } from "ssr-hook";

useHeaders({
    title: "About me | My website",
    description: "This page is about me.",
    image: window.location.origin + "/logo.png",
    canonical: window.location.origin + window.location.pathname,
});
```

### Server

```js
import { render } from "ssr-hook/server";

const { headers, body } = render(origin, url, <App />);
```

## Installation

```
npm install ssr-hook
```

## Create new project with SSR hook


```
npx ssr-hook --init my-new-project
```

## Move your project to SSR

### Client

All data that you need to have rendered have as GET method and change all your data fetch that you need to have rendered to `useSSRHook`:
```js
const [items, error, isLoading, reload] = useSSRHook<Item[]>("/api/items");
```

Change render dom to hydrate:
```js
createRoot(rootElement).render(<App />); => hydrateRoot(rootElement, <App />);
```

If your development server is on different origin you can use:
```js
import { setSSROrigin } from "ssr-hook";
if (process.env.NODE_ENV === "development") setSSROrigin("http://localhost:1200");
```

### Server

You can just use function `render` that return `headers` and `body` as string and handle it as you wish.
```js
import { render } from "ssr-hook/server";

const { headers, root, renderingData } = render(origin, url, <App />);

const html = `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  ${headers}
</head>

<body>
  <div id="root">${root}</div>
  ${renderingData}
  <script src="/bundle.js"></script>
</body>

</html>`;
```

Here is example with using `express`:

```js
import { renderToHTML } from "ssr-hook/server";
import express, { Request, Response } from "express";
import { readFile } from "fs/promises";

const origin = "http://localhost:3000";

const app = express();

// just example of an endpoint
app.get("/api/items", async (req, res) => {
    return [{ title: "Item1" }, { title: "Item2" }];
});

app.get("*", async (req, res) => {
    const indexHtml = await readFile("../index.html", "utf-8");
    const html = await renderToHTML(origin, req.url, indexHtml, <App />);
    res.set("Content-Type", "text/html");
    res.send(html);
});

app.listen(PORT, () => console.log(`SSR is listening on ${LOCALHOST}`));
```

#### renderToHTML

There is necessary to have `<div id="root"></div>` in body and main bundle js script load at the end of the `index.html`!
