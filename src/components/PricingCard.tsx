import { useNavigate } from 'react-router-dom';

export default function PricingCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/create-listing');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Listing</h3>
        <div className="text-5xl font-bold text-blue-600 mb-6">
          <span className="text-2xl">$</span>299
          <span className="text-lg text-gray-500">/mo</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        <li className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Featured Placement
        </li>
        <li className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Detailed Analytics
        </li>
        <li className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Priority Support
        </li>
        <li className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Verified Badge
        </li>
      </ul>

      <button
        onClick={handleClick}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Get Started
      </button>
    </div>
  );
}
