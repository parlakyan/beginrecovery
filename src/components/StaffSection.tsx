import { User } from 'lucide-react';

export default function StaffSection() {
  const staff = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Medical Director',
      credentials: 'MD, FASAM',
      description: 'Board-certified in addiction medicine with over 15 years of experience.'
    },
    {
      name: 'Michael Chen',
      role: 'Clinical Director',
      credentials: 'LCSW, CADC',
      description: 'Licensed clinical social worker specializing in dual diagnosis treatment.'
    },
    {
      name: 'Dr. Robert Martinez',
      role: 'Psychiatrist',
      credentials: 'MD',
      description: 'Expert in treating co-occurring mental health disorders.'
    },
    {
      name: 'Emily Thompson',
      role: 'Lead Therapist',
      credentials: 'MA, LPC',
      description: 'Specialized in trauma-informed care and CBT.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Our Staff</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {staff.map((member, index) => (
          <div 
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <div className="text-sm text-blue-600 mb-1">{member.role}</div>
              <div className="text-sm font-medium text-gray-500 mb-2">{member.credentials}</div>
              <p className="text-sm text-gray-600">{member.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
