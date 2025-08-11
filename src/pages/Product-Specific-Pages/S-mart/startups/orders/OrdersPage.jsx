import React from 'react';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  // Sample order data
  const orders = [
    {
      id: 'ORD-78945',
      date: '2025-08-15',
      status: 'Completed',
      total: '$249.99',
      items: [
        { name: 'Startup Analytics Pro', quantity: 1 },
        { name: 'Market Research Package', quantity: 1 }
      ]
    },
    {
      id: 'ORD-78123',
      date: '2025-08-10',
      status: 'Processing',
      total: '$99.99',
      items: [
        { name: 'Basic Consulting', quantity: 2 }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Orders</h1>
        <Link 
          to="/smart/startups" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Items</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-12 p-4 border-b border-gray-200 hover:bg-gray-50">
            <div className="col-span-3 font-medium text-indigo-600">
              <Link to={`/smart/orders/${order.id}`}>{order.id}</Link>
            </div>
            <div className="col-span-2 text-gray-600">{order.date}</div>
            <div className="col-span-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.status === 'Completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="col-span-3">
              {order.items.map((item, i) => (
                <div key={i} className="text-sm text-gray-600">
                  {item.quantity} × {item.name}
                </div>
              ))}
            </div>
            <div className="col-span-2 text-right font-medium">{order.total}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-gray-500">Your purchase history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;