import { Route, Router } from "react-router-slim";
import { parse, pathToRegexp } from 'path-to-regexp';
import type { PathMatch, Params } from "react-router-slim";

import {
    Fallback,
    Layout,
    Home,
    TodosList,
    TodosBoundary,
    ErrorBoundary,
    Todo,
    LongLoad,
    AwaitPage,
    ErrorComponent,
} from "./routes";

function match(path: string): PathMatch {
    const { tokens } = parse(path[0] === '#' ? path.slice(1) : path);
    const { regexp, keys } = pathToRegexp(path);

    const { hash } = window.location;
    const match = regexp.exec(hash.slice(1));

    if (!match) {
        return {};
    }

    const params: Params = {};

    for (let i = 0; i < keys.length; i++) {
        if (keys[i].type === 'param' && match[i + 1]) {
            params[keys[i].name] = match[i + 1];
        }
    }

    const nextPath = tokens[0].type === 'text' ? tokens[0].value : '';

    return { match, params, nextPath };
}

function hashNavigate(path: string, data?: any, replace?: boolean) {
    if (replace) {
        window.location.replace('#' + path);
    } else {
        window.location.assign('#' + path);
    }
}

function historyNavigate(path: string, data?: any, replace?: boolean) {
    if (replace) {
        window.history.replaceState(data, '', path + window.location.hash);
    } else {
        window.history.pushState(data, '', path + window.location.hash);
    }
}

function getCurrentPath() {
    return window.location.hash;
}

const hashRouterProps = {
    match, navigate: hashNavigate, changeEvent: 'hashchange', getCurrentPath
};

const historyRouterProps = { navigate: historyNavigate };

export default function App({ hash }: { hash?: boolean }) {
    const rp = hash ? hashRouterProps : historyRouterProps;

    return <Router {...rp}>
        <Route path="/react-router{*page}">
            <Layout />
        </Route>
        <Route path="/react-router/*page">
            <Route path="home"><Home /></Route>
            <Route path="await" ><AwaitPage /></Route>
            <Route path="long-load"><LongLoad /></Route>
            <Route path="todos"><TodosList /></Route>
            <Route path="todos/*todo" error={TodosBoundary}>
                <h5>Todo</h5>
                <Route path=":id"><Todo /></Route>
            </Route>
            <Route path="error" error={ErrorBoundary}><ErrorComponent /></Route>
            <Route><Fallback /></Route>
        </Route>
    </Router>
}
