import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await axios.post('http://localhost:5000/api/auth/signup', form);
            toast.success("Account created! Please login.");
            navigate('/login');
        } catch (err) {
            toast.error("Signup failed. Email might exist.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white border rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" className="border p-3 rounded" required
                    onChange={e => setForm({...form, name: e.target.value})} />
                <input type="email" placeholder="Email Address" className="border p-3 rounded" required
                    onChange={e => setForm({...form, email: e.target.value})} />
                <input type="password" placeholder="Password" className="border p-3 rounded" required
                    onChange={e => setForm({...form, password: e.target.value})} />
                
                <select className="border p-3 rounded bg-gray-50" 
                    onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                </select>

                <button className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Sign Up
                </button>
            </form>
        </div>
    );
}