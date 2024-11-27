import { FacilityWithContact } from '../types';

interface ContactBoxProps {
  facility: FacilityWithContact;
}

const ContactBox = ({ facility }: ContactBoxProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Facility Name</label>
          <p className="mt-1 text-gray-800">{facility.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Phone</label>
          <p className="mt-1 text-gray-800">
            <a 
              href={`tel:${facility.phone}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {facility.phone}
            </a>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Location</label>
          <p className="mt-1 text-gray-800">{facility.location}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactBox;
