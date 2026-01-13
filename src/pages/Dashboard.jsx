import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Trash2,
  FileText,
  Upload,
  Share2,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const base_url = import.meta.env.VITE_API_BASE_URL;


  // Share Modal States
  const [shareModal, setShareModal] = useState({
    show: false,
    fileId: null,
    fileName: ''
  });
  const [shareEmail, setShareEmail] = useState('');
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false
  });

  const token = localStorage.getItem('token');

  const fetchFiles = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get(
        // 'http://localhost:5000/api/files/myfiles',
         `${base_url}/api/files/myfiles`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setFiles(res.data);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  /* ---------------- SHARE ---------------- */
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      setSharing(true);
      await axios.post(
        // 'http://localhost:5000/api/files/share',
         `${base_url}/api/files/share`,
        {
          fileId: shareModal.fileId,
          receiverEmail: shareEmail,
          canView: true,
          canEdit: permissions.canEdit,
          canDelete: permissions.canDelete
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Shared ${shareModal.fileName}`);
      setShareModal({ show: false, fileId: null, fileName: '' });
      setShareEmail('');
      setPermissions({ canEdit: false, canDelete: false });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sharing failed');
    } finally {
      setSharing(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      setDeletingId(fileId);
      await axios.delete(
        // `http://localhost:5000/api/files/${fileId}`,
        `${base_url}/api/files/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(files.filter(f => f._id !== fileId));
      toast.success('File deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        // 'http://localhost:5000/api/files/upload',
         `${base_url}/api/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      toast.success('File uploaded');
      fetchFiles();
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------------- PAGE LOADING ---------------- */
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Drive</h1>

        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg cursor-pointer shadow-md">
          {isUploading
            ? <Loader2 className="animate-spin" size={20} />
            : <Upload size={20} />}
          <span>{isUploading ? 'Uploading…' : 'Upload File'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      {/* FILE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map(f => (
          <div key={f._id} className="bg-white border p-5 rounded-xl shadow-sm">
            <div className="flex justify-between">
              <FileText size={30} className="text-blue-500" />
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setShareModal({
                      show: true,
                      fileId: f._id,
                      fileName: f.name
                    })
                  }
                  className="p-2 hover:bg-blue-50 rounded"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={() => handleDelete(f._id)}
                  disabled={deletingId === f._id}
                  className="p-2 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  {deletingId === f._id
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Trash2 size={18} />}
                </button>
              </div>
            </div>
            <h3 className="mt-4 font-semibold truncate">{f.name}</h3>
          </div>
        ))}
      </div>

      {/* SHARE MODAL */}
      {shareModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">
                Share "{shareModal.fileName}"
              </h2>
              <button onClick={() => setShareModal({ show: false })}>
                <X />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full border p-2 rounded"
                onChange={(e) => setShareEmail(e.target.value)}
              />

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setPermissions({ ...permissions, canEdit: e.target.checked })
                  }
                />
                Can Edit
              </label>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setPermissions({ ...permissions, canDelete: e.target.checked })
                  }
                />
                Can Delete
              </label>

              <button
                disabled={sharing}
                className="w-full bg-blue-600 text-white py-2 rounded flex justify-center"
              >
                {sharing
                  ? <Loader2 className="animate-spin" />
                  : 'Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
