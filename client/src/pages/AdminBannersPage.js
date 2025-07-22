import React, { useState, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "Learn More",
    buttonLink: "/",
    isActive: true,
    order: 0,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth token
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all banners (including inactive)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/banners/admin", {
          headers: getAuthHeader(),
        });
        setBanners(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners. Please try again later.");
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await api.uploadFormData("/api/upload/single", formData);
      setUploadingImage(false);
      return response.data.image.url;
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
      setUploadingImage(false);
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "Learn More",
      buttonLink: "/",
      isActive: true,
      order: 0,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (selectedImage) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsSubmitting(false);
          return; // Stop if image upload failed
        }
      }

      const bannerData = {
        ...formData,
        imageUrl,
      };

      if (editingId) {
        // Update existing banner
        await api.put(`/api/banners/admin/${editingId}`, bannerData, {
          headers: getAuthHeader(),
        });
      } else {
        // Create new banner
        await api.post("/api/banners/admin", bannerData, {
          headers: getAuthHeader(),
        });
      }

      // Refresh banner list
      const response = await api.get("/api/banners/admin", {
        headers: getAuthHeader(),
      });
      setBanners(response.data);

      // Reset form
      resetForm();
    } catch (err) {
      console.error("Error saving banner:", err);
      setError("Failed to save banner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      isActive: banner.isActive,
      order: banner.order,
    });
    setImagePreview(banner.imageUrl);
    setEditingId(banner._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await api.delete(`/api/banners/admin/${id}`, {
        headers: getAuthHeader(),
      });

      // Refresh banner list
      const response = await api.get("/api/banners/admin", {
        headers: getAuthHeader(),
      });
      setBanners(response.data);
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError("Failed to delete banner. Please try again.");
    }
  };

  const handleReorder = async (id, direction) => {
    const bannerIndex = banners.findIndex((banner) => banner._id === id);
    if (bannerIndex === -1) return;

    const banner = banners[bannerIndex];
    const newOrder = direction === "up" ? banner.order - 1 : banner.order + 1;

    try {
      await api.put(
        `/api/banners/admin/${id}`,
        { order: newOrder },
        {
          headers: getAuthHeader(),
        }
      );

      // Refresh banner list
      const response = await api.get("/api/banners/admin", {
        headers: getAuthHeader(),
      });
      setBanners(response.data);
    } catch (err) {
      console.error("Error reordering banner:", err);
      setError("Failed to reorder banner. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Banner Management</h1>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Banner Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Banner" : "Add New Banner"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="subtitle"
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Banner Image*
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-2">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="h-32 w-full object-cover rounded border"
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div className="flex items-center">
                  <label className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 mr-2">
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    {selectedImage ? selectedImage.name : "No file selected"}
                  </span>
                </div>

                {/* Image URL (Alternative) */}
                <div className="mt-2">
                  <label
                    className="block text-gray-700 text-sm mb-2"
                    htmlFor="imageUrl"
                  >
                    Or enter image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {!selectedImage && !formData.imageUrl && (
                  <p className="text-red-500 text-xs italic mt-1">
                    Please upload an image or provide an image URL
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="buttonText"
                >
                  Button Text
                </label>
                <input
                  type="text"
                  id="buttonText"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="buttonLink"
                >
                  Button Link
                </label>
                <input
                  type="text"
                  id="buttonLink"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="order"
                >
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">
                    Active
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={
                    isSubmitting ||
                    uploadingImage ||
                    (!selectedImage && !formData.imageUrl)
                  }
                >
                  {isSubmitting || uploadingImage
                    ? "Saving..."
                    : editingId
                    ? "Update Banner"
                    : "Add Banner"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Banner List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">
              Banner Slides
            </h2>

            {loading ? (
              <div className="p-6 text-center">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No banners found. Add your first banner!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Image
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banners.map((banner) => (
                      <tr key={banner._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-16 w-24 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/logo.png";
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {banner.title}
                          </div>
                          {banner.subtitle && (
                            <div className="text-sm text-gray-500">
                              {banner.subtitle}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {banner.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              banner.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReorder(banner._id, "up")}
                              className="text-gray-600 hover:text-gray-900"
                              title="Move up"
                            >
                              <ArrowUpIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReorder(banner._id, "down")}
                              className="text-gray-600 hover:text-gray-900"
                              title="Move down"
                            >
                              <ArrowDownIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(banner._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBannersPage;
