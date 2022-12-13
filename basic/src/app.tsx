import { Route, Router, PathMatch, Params } from "react-router-slim";
import { tokensToRegexp, parse, Key } from 'path-to-regexp';

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
    const keys: Key[] = [];
    const tokens = parse(path[0] === '#' ? path : '#' + path);
    const pattern = tokensToRegexp(tokens, keys);

    const { hash } = window.location;
    const match = pattern.exec(hash);
    if (!match) {
        return {};
    }

    const params: Params = {};
    for (let i = 1; i < match.length; i++) {
        params[keys[i - 1]['name']] = match[i];
    }

    let nextPath = '';
    if (typeof tokens[0] === 'string') {
        nextPath = (tokens[1] as Key)?.prefix ? tokens[0] + (tokens[1] as Key).prefix : tokens[0];
    } else {
        nextPath = tokens[0].prefix || '';
    }

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
        <Route path="/react-router(.*)">
            <Layout />
        </Route>
        <Route path="/react-router/(.*)">
            <Route path="home"><Home /></Route>
            <Route path="await" ><AwaitPage /></Route>
            <Route path="long-load"><LongLoad /></Route>
            <Route path="todos"><TodosList /></Route>
            <Route path="todos/(.*)" error={TodosBoundary}>
                <h5>Todo</h5>
                <Route path=":id"><Todo /></Route>
            </Route>
            <Route path="error" error={ErrorBoundary}><ErrorComponent /></Route>
            <Route><Fallback /></Route>
        </Route>
    </Router>
}
