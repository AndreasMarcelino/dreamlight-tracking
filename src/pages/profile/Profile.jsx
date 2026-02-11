import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      await authService.updateProfile(data);
      if (refreshUser) await refreshUser();
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    const result = await Swal.fire({
      title: "Ganti Password?",
      text: "Pastikan Anda mengingat password baru Anda",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2872A1",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Ya, Ganti",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await authService.updatePassword(data.currentPassword, data.newPassword);
      toast.success("Password berhasil diubah!");
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      producer: "bg-ocean-100 text-ocean-600",
      crew: "bg-emerald-100 text-emerald-700",
      broadcaster: "bg-amber-100 text-amber-700",
      investor: "bg-cyan-100 text-cyan-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: "fa-user" },
    { id: "security", label: "Keamanan", icon: "fa-shield-halved" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "security") {
      resetPassword();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ocean-500 via-ocean-600 to-ocean-700 rounded-3xl p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=ffffff&color=2872A1&size=128&bold=true`}
                alt="Avatar"
                className="w-28 h-28 rounded-2xl border-4 border-white/30 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                <i className="fa-solid fa-check text-white text-xs"></i>
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {user?.name || "Guest"}
              </h1>
              <p className="text-sky-100 mb-3">{user?.email}</p>
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold capitalize ${getRoleColor(user?.role)}`}
              >
                <i className="fa-solid fa-user-tag"></i>
                {user?.role || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-ocean-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-200"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        key={activeTab}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {activeTab === "profile" ? (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-user-pen text-ocean-500 text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Informasi Profil
                </h2>
                <p className="text-sm text-gray-500">
                  Perbarui informasi akun Anda
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-regular fa-user"></i>
                  </span>
                  <input
                    type="text"
                    {...registerProfile("name", {
                      required: "Nama harus diisi",
                    })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                      profileErrors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-ocean-500"
                    } bg-gray-50 focus:bg-white focus:ring-4 focus:ring-ocean-100 outline-none transition`}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    {...registerProfile("email", {
                      required: "Email harus diisi",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Format email tidak valid",
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                      profileErrors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-ocean-500"
                    } bg-gray-50 focus:bg-white focus:ring-4 focus:ring-ocean-100 outline-none transition`}
                    placeholder="Masukkan email"
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              {/* Role (readonly) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-solid fa-user-tag"></i>
                  </span>
                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 capitalize cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Role hanya bisa diubah oleh Admin
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-ocean-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitPassword(onSubmitPassword)}
            className="p-8"
            autoComplete="off"
          >
            {/* Hidden dummy inputs to prevent browser autofill */}
            <input
              type="text"
              name="prevent_autofill"
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="prevent_autofill_pass"
              style={{ display: "none" }}
            />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-lock text-amber-600 text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Ganti Password
                </h2>
                <p className="text-sm text-gray-500">
                  Pastikan menggunakan password yang kuat
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-solid fa-key"></i>
                  </span>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerPassword("currentPassword", {
                      required: "Password saat ini harus diisi",
                    })}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                      passwordErrors.currentPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-ocean-500"
                    } bg-gray-50 focus:bg-white focus:ring-4 focus:ring-ocean-100 outline-none transition`}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-ocean-500 transition"
                  >
                    <i
                      className={`fa-solid ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerPassword("newPassword", {
                      required: "Password baru harus diisi",
                      minLength: {
                        value: 6,
                        message: "Password minimal 6 karakter",
                      },
                    })}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                      passwordErrors.newPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-ocean-500"
                    } bg-gray-50 focus:bg-white focus:ring-4 focus:ring-ocean-100 outline-none transition`}
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-ocean-500 transition"
                  >
                    <i
                      className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerPassword("confirmPassword", {
                      required: "Konfirmasi password harus diisi",
                      validate: (value) =>
                        value === newPassword || "Password tidak sama",
                    })}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                      passwordErrors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-ocean-500"
                    } bg-gray-50 focus:bg-white focus:ring-4 focus:ring-ocean-100 outline-none transition`}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-ocean-500 transition"
                  >
                    <i
                      className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      Tips Password Kuat
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Minimal 6 karakter</li>
                      <li>• Kombinasi huruf besar dan kecil</li>
                      <li>• Gunakan angka dan karakter khusus</li>
                      <li>• Hindari menggunakan informasi pribadi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key"></i>
                    Ganti Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
