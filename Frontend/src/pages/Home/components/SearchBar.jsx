import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  // Only 3 service names
  const serviceNames = ['facial', 'kitchen cleaning', 'AC service'];

  useEffect(() => {
    const currentService = serviceNames[currentServiceIndex];
    let timeoutId;

    if (isTyping) {
      // Typing animation - forward direction
      let currentCharIndex = 0;
      const typeNextChar = () => {
        if (currentCharIndex <= currentService.length) {
          setDisplayedText(currentService.slice(0, currentCharIndex));
          currentCharIndex++;
          timeoutId = setTimeout(typeNextChar, 100); // Typing speed
        } else {
          // Wait after typing complete
          setTimeout(() => {
            setIsTyping(false);
          }, 2000); // Wait 2 seconds before erasing
        }
      };
      typeNextChar();
    } else {
      // Erasing animation - backward direction (same as typing but reverse)
      let currentCharIndex = currentService.length;
      const eraseNextChar = () => {
        if (currentCharIndex >= 0) {
          setDisplayedText(currentService.slice(0, currentCharIndex));
          currentCharIndex--;
          timeoutId = setTimeout(eraseNextChar, 100); // Same speed as typing
        } else {
          // Move to next service
          setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
          setIsTyping(true);
        }
      };
      eraseNextChar();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentServiceIndex, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="sticky top-0 z-40 bg-white py-3 px-4 mb-0 flex justify-center">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <FiSearch className="w-5 h-5 text-gray-700" />
        </div>
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-lg text-sm border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
            style={{
              color: searchQuery ? '#111827' : 'transparent'
            }}
          />
          {!searchQuery && (
            <div className="absolute inset-y-0 left-12 right-4 flex items-center pointer-events-none z-10">
              <span className="text-sm text-gray-400">
                Search for '<span className="text-gray-400">{displayedText}</span>'
              </span>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

