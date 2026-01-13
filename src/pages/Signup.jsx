import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [isLoading, setIsLoading] = useState(false);
          const base_url = import.meta.env.VITE_API_BASE_URL;


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await axios.post(
        // "http://localhost:5000/api/auth/register",
        `${base_url}/api/auth/register`,
        form
      );
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch {
      toast.error("Signup failed. Email might exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            disabled={isLoading}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            disabled={isLoading}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            disabled={isLoading}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            disabled={isLoading}
            className="border p-3 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="user">Regular User</option>
            <option value="admin">Administrator</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
