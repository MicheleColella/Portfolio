import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function AdminContent() {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return <AdminDashboard />;
}

export default function AdminPage() {
    return (
        <AdminAuthProvider>
            <AdminContent />
        </AdminAuthProvider>
    );
}
