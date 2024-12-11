import React from 'react';
import { Condition } from '../types';

interface ConditionsSectionProps {
  conditions: Condition[];
}

export default function ConditionsSection({ conditions }: ConditionsSectionProps) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Conditions We Treat</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {conditions.map((condition) => (
          <div key={condition.id} className="flex flex-col items-center text-center">
            {condition.logo && (
              <img
                src={condition.logo}
                alt={condition.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{condition.name}</h3>
            {condition.description && (
              <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
