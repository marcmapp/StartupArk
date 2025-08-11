import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaBuilding, FaBriefcase, FaUser } from 'react-icons/fa';
import axios from 'axios';
type UserType = 'freelancer' | 'startups' | 'business' | 'individual';

const DynamicForm: React.FC = () => {
  const navigate = useNavigate();
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [upiId, setUpiId] = useState('');
  const [fundingDetails, setFundingDetails] = useState('');
  const [taxDetails, setTaxDetails] = useState('');
  const [tanNumber, setTanNumber] = useState('');
  const [registrationCert, setRegistrationCert] = useState<File | null>(null);
  const [ipDetails, setIpDetails] = useState('');
    const [url, setUrl] = useState('');
  const [isUrlEntered, setIsUrlEntered] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [occupation, setOccupation] = useState('');
  
  const [serviceAgreement, setServiceAgreement] = useState(false);
  const [serviceDetails, setServiceDetails] = useState('');
  const [willDetails, setWillDetails] = useState('');
  const [purpose, setPurpose] = useState('');
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | ''>('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [submittedData, setSubmittedData] = useState(null);
  const [formData, setFormData] = useState({
    freelancer: {
        fullName: '', aadhaar: '', pan: '', gstin: '', businessName: '', dba: '',
        email: '', phone: '', altPhone: '', businessAddress: '', billingAddress: '',
        services: [] as string[], customService: '', portfolio: [] as string[], terms: '',
        hourlyRate: '', projectRate: '', availability: '', paymentMethod: 'netbanking', bankName: '',
        accountNumber: '', ifsc: '', upi: ''
      },
      startups: {
        startupName: '', incorporationDate: '', entityType: '', businessRegNo: '',
        businessType: '', pan: '', gstin: '', founderName: '', founderEmail: '',
        founderPhone: '', founderAltPhone: '', founderAddress: ''
      },
      business: {
        businessName: '', incorporationDate: '', entityType: '', businessRegNumber: '', businessType: '', businessPAN: '',
        gstin: '', founderName: '', founderEmail: '', founderPhone: '', founderAltPhone: '', founderAddress: '',
        services: '', employees: '', fundingDetails: '', incomeTaxDetails: '', tan: '', registrationCertificates: '', ipTrademarks: ''
      },
      individual: {
        fullName: '', aadhaar: '', pan: '', gstin: '', email: '', phone: '', altPhone: '', address: '',
        paymentMethod: '', docPurpose: '', docTypes: '', occupation: '', incomeTaxDetails: '', serviceAgreements: '', wills: ''
      }
  });
  // List of required fields (customizable)
  const requiredFields = {
    freelancer: ['fullName', 'email', 'phone'],
    startups: ['startupName', 'founderEmail', 'founderPhone'],
    business: ['businessName', 'founderEmail'],
    individual: ['fullName', 'email', 'phone']
  };
  const [rateType, setRateType] = useState<'hourly' | 'project'>('hourly');
  const [paymentMethod, setPaymentMethod] = useState<'netbanking' | 'upi'>('netbanking');
  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => {
      // Avoid full re-render by updating only the necessary part of the formData.
      const newData = { ...prevData };
      newData[userType!][field] = value;
      return newData;
    });
  };
  const validateFields = () => {
    return requiredFields[userType!].every(
      field => formData[userType!][field]?.trim() !== ''
    );
  };
  const handleSubmit = async () => {
    if (validateFields()) {
        const filteredData = { [userType!]: formData[userType!] };

        try {
            // Send form data to the backend
            await axios.post(`${baseUrl}/api/mdoc/save-form`, { formData: filteredData }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Assuming token is in localStorage
            });

           
        } catch (error) {
            console.error("Error saving form data:", error);
            alert("Failed to save form data. Please try again.");
        }
    } else {
        alert('Please fill in all required fields.');
    }
};
  const handleServiceSelect = (service: string) => {
    setFormData((prevData) => {
      const services = prevData.freelancer.services.includes(service)
        ? prevData.freelancer.services.filter((s) => s !== service)
        : [...prevData.freelancer.services, service];
      return { ...prevData, freelancer: { ...prevData.freelancer, services } };
    });
  };

  const handlePortfolioAdd = (url: string) => {
    if (url.trim() === '') return;
    setFormData((prevData) => ({
      ...prevData,
      freelancer: { ...prevData.freelancer, portfolio: [...prevData.freelancer.portfolio, url] }
    }));
  };
  const serviceOptions = ['Web Development', 'Mobile App', 'Consulting', 'Marketing', 'Other'];
  const documentOptions = [
    'Birth Certificate', 
    'Passport', 
    'Tax Returns', 
    'Bank Statements', 
    'Others'
  ];
  const handleDocumentSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(event.target.selectedOptions, (option) => option.value);
    setDocumentTypes(options);
  };
  // Handlers
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsUrlEntered(value.length > 0);
  };

  const handleServiceChange = (selectedService: string) => {
    if (!services.includes(selectedService) && selectedService !== 'Other') {
      setServices([...services, selectedService]);
    }
  };

  const handleCustomServiceAdd = () => {
    if (customService.trim() && !services.includes(customService)) {
      setServices([...services, customService]);
      setCustomService('');
    }
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setRegistrationCert(event.target.files[0]);
  };
  const TextInput: React.FC<{ label: string; field: string; placeholder?: string }> = ({ label, field, placeholder }) => {
  // Use local state to avoid re-renders after every character input
  const [localValue, setLocalValue] = useState((formData as any)[userType!][field] || '');

  const handleBlur = () => {
    // Update formData only when leaving the field
    handleInputChange(field, localValue);
  };

  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <input
        type="text"
        placeholder={placeholder || ''}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)} // Update local state on each keystroke
        onBlur={handleBlur} // Update global formData only when the input loses focus
        className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-200"
      />
    </div>
  );
};

  
  const DateInput: React.FC<{ label: string; field: string }> = ({ label, field }) => (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <input
        type="date"
        value={(formData as any)[userType!][field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-200"
      />
    </div>
  );
  const DropdownInput: React.FC<{ label: string; field: string; options: string[] }> = ({ label, field, options }) => (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        value={(formData as any)[userType!][field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-200"
      >
        <option value="" disabled>Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
  const renderFields = (formStep: number) => {
    if (!userType) return null;

    const fieldComponents = {
        2: [
            userType === 'freelancer' && <>
              <TextInput label="Full Name" field="fullName" />
                    <TextInput label="Aadhaar Number" field="aadhaar" />
                    <TextInput label="PAN Number" field="pan" />
                    <TextInput label="GSTIN" field="gstin" />
                    <TextInput label="Business Name" field="businessName" />
                    <TextInput label="Doing Business As" field="dba" />
                    <TextInput label="Email" field="email" />
                    <TextInput label="Phone" field="phone" />
                    <TextInput label="Alternative Phone" field="altPhone" />
                    <TextInput label="Business Address" field="businessAddress" />
                    <TextInput label="Billing Address" field="billingAddress" />
            </>,
            userType === 'startups' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Business Information</h3>
                  <TextInput label="Startup Name" field="startupName" />
                  <DateInput label="Date of Incorporation" field="incorporationDate" />
                  <TextInput label="Type of Entity" field="entityType" placeholder="e.g., Private Limited, LLP, etc." />
                  <TextInput label="Business Registration Number" field="businessRegNo" />
                  <DropdownInput
                    label="Type of Business"
                    field="businessType"
                    options={['E-commerce', 'Technology', 'Healthcare', 'Finance', 'Other']}
                  />
                  <TextInput label="PAN Number of the Business" field="pan" placeholder="PAN registered in startup’s name" />
                  <TextInput label="GSTIN (if applicable)" field="gstin" placeholder="Required for turnover > ₹20 lakh or inter-state operations" />
      
                  <h3 className="text-lg font-semibold text-gray-300 mb-2 mt-6">Founder Information</h3>
                  <TextInput label="Full Name" field="founderName" />
                  <TextInput label="Email" field="founderEmail" />
                  <TextInput label="Phone" field="founderPhone" />
                  <TextInput label="Alternative Phone" field="founderAltPhone" />
                  <TextInput label="Address" field="founderAddress" placeholder="Founder’s residential or business address" />
                </div>
              ),
            userType === 'business' && <>
              <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Business Information</h3>
                  <TextInput label="Startup Name" field="startupName" />
                  <DateInput label="Date of Incorporation" field="incorporationDate" />
                  <TextInput label="Type of Entity" field="entityType" placeholder="e.g., Private Limited, LLP, etc." />
                  <TextInput label="Business Registration Number" field="businessRegNo" />
                  <DropdownInput
                    label="Type of Business"
                    field="businessType"
                    options={['E-commerce', 'Technology', 'Healthcare', 'Finance', 'Other']}
                  />
                  <TextInput label="PAN Number of the Business" field="pan" placeholder="PAN registered in startup’s name" />
                  <TextInput label="GSTIN (if applicable)" field="gstin" placeholder="Required for turnover > ₹20 lakh or inter-state operations" />
      
                  <h3 className="text-lg font-semibold text-gray-300 mb-2 mt-6">Founder Information</h3>
                  <TextInput label="Full Name" field="founderName" />
                  <TextInput label="Email" field="founderEmail" />
                  <TextInput label="Phone" field="founderPhone" />
                  <TextInput label="Alternative Phone" field="founderAltPhone" />
                  <TextInput label="Address" field="founderAddress" placeholder="Founder’s residential or business address" />
                </div>
            </>,
            userType === 'individual' && <>
              <TextInput label="Full Name" field="fullName" />
                    <TextInput label="Aadhaar Number" field="aadhaar" />
                    <TextInput label="PAN Number" field="pan" />
                    <TextInput label="GSTIN" field="gstin" />
                    <TextInput label="Business Name" field="businessName" />
                    <TextInput label="Doing Business As" field="dba" />
                    <TextInput label="Email" field="email" />
                    <TextInput label="Phone" field="phone" />
                    <TextInput label="Alternative Phone" field="altPhone" />
                    <TextInput label="Business Address" field="businessAddress" />
                    <TextInput label="Billing Address" field="billingAddress" />
            </>
          ],
      3: [
        userType === 'freelancer' && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Services Offered</label>
                <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Services/Products Offered</label>
              <select
                onChange={(e) => handleServiceChange(e.target.value)}
                value=""
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>Select a service/product</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
      
              {/* Display selected services */}
              <div className="mt-4 space-y-2">
                {services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-600 text-white text-sm py-1 px-3 rounded-full shadow-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
      
              {/* Additional Service Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Add a custom service"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleCustomServiceAdd}
                  className="mt-2 py-2 px-4 bg-green-600 rounded-md text-white font-semibold hover:bg-green-500 transition duration-200"
                >
                  Add Service
                </button>
              </div>
            </div>
                
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sample Work URLs</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Enter URL and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePortfolioAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none"
                  />
                </div>
                <div className="mt-2">
                  {formData.freelancer.portfolio.map((url, index) => (
                    <div key={index} className="text-sm text-green-400">
                      - {url}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Terms and Conditions</label>
              <textarea
                value={formData.freelancer.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                className="w-full h-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none"
              />
            </div>
          </div>
        ),
        userType === 'startups' && (
            <>
                       
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
              <input
                type="text"
                placeholder="Enter your startup's website URL"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none transition ease-in-out duration-200
                  ${isUrlEntered ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-600'}`}
              />
              {isUrlEntered && (
                <p className="text-green-500 mt-2 animate-pulse">Your website is live! 🌟</p>
              )}
            </div>
      
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Services/Products Offered</label>
              <select
                onChange={(e) => handleServiceChange(e.target.value)}
                value=""
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>Select a service/product</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
      
              {/* Display selected services */}
              <div className="mt-4 space-y-2">
                {services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-600 text-white text-sm py-1 px-3 rounded-full shadow-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
      
              {/* Additional Service Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Add a custom service"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleCustomServiceAdd}
                  className="mt-2 py-2 px-4 bg-green-600 rounded-md text-white font-semibold hover:bg-green-500 transition duration-200"
                >
                  Add Service
                </button>
              </div>
            </div>
      
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Employees</label>
              <input
                type="number"
                placeholder="Enter the number of employees"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-200"
              />
            </div>
            </>

        ),
        userType === 'business' && <>
         <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
              <input
                type="text"
                placeholder="Enter your startup's website URL"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none transition ease-in-out duration-200
                  ${isUrlEntered ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-600'}`}
              />
              {isUrlEntered && (
                <p className="text-green-500 mt-2 animate-pulse">Your website is live! 🌟</p>
              )}
            </div>
      
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Services/Products Offered</label>
              <select
                onChange={(e) => handleServiceChange(e.target.value)}
                value=""
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>Select a service/product</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
      
              {/* Display selected services */}
              <div className="mt-4 space-y-2">
                {services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-600 text-white text-sm py-1 px-3 rounded-full shadow-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
      
              {/* Additional Service Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Add a custom service"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleCustomServiceAdd}
                  className="mt-2 py-2 px-4 bg-green-600 rounded-md text-white font-semibold hover:bg-green-500 transition duration-200"
                >
                  Add Service
                </button>
              </div>
            </div>
      
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Employees</label>
              <input
                type="number"
                placeholder="Enter the number of employees"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-200"
              />
            </div>
        </>,
        userType === 'individual' && <>
          <h2 className="text-2xl font-semibold mb-6">MDOC Access - Form Step 3</h2>

{/* Purpose of Accessing MDOC */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">Purpose of Accessing MDOC</label>
  <input
    type="text"
    placeholder="Describe the purpose of accessing MDOC"
    value={purpose}
    onChange={(e) => setPurpose(e.target.value)}
    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
  />
</div>

{/* Documents Required */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">Documents Required</label>
  <select
    multiple
    value={documentTypes}
    onChange={handleDocumentSelect}
    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    {documentOptions.map((doc) => (
      <option key={doc} value={doc} className="text-gray-700 bg-gray-300">
        {doc}
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-400 mt-2">* Hold down Ctrl (Windows) or Command (Mac) to select multiple options.</p>
</div>

{/* Occupation/Profession */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">Occupation/Profession</label>
  <input
    type="text"
    placeholder="Enter current employment status or profession"
    value={occupation}
    onChange={(e) => setOccupation(e.target.value)}
    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
  />
</div>

{/* Income Tax Details */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">Income Tax Details</label>
  <textarea
    placeholder="Provide tax details (if applicable)"
    value={taxDetails}
    onChange={(e) => setTaxDetails(e.target.value)}
    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
    rows={3}
  />
</div>

{/* Service Agreements */}
<div className="mb-6">
  <label className="inline-flex items-center text-sm font-medium text-gray-300 mb-2">
    <input
      type="checkbox"
      checked={serviceAgreement}
      onChange={() => setServiceAgreement(!serviceAgreement)}
      className="form-checkbox h-4 w-4 text-green-500 transition duration-200"
    />
    <span className="ml-2">Entering a Service Agreement</span>
  </label>
  {serviceAgreement && (
    <textarea
      placeholder="Provide details of the service agreement"
      value={serviceDetails}
      onChange={(e) => setServiceDetails(e.target.value)}
      className="mt-3 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      rows={3}
    />
  )}
</div>

{/* Wills/Personal Legal Documents */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">Wills/Personal Legal Documents</label>
  <textarea
    placeholder="Provide information on inheritance, dependents, or property distribution"
    value={willDetails}
    onChange={(e) => setWillDetails(e.target.value)}
    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
    rows={3}
  />
</div>
        </>
      ],
      4: [
        userType === 'freelancer' && (
            <div className="space-y-6">
              {/* Rate Selection Toggle */}
              <div className="flex items-center mb-4">
                <span className="text-gray-300 font-medium mr-4">Rate Type:</span>
                <button
                  className={`px-4 py-2 mr-2 ${rateType === 'hourly' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setRateType('hourly')}
                >
                  Hourly Rate
                </button>
                <button
                  className={`px-4 py-2 ${rateType === 'project' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setRateType('project')}
                >
                  Project Rate
                </button>
              </div>
              
              {/* Rate Input Field */}
              <TextInput
                label={rateType === 'hourly' ? 'Hourly Rate' : 'Project Rate'}
                field={rateType === 'hourly' ? 'hourlyRate' : 'projectRate'}
                placeholder={`Enter ${rateType} rate`}
              />
  
              {/* Availability Field */}
              <TextInput label="Availability Time" field="availability" placeholder="e.g., 9am - 6pm" />
  
              {/* Payment Method Toggle */}
              <div className="flex items-center mt-6">
                <span className="text-gray-300 font-medium mr-4">Payment Method:</span>
                <button
                  className={`px-4 py-2 mr-2 ${paymentMethod === 'netbanking' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  Netbanking
                </button>
                <button
                  className={`px-4 py-2 ${paymentMethod === 'upi' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
              </div>
  
              {/* Conditional Payment Fields */}
              {paymentMethod === 'netbanking' ? (
                <div className="space-y-4 mt-4">
                  <TextInput label="Bank Name" field="bankName" />
                  <TextInput label="Account Number" field="accountNumber" />
                  <TextInput label="IFSC Code" field="ifsc" />
                </div>
              ) : (
                <TextInput label="UPI ID" field="upi" placeholder="Enter your UPI ID" />
              )}
            </div>
          ),
        userType === 'startups' && <>
          <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Payment Method</label>
        <div className="flex items-center mt-6">
                <span className="text-gray-300 font-medium mr-4">Payment Method:</span>
                <button
                  className={`px-4 py-2 mr-2 ${paymentMethod === 'netbanking' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  Netbanking
                </button>
                <button
                  className={`px-4 py-2 ${paymentMethod === 'upi' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
              </div>
  
              {/* Conditional Payment Fields */}
              {paymentMethod === 'netbanking' ? (
                <div className="space-y-4 mt-4">
                  <TextInput label="Bank Name" field="bankName" />
                  <TextInput label="Account Number" field="accountNumber" />
                  <TextInput label="IFSC Code" field="ifsc" />
                </div>
              ) : (
                <TextInput label="UPI ID" field="upi" placeholder="Enter your UPI ID" />
              )}
            
      
      </div>
      {/* Funding Details */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Funding Details</label>
        <textarea
          placeholder="Provide information about seed funding, investors (if any)"
          value={fundingDetails}
          onChange={(e) => setFundingDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      {/* Income Tax Details */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Income Tax Details</label>
        <textarea
          placeholder="Enter tax return filing details and compliance with Indian tax laws"
          value={taxDetails}
          onChange={(e) => setTaxDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      {/* TAN Number */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">TAN Number</label>
        <input
          type="text"
          placeholder="Enter TAN Number (if applicable)"
          value={tanNumber}
          onChange={(e) => setTanNumber(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Registration Certificates */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Registration Certificates</label>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-green-600 file:text-white"
        />
        {registrationCert && <p className="mt-2 text-green-500">File uploaded: {registrationCert.name}</p>}
      </div>

      {/* IP/Trademarks */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">IP/Trademarks</label>
        <textarea
          placeholder="Provide details about any trademarks or intellectual property registered"
          value={ipDetails}
          onChange={(e) => setIpDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>
        </>,
        userType === 'business' && <>
          <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Payment Method</label>
        <div className="flex items-center mt-6">
                <span className="text-gray-300 font-medium mr-4">Payment Method:</span>
                <button
                  className={`px-4 py-2 mr-2 ${paymentMethod === 'netbanking' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  Netbanking
                </button>
                <button
                  className={`px-4 py-2 ${paymentMethod === 'upi' ? 'bg-green-500' : 'bg-gray-600'} rounded-full focus:outline-none`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
              </div>
  
              {/* Conditional Payment Fields */}
              {paymentMethod === 'netbanking' ? (
                <div className="space-y-4 mt-4">
                  <TextInput label="Bank Name" field="bankName" />
                  <TextInput label="Account Number" field="accountNumber" />
                  <TextInput label="IFSC Code" field="ifsc" />
                </div>
              ) : (
                <TextInput label="UPI ID" field="upi" placeholder="Enter your UPI ID" />
              )}
            
      
      </div>
      {/* Funding Details */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Funding Details</label>
        <textarea
          placeholder="Provide information about seed funding, investors (if any)"
          value={fundingDetails}
          onChange={(e) => setFundingDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      {/* Income Tax Details */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Income Tax Details</label>
        <textarea
          placeholder="Enter tax return filing details and compliance with Indian tax laws"
          value={taxDetails}
          onChange={(e) => setTaxDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>

      {/* TAN Number */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">TAN Number</label>
        <input
          type="text"
          placeholder="Enter TAN Number (if applicable)"
          value={tanNumber}
          onChange={(e) => setTanNumber(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Registration Certificates */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Registration Certificates</label>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-green-600 file:text-white"
        />
        {registrationCert && <p className="mt-2 text-green-500">File uploaded: {registrationCert.name}</p>}
      </div>

      {/* IP/Trademarks */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">IP/Trademarks</label>
        <textarea
          placeholder="Provide details about any trademarks or intellectual property registered"
          value={ipDetails}
          onChange={(e) => setIpDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
      </div>
        </>,
        userType === 'individual' && <>
          <TextInput label="Service Agreements" field="serviceAgreements" />
          <TextInput label="Wills" field="wills" />
        </>
      ]
    };

    return (
      <div className="grid grid-cols-2 gap-6 p-8 bg-black rounded-md shadow-md">
        {fieldComponents[formStep]}
      </div>
    );
  };

  return (
    <div className="w-[90%] mt-12 mb-12 p-8 bg-gray-700 rounded-lg shadow-lg text-white">
      {step === 1 ? (
        <div className="bg-black p-8 rounded-md shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-6 text-white">Select User Type</h2>
          <div className="flex justify-center space-x-8">
            {(['freelancer', 'startups', 'business', 'individual'] as UserType[]).map((type) => {
              const Icon = type === 'freelancer' ? FaUserTie : type === 'startups' ? FaBuilding : type === 'business' ? FaBriefcase : FaUser;
              return (
                <button
                  key={type}
                  onClick={() => handleUserTypeSelect(type)}
                  className="flex flex-col items-center p-4 bg-gray-700 rounded-lg transition-transform transform hover:scale-105 hover:bg-green-500 shadow-md"
                >
                  <Icon className="text-4xl mb-2 text-gray-300 hover:text-white transition-transform duration-200" />
                  <span className="text-white text-lg capitalize">{type}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-8 py-3 px-6 bg-green-500 rounded-full shadow-lg text-lg font-semibold hover:bg-green-600 transition ease-in-out duration-200"
          >
            Next
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {userType.charAt(0).toUpperCase() + userType.slice(1)} - Form Step {step}
          </h2>
          <div className="p-6 bg-black rounded-md shadow-lg animate-fadeIn">{renderFields(step)}</div>
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="py-2 px-4 bg-gray-700 rounded-full shadow-md hover:bg-gray-600 transition duration-200"
            >
              Previous
            </button>
            
            {step === 4 ? (
              <button onClick={handleSubmit}>
                Submit
              </button>
            ) : (
              <button onClick={handleNext}>
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicForm;
