import React from 'react';
import { Trash2, ExternalLink, Copy, Clock } from 'lucide-react';
import { QRHistoryItem } from '../App';

interface HistoryPanelProps {
  history: QRHistoryItem[];
  onClear: () => void;
  darkMode: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, darkMode }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            History
          </h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {history.length} item{history.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClear}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              darkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } shadow-md hover:shadow-lg transform hover:scale-105`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          darkMode ? 'bg-gray-700/30' : 'bg-gray-50'
        }`}>
          <Clock className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No history yet
          </p>
          <p className={`text-sm mt-2 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Generated and scanned QR codes will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'generated'
                        ? darkMode
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-blue-100 text-blue-800'
                        : darkMode
                          ? 'bg-green-900 text-green-300'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {item.type === 'generated' ? 'Generated' : 'Scanned'}
                    </span>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  
                  <p className={`font-mono text-sm break-all ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.content.length > 100 
                      ? `${item.content.substring(0, 100)}...`
                      : item.content
                    }
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => copyToClipboard(item.content)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  {isValidUrl(item.content) && (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;