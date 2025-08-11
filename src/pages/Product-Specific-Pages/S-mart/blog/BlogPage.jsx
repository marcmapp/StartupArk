import React from 'react';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const articles = [
    {
      id: 1,
      title: '10 Growth Strategies for Early-Stage Startups',
      excerpt: 'Learn proven tactics to scale your startup in the first 12 months',
      date: 'August 10, 2025',
      author: 'Jane Cooper',
      category: 'Growth',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Fundraising in 2025: What Investors Look For',
      excerpt: 'The changing landscape of startup funding and how to prepare',
      date: 'July 28, 2025',
      author: 'Alex Morgan',
      category: 'Funding',
      readTime: '8 min read'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Startup Blog</h1>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Categories</option>
            <option>Growth</option>
            <option>Funding</option>
            <option>Product</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                <Link to={`/smart/blog/${article.id}`} className="hover:text-indigo-600">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{article.date}</span>
                <span className="text-sm font-medium">{article.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No articles yet</h3>
          <p className="mt-1 text-gray-500">Check back later for new content</p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;