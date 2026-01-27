import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export default function ModernLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-subtle)' }}>
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            {/* Margin left matches sidebar width (260px) */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: 'var(--spacing-lg)',
                width: 'calc(100% - 260px)', // Prevent overflow
                overflowX: 'hidden'
            }}>
                <Outlet />
            </main>
        </div>
    );
}
