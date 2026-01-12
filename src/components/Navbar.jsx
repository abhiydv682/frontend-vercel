import { Link, useNavigate } from 'react-router-dom';
import { HardDrive, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const logout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="bg-white shadow-sm border-b py-4 px-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                <HardDrive /> MiniDrive
            </Link>
            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-blue-600">My Files</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="flex items-center gap-1 text-red-600 font-medium">
                                <ShieldCheck size={18}/> Admin Panel
                            </Link>
                        )}
                        <span className="text-gray-500">Hi, {user.name}</span>
                        <button onClick={logout} className="text-gray-600 hover:text-red-500">
                            <LogOut size={20}/>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
}