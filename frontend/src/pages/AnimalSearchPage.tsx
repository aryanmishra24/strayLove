import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import animalService from '../services/animalService';
import AnimalCard from '../components/animals/AnimalCard';
import type { Animal } from '../types/animal';

const speciesOptions = [
  { value: '', label: 'All Species' },
  { value: 'DOG', label: '🐕 Dog' },
  { value: 'CAT', label: '🐱 Cat' },
  { value: 'BIRD', label: '🐦 Bird' },
  { value: 'OTHER', label: '🐾 Other' },
];

const AnimalSearchPage: React.FC = () => {
  const [species, setSpecies] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const filters: any = {};
      if (species) filters.species = [species];
      if (area) filters.search = area;
      const data = await animalService.getAnimals(filters, 1, 12);
      setResults(data.content);
    } catch (err: any) {
      setError('Failed to fetch animals. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Search Animals
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search for animals by location or species
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSearch}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Species</label>
              <select
                value={species}
                onChange={e => setSpecies(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {speciesOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area</label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="Enter area/city"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
        <div>
          {error && <div className="text-center text-red-500 mb-4">{error}</div>}
          {searched && !loading && results.length === 0 && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-16">
              No animals found matching your criteria.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map(animal => (
              <AnimalCard key={animal.id} animal={animal} viewMode="grid" />
            ))}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="font-medium text-primary hover:text-primary/80"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnimalSearchPage; 