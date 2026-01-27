import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Mic,
    Globe,
    BookOpen,
    LogOut,
    Network
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import supabase from '../../supabase';
import './Sidebar.css';

export function Sidebar() {
    const { pathname } = useLocation();
    const { session } = useSession();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
    const email = session?.user?.email || '';
    const initial = email.charAt(0).toUpperCase();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Notes', path: '/documents' },
        { icon: Network, label: 'Mindmap', path: '/graph' },
        { icon: BookOpen, label: 'Study Assistant', path: '/study' },
        { icon: Mic, label: 'Listen', path: '/listen' },
        { icon: Globe, label: 'Research', path: '/research' },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">
                    <div className="logo-icon">F</div>
                    <span className="logo-text">FocusPrep</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                        {isActive(item.path) && <div className="active-indicator" />}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">{initial}</div>
                    <div className="user-info">
                        <span className="user-email">{email}</span>
                        <span className="user-plan">Free Plan</span>
                    </div>
                </div>
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="logout-btn"
                    aria-label="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
