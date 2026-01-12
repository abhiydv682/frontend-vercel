import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, FileText, Download, Upload, Loader2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
    
    const fileInputRef = useRef(null);
    const token = localStorage.getItem('token');

    const fetchFiles = async () => {
        try {
            setIsPageLoading(true);
            const res = await axios.get('http://localhost:5000/api/files/myfiles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(res.data);
        } catch (err) {
            toast.error("Failed to fetch files");
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => { fetchFiles(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.warning("Please select a file first");

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            setIsUploading(true);
            await axios.post('http://localhost:5000/api/files/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success("File uploaded successfully!");
            
            // 1. Reset file state and input field
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            fetchFiles();
        } catch (err) { 
            toast.error("Upload failed"); 
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = (id, name) => {
        setDeleteModal({ show: true, id, name });
    };

    const handlePermanentDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/files/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(files.filter(f => f._id !== deleteModal.id));
            toast.info("File deleted permanently");
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setDeleteModal({ show: false, id: null, name: '' });
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Drive</h1>
                <p className="text-gray-500 text-sm">{files.length} files stored</p>
            </div>
            
            {/* Upload Section */}
            <form onSubmit={handleUpload} className="mb-10 flex flex-col md:flex-row gap-4 bg-white border p-6 rounded-xl shadow-sm">
                <div className="flex-1">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files[0])} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                </div>
                <button 
                    disabled={isUploading || !file}
                    className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                    {isUploading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
                    {isUploading ? "Uploading..." : "Upload to Cloud"}
                </button>
            </form>

            {/* Files Grid / Loading State */}
            {isPageLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Accessing your cloud storage...</p>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                    <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500">Your drive is empty. Start by uploading a file!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map(f => (
                        <div key={f._id} className="group bg-white border p-5 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <a href={f.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition">
                                        <Download size={18}/>
                                    </a>
                                    <button onClick={() => confirmDelete(f._id, f.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-800 truncate" title={f.name}>{f.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                                    {new Date(f.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CUSTOM DELETE MODAL */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <button onClick={() => setDeleteModal({ show: false })} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Permanently?</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModal.name}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteModal({ show: false })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePermanentDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;