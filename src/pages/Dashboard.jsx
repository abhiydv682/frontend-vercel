import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Trash2,
  FileText,
  Upload,
  Share2,
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const base_url = import.meta.env.VITE_API_BASE_URL;

  // Upload Preview State
  const [uploadSelection, setUploadSelection] = useState({
    file: null,
    preview: null
  });

  // Image View State
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingBlobUrl, setViewingBlobUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);


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
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let preview = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setUploadSelection({ file, preview });
    e.target.value = null; // Allow selecting the same file again
  };

  const clearSelection = () => {
    if (uploadSelection.preview) {
      URL.revokeObjectURL(uploadSelection.preview);
    }
    setUploadSelection({ file: null, preview: null });
  };

  const handleConfirmUpload = async () => {
    if (!uploadSelection.file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadSelection.file);

    try {
      await axios.post(
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
      clearSelection();
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (file) => {
    // Basic check for image extension
    if (!file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      toast.info("Preview only available for images");
      return;
    }

    if (file.url) {
      setViewingFile(file);
      setViewingBlobUrl(file.url);
    } else {
      toast.error("Image URL not found");
    }
  };

  const closeView = () => {
    if (viewingBlobUrl && viewingBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(viewingBlobUrl);
    }
    setViewingFile(null);
    setViewingBlobUrl(null);
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
          <input type="file" hidden onChange={handleFileSelect} disabled={isUploading} />
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
                  onClick={() => handleView(f)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-600"
                  title="View"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() =>
                    setShareModal({
                      show: true,
                      fileId: f._id,
                      fileName: f.name
                    })
                  }
                  className="p-2 hover:bg-blue-50 rounded text-blue-600"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={() => handleDelete(f._id)}
                  disabled={deletingId === f._id}
                  className="p-2 hover:bg-red-50 rounded disabled:opacity-50 text-red-600"
                  title="Delete"
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

      {/* UPLOAD PREVIEW MODAL */}
      {uploadSelection.file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-gray-800">
                Upload Preview
              </h2>
              <button
                onClick={clearSelection}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6 flex flex-col items-center">
              {uploadSelection.preview ? (
                <div className="relative w-full h-64 mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={uploadSelection.preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 w-full rounded-lg border border-dashed border-gray-300">
                  <FileText size={48} className="text-blue-500 mb-2" />
                  <p className="text-gray-500 text-sm">Preview not available for this file type</p>
                </div>
              )}
              <p className="font-medium text-gray-700 truncate max-w-full px-4">
                {uploadSelection.file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(uploadSelection.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSelection}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium shadow-md transition-all flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Confirm Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW IMAGE MODAL */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={closeView}>
          <div className="relative max-w-4xl w-full max-h-[90vh] p-4 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={closeView}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            {loadingPreview ? (
              <Loader2 className="animate-spin text-white" size={48} />
            ) : viewingBlobUrl ? (
              <img
                src={viewingBlobUrl}
                alt={viewingFile.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="bg-white p-8 rounded-lg text-center">
                <p className="text-red-500">Could not load image preview.</p>
              </div>
            )}

            {!loadingPreview && (
              <p className="mt-4 text-white text-lg font-medium drop-shadow-md">
                {viewingFile.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
