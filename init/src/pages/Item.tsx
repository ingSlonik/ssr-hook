import { Link, useTitle } from "easy-page-router/react";
import { useHeaders, useSSRHook } from "ssr-hook";

import { Item } from "../../types";

export default function Item({ id }: { id: string }) {

    const [item, error, isLoading, reload] = useSSRHook<Item>(`/api/item/${encodeURIComponent(id)}`);

    const itemTitle = item?.title ?? "Loading item...";


    const title = `${itemTitle} | __NAME__`;
    useTitle(title);
    useHeaders({
        title,
        description: `Detail page about ${itemTitle} | __NAME__`,
        image: window.location.origin + "/logo.png",
        canonical: window.location.origin + window.location.pathname,
    });

    return (
        <>
            <Link to="/">Back to home page</Link>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {item && <>
                <h1>{item.title}</h1>
                <p>{item.description}</p>
            </>}
        </>
    );
}
