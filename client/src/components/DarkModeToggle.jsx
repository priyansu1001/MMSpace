import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const DarkModeToggle = ({ className = "" }) => {
    const { isDarkMode, toggleDarkMode } = useTheme()

    return (
        <button
            onClick={toggleDarkMode}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isDarkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${className}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDarkMode ? (
                <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                </>
            )}
        </button>
    )
}

export default DarkModeToggle