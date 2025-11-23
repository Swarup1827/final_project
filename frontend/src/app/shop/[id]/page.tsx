'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { shopApi, productApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import ProductForm from '@/components/ProductForm';

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

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params?.id ? Number(params.id) : null;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && shopId) {
      loadShopDetails();
      loadProducts();
    }
  }, [isAuthenticated, shopId]);

  const loadShopDetails = async () => {
    if (!shopId) return;
    
    try {
      const response = await shopApi.getShop(shopId);
      setShop(response.data);
    } catch (err: any) {
      setError('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!shopId) return;
    
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
      loadProducts();
    } catch (err: any) {
      setError('Failed to delete product');
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="container">Loading shop details...</div>;
  }

  if (!shop) {
    return (
      <div className="container">
        <div className="card">
          <h1>Shop Not Found</h1>
          <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>{shop.name}</h1>
        <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Shop Information</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <p><strong>Address:</strong> {shop.address}</p>
          <p><strong>Phone:</strong> {shop.phone}</p>
          <p><strong>Open Hours:</strong> {shop.openHours}</p>
          <p>
            <strong>Delivery Option:</strong>{' '}
            {deliveryOptionLabels[shop.deliveryOption] || shop.deliveryOption}
          </p>
          <p>
            <strong>Location:</strong> Lat {formatCoordinate(shop.latitude)}, Lng{' '}
            {formatCoordinate(shop.longitude)}
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Products ({products.length})</h2>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            + Add Product
          </button>
        </div>

        {showProductForm && (
          <ProductForm
            shopId={shop.id}
            product={editingProduct}
            onSave={handleProductSaved}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Product Search Bar */}
        {products.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#999'
              }}>
                🔍
              </span>
            </div>
            {searchQuery && (
              <p style={{ 
                marginTop: '6px', 
                fontSize: '13px', 
                color: '#666' 
              }}>
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        )}

        {/* Products Table */}
        {products.length === 0 ? (
          <p>No products found. Add your first product!</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#666' }}>
              No products found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description || '-'}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category || '-'}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditProduct(product)}
                      style={{ marginRight: '8px', padding: '6px 12px', fontSize: '14px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}