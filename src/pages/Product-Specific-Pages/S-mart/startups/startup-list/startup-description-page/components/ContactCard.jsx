const ContactCard = ({ email, phone, website }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
      <div className="space-y-3">
        {email && (
          <div className="flex items-start">
            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${email}`} className="ml-3 text-sm text-gray-700 hover:text-indigo-600 break-all">
              {email}
            </a>
          </div>
        )}
        
        {phone && (
          <div className="flex items-start">
            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${phone}`} className="ml-3 text-sm text-gray-700 hover:text-indigo-600">
              {phone}
            </a>
          </div>
        )}
        
        {website && (
          <div className="flex items-start">
            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <a href={website} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm text-gray-700 hover:text-indigo-600 break-all">
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;