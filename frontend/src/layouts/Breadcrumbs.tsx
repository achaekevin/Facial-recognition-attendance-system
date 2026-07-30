import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/login') return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = name
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {formattedName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-primary transition-colors capitalize">
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
