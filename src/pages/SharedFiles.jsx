import { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Trash2,
  User,
  Edit,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

export default function SharedFiles() {
  const [shared, setShared] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchShared = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/files/shared-with-me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShared(res.data);
    } catch {
      toast.error("Error loading shared files");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchShared();
  }, []);

  /* -------- DELETE -------- */
  const handleDelete = async (fileId) => {
    if (!window.confirm("This will delete the file for everyone. Continue?"))
      return;

    try {
      setDeletingId(fileId);
      await axios.delete(
        `http://localhost:5000/api/files/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("File deleted successfully");
      fetchShared();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* -------- EDIT -------- */
  const handleEdit = async (fileId, newFile) => {
    if (!newFile) return;

    const formData = new FormData();
    formData.append("file", newFile);

    try {
      setEditingId(fileId);
      await axios.put(
        `http://localhost:5000/api/files/edit/${fileId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      toast.success("File updated successfully");
      fetchShared();
    } catch (err) {
      toast.error(err.response?.data?.error || "Edit failed");
    } finally {
      setEditingId(null);
    }
  };

  /* -------- PAGE LOADING -------- */
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 sm:mb-8">
        Shared With Me
      </h1>

      {shared.length === 0 && (
        <p className="text-center text-gray-400 mt-16 sm:mt-24">
          No files have been shared with you.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {shared.map((s) => (
          <div
            key={s._id}
            className="bg-white p-4 sm:p-5 border rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <FileText size={24} />
              </div>

              <div className="flex gap-2">
                <a
                  href={s.file?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Download size={20} />
                </a>

                {s.canEdit && (
                  <label className="p-2 hover:bg-blue-50 rounded-full cursor-pointer">
                    {editingId === s.file?._id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Edit size={20} />
                    )}
                    <input
                      type="file"
                      hidden
                      disabled={editingId === s.file?._id}
                      onChange={(e) =>
                        handleEdit(
                          s.file?._id,
                          e.target.files[0]
                        )
                      }
                    />
                  </label>
                )}

                {s.canDelete && (
                  <button
                    onClick={() => handleDelete(s.file?._id)}
                    disabled={deletingId === s.file?._id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50"
                  >
                    {deletingId === s.file?._id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>

            <h3 className="font-bold truncate">
              {s.file?.name}
            </h3>

            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              <User size={14} /> {s.owner?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
