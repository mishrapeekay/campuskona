import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

                    return (
                        <li key={name}>
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                {isLast ? (
                                    <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link
                                        to={routeTo}
                                        className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2 transition-colors"
                                    >
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
