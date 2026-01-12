import { Link, useNavigate } from "react-router-dom";
import { HardDrive, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-blue-600"
        >
          <HardDrive /> MiniDrive
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">
                My Drive
              </Link>
              <Link to="/shared" className="hover:text-blue-600">
                Shared Files
              </Link>
              <Link to="/shared-by-me" className="hover:text-blue-600">
                Shared By Me
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-red-600 font-medium"
                >
                  <ShieldCheck size={18} /> Admin
                </Link>
              )}

              <span className="text-gray-500 font-medium">
                Hi, {user.name}
              </span>

              <button
                onClick={logout}
                className="text-gray-600 hover:text-red-500"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-4 border-t pt-4">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                My Drive
              </Link>
              <Link to="/shared" onClick={() => setOpen(false)}>
                Shared Files
              </Link>
              <Link to="/shared-by-me" onClick={() => setOpen(false)}>
                Shared By Me
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-red-600 font-medium"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              )}

              <span className="text-gray-500">Hi, {user.name}</span>

              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-center"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
