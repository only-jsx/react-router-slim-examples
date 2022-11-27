import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { Params, RouterContext, RouteContext } from 'react-router-slim';

import type { Todos } from './todos';
import { addTodo, deleteTodo, getTodos } from './todos';

function sleep(n: number = 500) {
    return new Promise((r) => setTimeout(r, n));
}

interface LinkProps extends React.PropsWithChildren {
    to: string;
    replace?: boolean;
}

function Link({ children, to, replace }: LinkProps) {
    const router = React.useContext(RouterContext);
    const navigate = router.navigate;
    const onClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate?.(to, undefined, replace);
    }, [to, navigate]);

    return <a href={to} onClick={onClick}>{children}</a>
}

export function Layout() {
    return <>
        <nav>
            <Link to='/react-router/home' replace>Home</Link>
            &nbsp;|&nbsp;
            <Link to='/react-router/todos' replace>Todos</Link>
            &nbsp;|&nbsp;
            <Link to='/react-router/await' replace>Await</Link>
            &nbsp;|&nbsp;
            <Link to='/react-router/long-load' replace>Long Load</Link>
            &nbsp;|&nbsp;
            <Link to='/react-router/error' replace>Error</Link>
            &nbsp;|&nbsp;
            <Link to='/react-router/wrong' replace>Wrong Path</Link>
        </nav>
        <p>
            Click on over to <Link to='/react-router/todos'>/todos</Link> and check out these
            data loading APIs!{' '}
        </p>
    </>;
}

interface HomeLoaderData {
    date: string;
}

async function homeLoader(): Promise<HomeLoaderData> {
    await sleep();
    return {
        date: new Date().toISOString(),
    };
}

export function Home() {
    const [data, setData] = React.useState({ date: '' });
    React.useEffect(() => {
        homeLoader().then(data => {
            setData(data);
        })
    }, []);
    return (
        <>
            <h2>Home</h2>
            <p>Last loaded at: {data.date}</p>
        </>
    );
}

async function todosAction(formData: FormData) {
    await sleep();

    if (formData.get('action') === 'delete') {
        let id = formData.get('todoId');
        if (typeof id === 'string') {
            deleteTodo(id);
            return { ok: true };
        }
    }

    let todo = formData.get('todo');
    if (typeof todo === 'string') {
        addTodo(todo);
    }
}

async function todosLoader(): Promise<Todos> {
    await sleep();
    return getTodos();
}

export function TodosList() {
    const [todos, setTodos] = React.useState<Todos>();
    React.useEffect(() => {
        todosLoader().then(t => {
            setTodos(t);
        })
    }, []);

    const formRef = React.useRef<HTMLFormElement>(null);
    const [isAdding, setIsAdding] = React.useState(false);

    const onDeleted = React.useCallback(async () => {
        const t = await todosLoader();
        setTodos(t);
    }, []);

    const onSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsAdding(true);
        await todosAction(new FormData(e.target as HTMLFormElement))
        setIsAdding(false);

        formRef.current?.reset();

        const todos = await todosLoader();
        setTodos(todos);

        return false;
    }, []);

    return (
        <>
            <h2>Todos</h2>
            <p>
                This todo app uses a &lt;form&gt; to submit new todos and to delete todos. Click on a todo item to navigate
                to the /todos/:id route.
            </p>
            <ul>
                <li>
                    <Link to='/react-router/todos/junk'>
                        Click this link to force an error in the loader
                    </Link>
                </li>
                {todos && Object.entries(todos).map(([id, todo]) => (
                    <li key={id}>
                        <TodoItem id={id} todo={todo} onDeleted={onDeleted} />
                    </li>
                ))}
            </ul>
            <form ref={formRef} onSubmit={onSubmit}>
                <input type='hidden' name='action' value='add' />
                <input name='todo'></input>
                <button disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add'}
                </button>
            </form>
        </>
    );
}

export function TodosBoundary(props: FallbackProps) {
    const route = React.useContext(RouteContext);
    return (
        <>
            <h2>Error 💥</h2>
            <p>Params: {JSON.stringify(route.params)}</p>
            <p>{props.error?.message}</p>
        </>
    );
}

interface TodoItemProps {
    id: string;
    todo: string;
    onDeleted: (id: string) => void;
}

export function TodoItem({ id, todo, onDeleted }: TodoItemProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const onSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsDeleting(true);

        const fd = new FormData(e.target as HTMLFormElement);
        fd.append('todoId', (e.target as HTMLFormElement)['todoId'].value);
        await todosAction(fd);

        onDeleted(id);

        return false;
    }, [id, onDeleted]);

    return <>
        <Link to={`/react-router/todos/${id}`}>{todo}</Link>
        &nbsp;
        <form style={{ display: 'inline' }} onSubmit={onSubmit}>
            <input type='hidden' name='action' value='delete' />
            <button name='todoId' value={id} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </form>
    </>;
}

async function todoLoader(params: Params): Promise<string> {
    await sleep();
    let todos = getTodos();
    if (!params.id) {
        throw new Error('Expected params.id');
    }
    let todo = todos[params.id];
    if (!todo) {
        throw new Error(`Uh oh, I couldn't find a todo with id '${params.id}'`);
    }
    return todo;
}

export function Todo() {
    const route = React.useContext(RouteContext);
    const params = route.params;

    const [todo, setTodo] = React.useState('');

    React.useEffect(() => {
        if (params) {
            todoLoader(params).then(t => {
                setTodo(t);
            }).catch(error => {
                setTodo(t => { throw error });
            });
        }
    }, [params]);

    return (
        <>
            <h2>Nested Todo Route:</h2>
            <p>id: {params?.id}</p>
            <p>todo: {todo}</p>
        </>
    );
}

const controller = new AbortController();
const signal = controller.signal;

const rawPromise: Promise<string> = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
        resolve('Resolved raw promise!');
    }, 5000);

    signal.addEventListener('abort', () => {
        clearInterval(timeout);
        reject('Rejected raw promise!')
    });
});

// This component is loaded dynamically
const OtherComponent = React.lazy(async () => {
    const data = await rawPromise;
    return ({ default: () => <p>{data}</p> });
});

export function AwaitPage() {
    return <React.Suspense fallback={<p>Awaiting raw promise</p>}>
        <OtherComponent />
    </React.Suspense>;
}

export function LongLoad() {

    const [data, setData] = React.useState('Loading...');

    React.useEffect(() => {
        let n = data.length;
        const id = setInterval(() => {
            if (--n < 1) {
                setData('');
                clearInterval(id);
            } else {
                setData(data.substring(0, n));
            }
        }, 1000)
        return () => clearInterval(id);
    }, [data]);

    return data.length > 0 ? <p>{data}</p> : <h1>👋</h1>;
}

export function ErrorBoundary(props: FallbackProps) {
    const route = React.useContext(RouteContext);

    return (
        <>
            <h2>Error 💥</h2>
            <p>At path '{route.path}'</p>
            <p>Params: {JSON.stringify(route.params)}</p>
            <p>React ErrorBoundary message: "{props.error?.message}"</p>
            <p>RouteContext error message: "{route.error?.message}"</p>
        </>
    );
}

export function ErrorComponent(): JSX.Element {
    throw new Error('Error in route handler!');
}

export function Fallback() {
    return <p>Route does not exist</p>;
}
