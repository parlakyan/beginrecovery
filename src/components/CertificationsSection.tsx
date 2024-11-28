import { Shield, Award, CheckCircle } from 'lucide-react';

export default function CertificationsSection() {
  const certifications = [
    {
      icon: Shield,
      title: 'JCAHO Accredited',
      description: 'Joint Commission on Accreditation of Healthcare Organizations'
    },
    {
      icon: Award,
      title: 'CARF Certified',
      description: 'Commission on Accreditation of Rehabilitation Facilities'
    },
    {
      icon: CheckCircle,
      title: 'State Licensed',
      description: 'Licensed by the State Department of Healthcare Services'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Certifications & Licenses</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        {certifications.map((cert, index) => (
          <div 
            key={index}
            className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50"
          >
            <cert.icon className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{cert.title}</h3>
            <p className="text-sm text-gray-600">{cert.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
