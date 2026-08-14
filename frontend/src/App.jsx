import React, { useState, useEffect } from 'react';

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState({ name: '', table: '' });

  // Use relative path: Nginx reverse-proxies /api to backend
  const fetchData = async () => {
    try {
      const [menuRes, ordersRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/orders')
      ]);
      setMenu(await menuRes.json());
      setOrders(await ordersRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert('Your cart is empty!');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        tableNumber: Number(customer.table),
        items: cart
      })
    });

    if (res.ok) {
      setCart([]);
      setCustomer({ name: '', table: '' });
      fetchData();
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container">
      <header>
        <h1>🍽️ AWS Cloud 3-Tier Bistro</h1>
        <p style={{ color: 'var(--muted)' }}>React (Tier 1) + Node.js (Tier 2) + MongoDB (Tier 3)</p>
      </header>

      <div className="grid">
        {/* Left Column: Menu & Active Orders */}
        <div>
          <h2>Menu</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {menu.map(item => (
              <div key={item._id} className="card">
                <h3>{item.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.5rem 0' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>${item.price.toFixed(2)}</strong>
                  <button className="btn" onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '2rem' }}>Kitchen Dashboard</h2>
          <div style={{ marginTop: '1rem' }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>Table {order.tableNumber} - {order.customerName}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                  <span className="badge" style={{ marginTop: '0.5rem' }}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Preparing', 'Ready', 'Delivered'].map(st => (
                    <button key={st} className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => updateStatus(order._id, st)}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Cart */}
        <div>
          <div className="card">
            <h2>Your Order</h2>
            {cart.length === 0 ? <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Cart is empty</p> : (
              <div>
                <div style={{ margin: '1rem 0' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />
                <h3>Total: ${total.toFixed(2)}</h3>

                <form onSubmit={placeOrder} style={{ marginTop: '1rem' }}>
                  <label>Customer Name</label>
                  <input required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                  <label>Table Number</label>
                  <input required type="number" value={customer.table} onChange={e => setCustomer({ ...customer, table: e.target.value })} />
                  <button className="btn" style={{ width: '100%', padding: '0.8rem' }} type="submit">Submit Order</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

