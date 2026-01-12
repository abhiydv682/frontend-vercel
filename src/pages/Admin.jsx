import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, User, Mail, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Admin() {
    const [allFiles, setAllFiles] = useState([]);
    const token = localStorage.getItem('token');

    const fetchAllFiles = async () => {
        const res = await axios.get('https://your-backend.onrender.com/api/files/admin/all', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAllFiles(res.data);
    };

    useEffect(() => { fetchAllFiles(); }, []);

    const deleteFile = async (id) => {
        if(!window.confirm("Admin: Are you sure you want to delete this user's file?")) return;
        await axios.delete(`https://your-backend.onrender.com/api/files/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.info("File removed by admin");
        fetchAllFiles();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-red-600">Admin Control Center</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">File Name</th>
                            <th className="p-4">Uploaded By</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allFiles.map(file => (
                            <tr key={file._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 flex items-center gap-2">
                                    <FileText size={18} className="text-gray-400"/> {file.name}
                                </td>
                                <td className="p-4"><span className="flex items-center gap-1"><User size={16}/> {file.owner?.name}</span></td>
                                <td className="p-4 text-gray-500"><span className="flex items-center gap-1"><Mail size={16}/> {file.owner?.email}</span></td>
                                <td className="p-4 flex gap-3">
                                    <a href={file.url} target="_blank" className="text-blue-600 hover:underline">View</a>
                                    <button onClick={() => deleteFile(file._id)} className="text-red-500">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allFiles.length === 0 && <p className="p-10 text-center text-gray-400">No files found in the system.</p>}
            </div>
        </div>
    );
}