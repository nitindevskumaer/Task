import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import logo from './images.png';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    status: "Active",
    price: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "All" || product.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [products, searchQuery, filterStatus]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleEdit = async (id) => {
    const productToEdit = products.find((p) => p.id === id);
    if (productToEdit) {
      setNewProduct({
        name: productToEdit.name,
        category: productToEdit.category,
        status: productToEdit.status,
        price: productToEdit.price,
      });
      setEditProductId(id);
      setIsModalOpen(true);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
      };
  
      if (editProductId) {
        await axios.put(`http://localhost:4000/products/${editProductId}`, productData);
      } else {
        await axios.post("http://localhost:4000/products", productData);
      }
  
      // Refresh and reset form
      fetchProducts();
      setNewProduct({ name: "", category: "", status: "Active", price: "" });
      setEditProductId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const handleModalInput = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  return (
    <div className="flex min-h-screen bg-[#f5f8ff] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white p-6 flex flex-col border-r">
        <div className="text-2xl font-bold text-blue-600 mb-10">animoox</div>
        <nav className="flex flex-col gap-4 text-sm">
          <span className="font-semibold text-gray-800">Product Management</span>
        </nav>

        <div className="mt-auto">
          <div className="bg-[#eef4ff] p-4 rounded-lg mt-10 text-center">
            <p className="text-sm font-semibold mb-2">Up Your Product Now</p>
            <p className="text-xs text-gray-500 mb-4">Get 1 month free and unlock</p>
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full">Upload Now</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-1.5 rounded-lg text-sm"
            />
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-3 py-1.5 rounded-lg text-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
            >
              + New Product
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl p-4 shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">Product Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Status</th>
                <th className="py-2">Price</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 flex items-center gap-2">
                    <img className="w-10 h-10 bg-gray-200 rounded" src={logo} />
                    <span>{product.name}</span>
                  </td>
                  <td className="py-3">{product.category}</td>
                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : product.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3">${product.price}</td>
                  <td className="py-3">
                    <button onClick={() => handleEdit(product.id)} className="text-gray-500">✏️</button>
                    <button onClick={() => handleDelete(product.id)} className="text-gray-500">🗑️</button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Product</h2>
            <div className="space-y-3">
              <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleModalInput} className="w-full border px-3 py-2 rounded" />
              <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleModalInput} className="w-full border px-3 py-2 rounded" />
              <select name="status" value={newProduct.status} onChange={handleModalInput} className="w-full border px-3 py-2 rounded">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleModalInput} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleSaveProduct} className="px-4 py-2 bg-blue-600 text-white rounded-md">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
