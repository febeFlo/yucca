import { Link } from 'react-router-dom';

export const InteractiveButton = () => {
  return (
    <Link 
      to="/interactive" 
      className="absolute top-4 right-4 md:top-8 md:right-8 bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex items-center gap-3"
    >
      <span className="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-gray-700 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-gray-600 transition-colors">
        🎤
      </span>
      <div>
        <p className="text-orange-600 dark:text-orange-400 font-medium text-sm md:text-base">Mode Interaktif</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Bicara dengan Yucca</p>
      </div>
    </Link>
  );
};