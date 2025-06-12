import React, { useState } from 'react';
import { FilterOptions } from '../../types';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import Badge from '../ui/Badge';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onToggleFavorite?: (id: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, onToggleFavorite }) => {
  const [isOpen, setIsOpen] = useState(false);

  const experienceOptions = [
    '< 1 jaar',
    '1-3 jaar',
    '3-5 jaar',
    '5-10 jaar',
    '10+ jaar',
  ];

  const locationOptions = [
    'Amsterdam',
    'Rotterdam',
    'Utrecht',
    'Den Haag',
    'Eindhoven',
    'Groningen',
    'Tilburg',
  ];

  const skillOptions = [
    'React',
    'TypeScript',
    'Python',
    'Node.js',
    'Java',
    'C#',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'PostgreSQL',
    'MongoDB',
  ];

  const availabilityOptions = [
    'Beschikbaar',
    'Beschikbaar binnen 1 maand',
    'Beschikbaar binnen 3 maanden',
  ];

  const languageOptions = [
    'Nederlands',
    'Engels',
    'Duits',
    'Frans',
    'Spaans',
  ];

  const branchOptions = [
    'Tech',
    'Healthcare',
    'Finance',
    'Marketing',
    'Sales',
  ];

  const handleCheckboxChange = (category: keyof FilterOptions, value: string) => {
    const currentValues = filters[category] as string[] || [];
    let newValues: string[];

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    onFilterChange({
      ...filters,
      [category]: newValues,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      experience: [],
      location: [],
      skills: [],
      availability: [],
      languages: [],
      matchScore: undefined,
      remote: undefined,
      branch: [],
    });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    for (const key in filters) {
      if (Array.isArray(filters[key as keyof FilterOptions]) && (filters[key as keyof FilterOptions] as string[]).length > 0) {
        count += (filters[key as keyof FilterOptions] as string[]).length;
      }
      if (key === 'remote' && filters.remote !== undefined) {
        count += 1;
      }
    }
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-lightgray-800">
      <div className="p-4 border-b border-lightgray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter size={18} className="text-midnight mr-2" />
            <h3 className="font-medium">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-midnight flex items-center"
              >
                <X size={14} className="mr-1" />
                Wis filters
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center text-sm font-medium"
            >
              <SlidersHorizontal size={18} className="mr-1" />
              {isOpen ? 'Verberg' : 'Toon'}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden md:block'} p-4 space-y-6`}>
        {/* Remote Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Remote werken</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                className="text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                checked={filters.remote === true}
                onChange={() => onFilterChange({ ...filters, remote: true })}
              />
              <span className="ml-2 text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                className="text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                checked={filters.remote === false}
                onChange={() => onFilterChange({ ...filters, remote: false })}
              />
              <span className="ml-2 text-sm text-gray-700">Nee</span>
            </label>
          </div>
        </div>

        {/* Branch Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Branche</h4>
          <div className="space-y-2">
            {branchOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`branch-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.branch || []).includes(option)}
                  onChange={() => handleCheckboxChange('branch', option)}
                />
                <label htmlFor={`branch-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Ervaring</h4>
          <div className="space-y-2">
            {experienceOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`exp-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.experience || []).includes(option)}
                  onChange={() => handleCheckboxChange('experience', option)}
                />
                <label htmlFor={`exp-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Locatie</h4>
          <div className="space-y-2">
            {locationOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`loc-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.location || []).includes(option)}
                  onChange={() => handleCheckboxChange('location', option)}
                />
                <label htmlFor={`loc-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Vaardigheden</h4>
          <div className="grid grid-cols-2 gap-2">
            {skillOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`skill-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.skills || []).includes(option)}
                  onChange={() => handleCheckboxChange('skills', option)}
                />
                <label htmlFor={`skill-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Beschikbaarheid</h4>
          <div className="space-y-2">
            {availabilityOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`avail-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.availability || []).includes(option)}
                  onChange={() => handleCheckboxChange('availability', option)}
                />
                <label htmlFor={`avail-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Languages Filter */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Talen</h4>
          <div className="space-y-2">
            {languageOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`lang-${option}`}
                  className="rounded text-turquoise-500 focus:ring-turquoise-500 h-4 w-4"
                  checked={(filters.languages || []).includes(option)}
                  onChange={() => handleCheckboxChange('languages', option)}
                />
                <label htmlFor={`lang-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Match Score Slider */}
        <div>
          <div className="flex justify-between">
            <h4 className="font-medium mb-2 text-sm">Minimum Match Score</h4>
            <span className="text-sm font-medium">{filters.matchScore || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.matchScore || 0}
            onChange={(e) => onFilterChange({
              ...filters,
              matchScore: parseInt(e.target.value),
            })}
            className="w-full h-2 bg-lightgray-800 rounded-lg appearance-none cursor-pointer accent-turquoise-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};