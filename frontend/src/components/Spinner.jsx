export default function Spinner({ label = 'Loading…' }) {
    return (
      <div className="inline-flex items-center gap-3">
        <div className="relative">
          <div className="size-5">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping"></div>
        </div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
      </div>
    );
  }