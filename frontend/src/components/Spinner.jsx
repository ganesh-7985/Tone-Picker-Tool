export default function Spinner({ label = 'Loading…' }) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a12 12 0 00-12 12h4z"></path>
        </svg>
        <span>{label}</span>
      </div>
    );
}
  