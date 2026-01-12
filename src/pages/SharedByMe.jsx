import { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  UserMinus,
  User,
  Mail,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

export default function SharedByMe() {
  const [shares, setShares] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchShares = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/files/shared-by-me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShares(res.data);
    } catch {
      toast.error("Failed to load shared files");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const revokeAccess = async (accessId) => {
    if (!window.confirm("Stop sharing this file with this user?")) return;

    try {
      setRevokingId(accessId);
      await axios.delete(
        `http://localhost:5000/api/files/share/${accessId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Access revoked");
      fetchShares();
    } catch {
      toast.error("Failed to revoke access");
    } finally {
      setRevokingId(null);
    }
  };

  /* ---------------- PAGE LOADING ---------------- */
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-8">
        Files I've Shared
      </h1>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-sm text-gray-500 uppercase">
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Shared With</th>
              <th className="px-6 py-4">Permissions</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {shares.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <FileText size={18} className="text-blue-500" />
                  <span className="font-medium">
                    {s.file?.name}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <p className="font-medium flex items-center gap-1">
                    <User size={14} />
                    {s.receiver?.name}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail size={12} />
                    {s.receiver?.email}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <PermissionBadges share={s} />
                </td>

                <td className="px-6 py-4 text-right">
                  <RevokeButton
                    id={s._id}
                    revokingId={revokingId}
                    revokeAccess={revokeAccess}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shares.length === 0 && (
          <p className="p-10 text-center text-gray-400">
            You haven't shared any files yet.
          </p>
        )}
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <div className="md:hidden space-y-4">
        {shares.map((s) => (
          <div
            key={s._id}
            className="bg-white border rounded-xl p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2 font-medium">
              <FileText size={18} className="text-blue-500" />
              {s.file?.name}
            </div>

            <div className="text-sm">
              <p className="flex items-center gap-1 font-medium">
                <User size={14} /> {s.receiver?.name}
              </p>
              <p className="flex items-center gap-1 text-gray-400 text-xs">
                <Mail size={12} /> {s.receiver?.email}
              </p>
            </div>

            <PermissionBadges share={s} />

            <div className="flex justify-end">
              <RevokeButton
                id={s._id}
                revokingId={revokingId}
                revokeAccess={revokeAccess}
              />
            </div>
          </div>
        ))}

        {shares.length === 0 && (
          <p className="p-10 text-center text-gray-400">
            You haven't shared any files yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function PermissionBadges({ share }) {
  return (
    <div className="flex gap-1 flex-wrap">
      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
        View
      </span>
      {share.canEdit && (
        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded">
          Edit
        </span>
      )}
      {share.canDelete && (
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded">
          Delete
        </span>
      )}
    </div>
  );
}

function RevokeButton({ id, revokingId, revokeAccess }) {
  return (
    <button
      onClick={() => revokeAccess(id)}
      disabled={revokingId === id}
      className="text-red-500 hover:bg-red-50 p-2 rounded-full disabled:opacity-50"
      title="Revoke Access"
    >
      {revokingId === id ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <UserMinus size={20} />
      )}
    </button>
  );
}
