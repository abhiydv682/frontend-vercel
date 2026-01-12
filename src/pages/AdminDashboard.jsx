import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, User, Mail, FileText, Search, 
  BarChart3, Users, HardDrive, ExternalLink 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
    const [allFiles, setAllFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    // Fetch all files for Admin
    const fetchAdminData = async () => {
        try {
            // setLoading(true);
            // const res = await axios.get('http://localhost:5000/api/files/admin/all', {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            setLoading(true);
            // UPDATED URL: Changed /files/admin/all to /admin/all-files
            const res = await axios.get('http://localhost:5000/api/admin/all-files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllFiles(res.data);
        } catch (err) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdminData(); }, []);

    // Admin Delete Functionality
    const deleteFile = async (id, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) return;
        
        try {
            await axios.delete(`http://localhost:5000/api/files/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("File deleted by admin");
            setAllFiles(allFiles.filter(f => f._id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    // // Filter logic for Search
    // const filteredFiles = allFiles.filter(file => 
    //     file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    //     file.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     file.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    // Safe Filter logic for Search
    const filteredFiles = allFiles.filter(file => {
        // Ensure properties exist before calling toLowerCase()
        const fileName = file.name ? file.name.toLowerCase() : '';
        const ownerName = file.owner?.name ? file.owner.name.toLowerCase() : '';
        const ownerEmail = file.owner?.email ? file.owner.email.toLowerCase() : '';
        const search = searchTerm.toLowerCase();

        return (
            fileName.includes(search) || 
            ownerName.includes(search) || 
            ownerEmail.includes(search)
        );
    });

    // Calculate Standout Stats
    const totalUsers = [...new Set(allFiles.map(f => f.owner?._id))].length;
    const totalStorage = (allFiles.length * 1.2).toFixed(1); // Mock calculation for "Size"

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage all uploaded content across the platform.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search files or users..." 
                        className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Standout Feature: Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Files</p>
                        <p className="text-2xl font-bold">{allFiles.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Users /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Users</p>
                        <p className="text-2xl font-bold">{totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><HardDrive /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Estimated Storage</p>
                        <p className="text-2xl font-bold">{totalStorage} MB</p>
                    </div>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <BarChart3 size={18} className="text-gray-600"/>
                    <h2 className="font-semibold text-gray-700">All User Uploads</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-sm uppercase tracking-wider border-b">
                                <th className="px-6 py-4 font-medium">File Details</th>
                                <th className="px-6 py-4 font-medium">Owner</th>
                                <th className="px-6 py-4 font-medium">Upload Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-medium animate-pulse">Loading drive data...</td></tr>
                            ) : filteredFiles.map(file => (
                                <tr key={file._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded text-gray-600"><FileText size={20}/></div>
                                            <div>
                                                <p className="font-medium text-gray-800 truncate w-48">{file.name}</p>
                                                <p className="text-xs text-gray-400">PDF/Image</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1 text-gray-700 font-medium">
                                                <User size={14}/> {file.owner?.name || 'Unknown'}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                                                <Mail size={12}/> {file.owner?.email || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a 
                                                href={file.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="View File"
                                            >
                                                <ExternalLink size={18}/>
                                            </a>
                                            <button 
                                                onClick={() => deleteFile(file._id, file.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete File"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredFiles.length === 0 && !loading && (
                        <div className="py-20 text-center">
                            <p className="text-gray-400 text-lg">No files found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}