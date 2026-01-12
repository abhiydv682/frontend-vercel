import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({email: '', password: ''});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
           const res = await axios.post('http://localhost:5000/api/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
            window.location.reload();
        } catch (err) { alert("Login failed"); }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-xl font-bold mb-4">Login to Mini Drive</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="email" placeholder="Email" className="border p-2" onChange={e => setForm({...form, email: e.target.value})} />
                <input type="password" placeholder="Password" className="border p-2" onChange={e => setForm({...form, password: e.target.value})} />
                <button className="bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
}