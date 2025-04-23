import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";

const ViewProduct = () => {
  const { register } = useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("products/products/");
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditedData({ name: product.name, unit_cost: product.unit_cost });
  };

  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`products/products/${id}/`, editedData);
      fetchProducts();
      setEditingProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      alert("Failed to update product. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditedData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`products/products/${id}/`);
        setProducts(products.filter((product) => product.id !== id));
        alert("Product deleted successfully!");
      } catch (error) {
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl py-6">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Products
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">ID</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Name</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Unit Cost
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-500 hover:bg-gray-100"
                >
                  <td className="p-4 align-middle">{product.id}</td>
                  <td className="p-4 align-middle">
                    {editingProduct === product.id ? (
                      <FormField
                        label="Edit Product Name"
                        name={`name-${product.id}`}
                        type="text"
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingProduct === product.id ? (
                      <FormField
                        label="Edit Unit Cost"
                        name={`unit_cost-${product.id}`}
                        type="number"
                        value={editedData.unit_cost}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            unit_cost: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      product.unit_cost
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingProduct === product.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(product.id)}
                            className="flex items-center gap-1 bg-green-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            <Check size={16} /> Update
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 bg-gray-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1 bg-red-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewProduct;