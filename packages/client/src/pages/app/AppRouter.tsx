import { observer } from 'mobx-react-lite';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppPage } from './AppPage';
import { NewAppPage } from './NewAppPage';

// Fix these
import { NavigatorLayout } from '../NavigatorLayout';

export const AppRouter = observer(() => {
    return (
        <Routes>
            {/* New Apps */}
            <Route
                path="new"
                element={
                    <NavigatorLayout>
                        <NewAppPage />
                    </NavigatorLayout>
                }
            ></Route>
            {/* Already Built App */}
            <Route path=":appId" element={<AppPage />}></Route>
            <Route path="*" element={<Navigate to={`/`} replace />} />
        </Routes>
    );
});
