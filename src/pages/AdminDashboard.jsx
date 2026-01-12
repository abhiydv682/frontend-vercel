import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  FileText,
  Share2,
  Trash2,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [data, setData] = useState({
    meta: {},
    users: [],
    files: []
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/admin/all-data",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adminDelete = async (id) => {
    if (!window.confirm("Admin: Force delete this file?")) return;

    try {
      setDeletingId(id);
      await axios.delete(
        `http://localhost:5000/api/files/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.warning("File removed by admin");
      fetchData();
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------- PAGE LOADING -------------------- */
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Overview</h1>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox
          icon={<Users size={32} className="text-blue-600" />}
          label="Total Users"
          value={data.meta.totalUsers ?? 0}
        />
        <StatBox
          icon={<FileText size={32} className="text-green-600" />}
          label="Total Files"
          value={data.meta.totalFiles ?? data.files.length}
        />
        <StatBox
          icon={<Share2 size={32} className="text-purple-600" />}
          label="Total Shares"
          value={data.files.reduce(
            (sum, f) => sum + (f.shareCount || 0),
            0
          )}
        />
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">File</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Shares</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.files.map((file) => (
              <tr key={file._id} className="border-b">
                <td className="p-4">{file.name}</td>
                <td className="p-4 text-sm">
                  <p className="font-medium">{file.owner?.name}</p>
                  <p className="text-gray-500">{file.owner?.email}</p>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {file.shareCount} shares
                  </span>
                </td>
                <td className="p-4">
                  <DeleteButton
                    deletingId={deletingId}
                    fileId={file._id}
                    onDelete={adminDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.files.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No files found
          </p>
        )}
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <div className="md:hidden space-y-4">
        {data.files.map((file) => (
          <div
            key={file._id}
            className="bg-white border rounded-xl p-4 space-y-3"
          >
            <p className="font-medium">{file.name}</p>

            <div className="text-sm text-gray-600">
              <p>{file.owner?.name}</p>
              <p>{file.owner?.email}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {file.shareCount} shares
              </span>

              <DeleteButton
                deletingId={deletingId}
                fileId={file._id}
                onDelete={adminDelete}
              />
            </div>
          </div>
        ))}

        {data.files.length === 0 && (
          <p className="text-center text-gray-500 p-6">
            No files found
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function StatBox({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border flex items-center gap-4">
      {icon}
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function DeleteButton({ deletingId, fileId, onDelete }) {
  return (
    <button
      onClick={() => onDelete(fileId)}
      disabled={deletingId === fileId}
      className="text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {deletingId === fileId ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}
