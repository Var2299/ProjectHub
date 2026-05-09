export default function Empty({ title, message }: { title: string; message?: string }) {
  return (
    <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-lg bg-white">
      <div className="text-4xl mb-2">📭</div>
      <div className="font-medium text-gray-800">{title}</div>
      {message && <div className="text-sm text-gray-500 mt-1">{message}</div>}
    </div>
  );
}
