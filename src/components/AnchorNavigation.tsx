import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
  isVisible: boolean;
}

interface AnchorNavigationProps {
  sections: Section[];
  className?: string;
}

export default function AnchorNavigation({ sections, className = '' }: AnchorNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [isSticky, setIsSticky] = useState(false);
  const visibleSections = sections.filter(section => section.isVisible);

  useEffect(() => {
    const handleScroll = () => {
      // Check if nav should be sticky
      const nav = document.getElementById('anchor-nav');
      if (nav) {
        const navTop = nav.getBoundingClientRect().top;
        setIsSticky(navTop <= 0);
      }

      // Check active section
      const pageTop = window.scrollY;
      const pageBottom = pageTop + window.innerHeight;
      const offset = 100; // Offset for better UX

      for (const section of visibleSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop - offset;
          const elementBottom = elementTop + element.offsetHeight;

          if (pageTop >= elementTop && pageTop <= elementBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Height of sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      id="anchor-nav"
      className={`bg-white border-b z-40 transition-all ${
        isSticky ? 'fixed top-[80px] left-0 right-0' : ''
      } ${className}`}
    >
      <div className={`${isSticky ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
        <div className="flex space-x-8 overflow-x-auto hide-scrollbar">
          {visibleSections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`py-4 px-2 border-b-2 whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}