import React from 'react';
import { Users } from 'lucide-react';

const staff = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Medical Director',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
    credentials: 'MD, ABAM',
    description: 'Board-certified addiction medicine specialist with 15 years of experience.'
  },
  {
    name: 'Michael Chen',
    role: 'Clinical Director',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
    credentials: 'PhD, LMFT',
    description: 'Licensed therapist specializing in dual diagnosis treatment.'
  },
  {
    name: 'Lisa Rodriguez',
    role: 'Lead Therapist',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80',
    credentials: 'LCSW',
    description: 'Experienced in trauma-informed care and family therapy.'
  },
  {
    name: 'James Wilson',
    role: 'Recovery Coach',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80',
    credentials: 'CADC-II',
    description: 'Certified addiction counselor with personal recovery experience.'
  }
];

export default function StaffSection() {
  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Our Staff</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {staff.map((member, index) => (
          <div key={index} className="text-center">
            <img
              src={member.image}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
            <div className="text-blue-600 font-medium mb-1">{member.role}</div>
            <div className="text-sm text-gray-600 mb-2">{member.credentials}</div>
            <p className="text-sm text-gray-600">{member.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
          View All Staff
        </button>
      </div>
    </section>
  );
}