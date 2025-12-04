import { FileText, Calendar, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    points: number;
    submitted: boolean;
  };
  onSubmit: () => void;
}

export default function AssignmentCard({ assignment, onSubmit }: AssignmentCardProps) {
  const { user } = useAuth();
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date() && !assignment.submitted;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-2">{assignment.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{assignment.description}</p>
          </div>
        </div>

        {assignment.submitted && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span>Submitted</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
              Due {dueDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{assignment.points} points</span>
          </div>
        </div>

        {user?.role === 'student' && !assignment.submitted && (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Submit Work
          </button>
        )}

        {user?.role === 'teacher' && (
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
            View Submissions
          </button>
        )}
      </div>
    </div>
  );
}
