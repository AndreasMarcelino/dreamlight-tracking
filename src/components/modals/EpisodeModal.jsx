import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function EpisodeModal({ isOpen, onClose, onSuccess, projectId, episode = null }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: episode || {
      title: '',
      episode_number: '',
      status: 'Scripting',
      synopsis: '',
      airing_date: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        project_id: projectId,
        title: data.title,
        episode_number: parseInt(data.episode_number),
        status: data.status,
        synopsis: data.synopsis || null,
        airing_date: data.airing_date || null
      };

      if (episode) {
        await fetch(`${import.meta.env.VITE_API_URL}/episodes/${episode.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        toast.success('Episode updated!');
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/episodes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        toast.success('Episode created!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save episode');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-film text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {episode ? 'Edit Episode' : 'Add New Episode'}
                </h2>
                <p className="text-orange-100 text-sm">Series Episode Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Episode Number & Title */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Episode # <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('episode_number', { 
                  required: 'Required',
                  min: { value: 1, message: 'Min 1' }
                })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.episode_number ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                } focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition text-center font-bold text-lg`}
                placeholder="1"
              />
              {errors.episode_number && (
                <p className="mt-1 text-xs text-red-600">{errors.episode_number.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Episode Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: 'Required' })}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                } focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition`}
                placeholder="The Beginning"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
            >
              <option value="Scripting">📝 Scripting</option>
              <option value="Filming">🎬 Filming</option>
              <option value="Editing">✂️ Editing</option>
              <option value="Preview Ready">👁️ Preview Ready</option>
              <option value="Master Ready">✅ Master Ready</option>
            </select>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Synopsis
            </label>
            <textarea
              {...register('synopsis')}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition resize-none"
              placeholder="Brief description..."
            ></textarea>
          </div>

          {/* Airing Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Airing Date
            </label>
            <input
              type="date"
              {...register('airing_date')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Saving...
              </span>
            ) : (
              <span>{episode ? 'Update' : 'Create'} Episode</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}