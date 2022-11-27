import { Route, Router } from "react-router-slim";

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

export default function App() {
    return <Router>
        <Route path="/react-router(.*)">
            <Layout />
        </Route>
        <Route path="/react-router/(.*)">
            <Route path="home"><Home /></Route>
            <Route path="await" ><AwaitPage /></Route>
            <Route path="long-load"><LongLoad /></Route>
            <Route path="todos"><TodosList/></Route>
            <Route path="todos/(.*)" error={TodosBoundary}>
                <h5>Todo</h5>
                <Route path=":id"><Todo/></Route>
            </Route>
            <Route path="error" error={ErrorBoundary}><ErrorComponent/></Route>
            <Route><Fallback /></Route>
        </Route>
    </Router>
}
