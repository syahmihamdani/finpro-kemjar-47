import { useState, useRef } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';

interface SubmitAssignmentProps {
  assignment: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onSubmit: (file: File, comment: string) => void;
}

export default function SubmitAssignment({ assignment, onClose, onSubmit }: SubmitAssignmentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // VULNERABILITY: Insecure file upload - no validation on file type or content
      // Backend should implement proper file validation, type checking, and scanning
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      // VULNERABILITY: File is uploaded without proper validation
      // In backend, this should:
      // 1. Validate file extension (but this can be bypassed)
      // 2. Check file content/magic bytes
      // 3. Scan for malware
      // 4. Store files outside webroot
      // 5. Randomize filenames
      onSubmit(file, comment);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white">Submit Assignment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="text-gray-900 dark:text-white mb-2">{assignment.title}</h3>
          </div>

          {/* VULNERABILITY WARNING - For pentesting purposes only */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300">
                  <strong>Vulnerability Note:</strong> This file upload has minimal validation.
                  Backend accepts various file types without proper content verification.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Upload File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              {file ? (
                <div>
                  <p className="text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-gray-500 dark:text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 dark:text-gray-500">
                    Any file type accepted
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              // VULNERABILITY: No file type restrictions
            />
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 mb-2">
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Add any notes about your submission..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Submit Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
