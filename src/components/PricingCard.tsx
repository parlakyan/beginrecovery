import { useNavigate } from 'react-router-dom';

const PricingCard = () => {
  const navigate = useNavigate();

  const handleCreateListing = () => {
    navigate('/create-listing');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">List Your Facility</h3>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Features include:</p>
        <ul className="text-gray-600 space-y-2">
          <li>• Detailed facility profile</li>
          <li>• Photo gallery</li>
          <li>• Contact information</li>
          <li>• Insurance verification</li>
          <li>• Reviews and ratings</li>
        </ul>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-800 mb-2">$99<span className="text-lg">/month</span></p>
        <p className="text-gray-500 mb-4">Cancel anytime</p>
        <button
          onClick={handleCreateListing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
