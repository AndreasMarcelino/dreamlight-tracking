import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function BroadcasterAssets() {
  const [assets, setAssets] = useState([]);
  const [groupedAssets, setGroupedAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get("/assets/broadcaster/my-files");
      setAssets(response.data.data || []);
      setGroupedAssets(response.data.grouped || null);
    } catch (error) {
      toast.error("Gagal memuat files");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (assetId, fileName) => {
    try {
      const response = await api.get(`/assets/${assetId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("video")) return "fa-file-video text-ocean-500";
    if (fileType?.includes("audio")) return "fa-file-audio text-pink-500";
    if (fileType?.includes("image")) return "fa-file-image text-blue-500";
    if (fileType?.includes("pdf")) return "fa-file-pdf text-red-500";
    return "fa-file text-gray-500";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      Script: "bg-sky-100 text-ocean-600",
      Contract: "bg-red-100 text-red-700",
      "Preview Video": "bg-sky-100 text-ocean-600",
      "Master Video": "bg-emerald-100 text-emerald-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.Other;
  };

  const filteredAssets = assets.filter((asset) => {
    const matchSearch = asset.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" || asset.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // Count by category
  const categoryCount = {
    Script: assets.filter((a) => a.category === "Script").length,
    Contract: assets.filter((a) => a.category === "Contract").length,
    "Preview Video": assets.filter((a) => a.category === "Preview Video")
      .length,
    "Master Video": assets.filter((a) => a.category === "Master Video").length,
    Other: assets.filter((a) => a.category === "Other").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-600 mb-4"></i>
          <p className="text-gray-500">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Files 📁
              </h1>
              <p className="text-orange-100">
                Download scripts, previews, and master files
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-folder text-white/70"></i>
                <p className="text-white/70 text-xs font-semibold uppercase">
                  Total
                </p>
              </div>
              <p className="text-2xl font-bold text-white">{assets.length}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-file-lines text-ocean-300"></i>
                <p className="text-white/70 text-xs font-semibold uppercase">
                  Scripts
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {categoryCount.Script}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-video text-ocean-300"></i>
                <p className="text-white/70 text-xs font-semibold uppercase">
                  Previews
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {categoryCount["Preview Video"]}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-film text-emerald-300"></i>
                <p className="text-white/70 text-xs font-semibold uppercase">
                  Masters
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {categoryCount["Master Video"]}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-file-contract text-red-300"></i>
                <p className="text-white/70 text-xs font-semibold uppercase">
                  Contracts
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {categoryCount.Contract}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                placeholder="Cari file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
              />
            </div>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
          >
            <option value="all">Semua Kategori</option>
            <option value="Script">Script</option>
            <option value="Contract">Contract</option>
            <option value="Preview Video">Preview Video</option>
            <option value="Master Video">Master Video</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Files List */}
      {filteredAssets.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">File</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Size</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <i
                            className={`fa-solid ${getFileIcon(asset.file_type)} text-lg`}
                          ></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition line-clamp-1">
                            {asset.file_name}
                          </p>
                          {asset.episode && (
                            <p className="text-xs text-gray-500">
                              Episode {asset.episode.episode_number}:{" "}
                              {asset.episode.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/broadcaster/projects/${asset.project?.id}`}
                        className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                      >
                        {asset.project?.title || "Unknown Project"}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(asset.category)}`}
                      >
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatFileSize(asset.file_size)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDownloadFile(asset.id, asset.file_name)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold text-sm transition"
                      >
                        <i className="fa-solid fa-download"></i>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tidak Ada File
            </h3>
            <p className="text-gray-500">
              {filterCategory === "all"
                ? "Belum ada file yang di-share untuk Anda"
                : `Tidak ada file dengan kategori ${filterCategory}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
