import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const AddProduct = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await apiClient.post("products/products/", {
        name: data.productName,
        unit_cost: data.unitCost,
      });
      alert("Product added successfully!");
      navigate("/products/view");
    } catch (error) {
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          width: "100%",
          maxWidth: "500px",
          padding: "2rem",
        }}
      >
        <h2
          className="text-xl font-extrabold text-center text-gray-800 pb-6"
        >
          Add Product
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <FormField
            label="Product Name"
            placeholder="Enter product name..."
            name="productName"
            register={register}
            error={errors.productName}
          />

          <FormField
            label="Unit Cost"
            placeholder="Enter unit cost..."
            name="unitCost"
            register={register}
            type="number"
            error={errors.unitCost}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#181818",
              color: "#f0f0f0",
              fontSize: "0.875rem",
              fontWeight: "bold",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #181818",
              cursor: "pointer",
              transition: "all 0.3s",
              marginTop: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
              e.currentTarget.style.color = "#181818";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#181818";
              e.currentTarget.style.color = "#f0f0f0";
            }}
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;