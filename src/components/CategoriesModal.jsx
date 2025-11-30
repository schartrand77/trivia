import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { X, Check } from 'lucide-react'; // Added Check icon
import { CATEGORY_DATA } from '../utils/categories'; // Import CATEGORY_DATA

const CategoriesModal = ({ show, onClose, onSave, initialSelectedCategoryIds }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Initialize selectedCategories when modal opens or initialSelectedCategoryIds change
    setSelectedCategories(initialSelectedCategoryIds || []);
  }, [initialSelectedCategoryIds]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prevSelected => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter(id => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedCategories);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">Choose Categories</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {CATEGORY_DATA.map(category => (
            <label key={category.id} className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="form-checkbox h-4 w-4 text-indigo-600 dark:bg-gray-700 dark:border-gray-600 rounded"
              />
              <span className="text-slate-700 dark:text-gray-100">{category.name}</span>
            </label>
          ))}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-gray-700 border-t dark:border-gray-600 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesModal;