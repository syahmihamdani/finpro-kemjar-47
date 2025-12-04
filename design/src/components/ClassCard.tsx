import { Link } from 'react-router-dom';
import { Users, User } from 'lucide-react';

interface ClassCardProps {
  classItem: {
    id: string;
    name: string;
    description: string;
    teacher: string;
    color: string;
    students: number;
  };
}

export default function ClassCard({ classItem }: ClassCardProps) {
  return (
    <Link
      to={`/class/${classItem.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
    >
      <div className={`h-24 ${classItem.color} group-hover:opacity-90 transition-opacity`} />
      
      <div className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {classItem.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {classItem.description}
        </p>

        <div className="flex items-center justify-between text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{classItem.teacher}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{classItem.students}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
