import { Heart, Search, Inbox } from 'lucide-react';

const EmptyState = ({ type = 'campaigns', message, action }) => {
  const icons = {
    campaigns: Heart,
    donations: Inbox,
    search: Search,
  };

  const Icon = icons[type] || Heart;

  const defaultMessages = {
    campaigns: "No campaigns found. Be the first to create one!",
    donations: "No donations yet. Be the first to contribute!",
    search: "No results found. Try different search terms.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {message || defaultMessages[type]}
      </h3>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

