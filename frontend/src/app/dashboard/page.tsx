'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { shopApi, productApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import ProductForm from '@/components/ProductForm';
import ProductTable from '@/components/ProductTable';

const deliveryOptionLabels: Record<string, string> = {
  NO_DELIVERY: 'No Delivery Service',
  IN_HOUSE_DRIVER: 'In-house Delivery Driver',
  THIRD_PARTY_PARTNER: '3rd Party Delivery Partner',
};

const formatCoordinate = (value?: number) => {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  return value.toFixed(6);
};

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadShops();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedShop) {
      loadProducts(selectedShop.id);
    }
  }, [selectedShop]);

  const loadShops = async () => {
    try {
      const response = await shopApi.getMyShops();
      setShops(response.data);
      if (response.data.length > 0) {
        setSelectedShop(response.data[0]);
      }
    } catch (err: any) {
      setError('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (shopId: number) => {
    try {
      const response = await productApi.getByShop(shopId);
      setProducts(response.data);
    } catch (err: any) {
      setError('Failed to load products');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productApi.delete(id);
      if (selectedShop) {
        loadProducts(selectedShop.id);
      }
    } catch (err: any) {
      setError('Failed to delete product');
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    if (selectedShop) {
      loadProducts(selectedShop.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="container">Loading shops...</div>;
  }

  if (shops.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Shops Found</h1>
          <p>You need to register a shop first.</p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/register-shop')}
            style={{ marginTop: '16px' }}
          >
            Register Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>My Shops</h2>
        <div style={{ marginBottom: '16px' }}>
          {shops.map((shop) => (
            <button
              key={shop.id}
              className="btn"
              onClick={() => setSelectedShop(shop)}
              style={{
                marginRight: '8px',
                marginBottom: '8px',
                backgroundColor: selectedShop?.id === shop.id ? '#007bff' : '#6c757d',
                color: 'white',
              }}
            >
              {shop.name}
            </button>
          ))}
          <button
            className="btn btn-primary"
            onClick={() => router.push('/register-shop')}
            style={{ marginLeft: '8px' }}
          >
            + Add Shop
          </button>
          <button
            className="btn btn-danger"
            onClick={() => router.push('/delete-shops')}
            style={{ marginLeft: '8px' }}
          >
            Remove Shop
          </button>
        </div>

        {selectedShop && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Shop Details</h3>
            <p><strong>Name:</strong> {selectedShop.name}</p>
            <p><strong>Address:</strong> {selectedShop.address}</p>
            <p><strong>Phone:</strong> {selectedShop.phone}</p>
            <p><strong>Open Hours:</strong> {selectedShop.openHours}</p>
            <p>
              <strong>Delivery Option:</strong>{' '}
              {deliveryOptionLabels[selectedShop.deliveryOption] || selectedShop.deliveryOption}
            </p>
            <p>
              <strong>Location:</strong> Lat {formatCoordinate(selectedShop.latitude)}, Lng{' '}
              {formatCoordinate(selectedShop.longitude)}
            </p>
          </div>
        )}
      </div>

      {selectedShop && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Products</h2>
            <button className="btn btn-primary" onClick={handleAddProduct}>
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <ProductForm
              shopId={selectedShop.id}
              product={editingProduct}
              onSave={handleProductSaved}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          )}

          <ProductTable
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>
      )}
    </div>
  );
}

