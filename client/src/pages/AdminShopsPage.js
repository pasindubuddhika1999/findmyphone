import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AdminShopsPage = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("pending"); // 'all', 'pending', 'approved'

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (filter === "pending") {
        params.isApproved = false;
      } else if (filter === "approved") {
        params.isApproved = true;
      }

      const response = await api.getShops(params);
      setShops(response.data.shops);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch shops");
      toast.error("Failed to load shops");
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleApprove = async (id) => {
    try {
      await api.approveShop(id);
      toast.success("Shop approved successfully");
      fetchShops();
    } catch (err) {
      toast.error("Failed to approve shop");
    }
  };

  const handleReject = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to reject this shop? This action cannot be undone."
      )
    ) {
      try {
        await api.rejectShop(id);
        toast.success("Shop rejected successfully");
        fetchShops();
      } catch (err) {
        toast.error("Failed to reject shop");
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this shop? This action cannot be undone."
      )
    ) {
      try {
        await api.deleteShop(id);
        toast.success("Shop deleted successfully");
        fetchShops();
      } catch (err) {
        toast.error("Failed to delete shop");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">
            You do not have permission to access this page.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Shops</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded ${
              filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded ${
              filter === "approved" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner"></div>
          <p>Loading shops...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          <p>No shops found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Shop Name</th>
                <th className="py-2 px-4 border-b text-left">Owner</th>
                <th className="py-2 px-4 border-b text-left">Location</th>
                <th className="py-2 px-4 border-b text-left">Contact</th>
                <th className="py-2 px-4 border-b text-left">Registered</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{shop.shopName}</td>
                  <td className="py-2 px-4 border-b">{shop.ownerName}</td>
                  <td className="py-2 px-4 border-b">{shop.location}</td>
                  <td className="py-2 px-4 border-b">{shop.contactNumber}</td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(shop.createdAt)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {shop.isApproved ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/shops/${shop._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      {!shop.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(shop._id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(shop._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="px-4 py-1 border-t border-b border-gray-300 bg-white">
              {currentPage} of {totalPages}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminShopsPage;
