import { render, screen } from '@testing-library/react';
import { RouterContext, RouteContext } from 'react-router-slim';

import App from './app';
import {Todo} from './routes';

const router: RouterContext = {
    match: (path: string) => ({}),
    navigate: (path: string, data?: any, replace?: boolean) => window.history.pushState(data, '', path),
}

describe('App tests', () => {
    const itTab = (name: string, navigate: string, text: string) => it(name, ()=>{
        router.navigate?.(navigate);
        render(<App />);
        screen.debug();
        const element = screen.getByText(text);
        expect(element).toBeInTheDocument();
    });

    itTab('app main page', '/react-router', 'Click on over to and check out these data loading APIs!');
    itTab('home page', '/react-router/home', 'Last loaded at:');
    itTab('todo list page', '/react-router/todos', 'Click this link to force an error in the loader');
    itTab('todo page', '/react-router/todos/junk', 'Nested Todo Route:');
    itTab('wrong page', '/react-router/wrong', 'Route does not exist');
});

test('renders todo item page', () => {

    const route: RouteContext = {
        path: '/react-router/todo/1',
        params: { id: '1'},
    }

    render(
        <RouterContext.Provider value={router}>
            <RouteContext.Provider value={route}>
                <Todo />
            </RouteContext.Provider>
        </RouterContext.Provider>
    );
    const hElement = screen.getByText('Nested Todo Route:');
    expect(hElement).toBeInTheDocument();
    const idElement = screen.getByText('id: 1');
    expect(idElement).toBeInTheDocument();
    const todoElement = screen.getByText('todo:');
    expect(todoElement).toBeInTheDocument();
});
