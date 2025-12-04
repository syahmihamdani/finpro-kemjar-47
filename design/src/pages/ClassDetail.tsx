import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import AssignmentCard from '../components/AssignmentCard';
import SubmitAssignment from '../components/SubmitAssignment';
import { FileText, Clock } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  submitted: boolean;
}

interface ClassData {
  id: string;
  name: string;
  description: string;
  teacher: string;
  color: string;
}

export default function ClassDetail() {
  const { classId } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    // Mock data - In real app, fetch from backend
    const mockClass: ClassData = {
      id: classId || '1',
      name: 'Web Security Fundamentals',
      description: 'Learn the basics of web application security',
      teacher: 'Dr. Sarah Johnson',
      color: 'bg-blue-500',
    };

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'SQL Injection Lab',
        description: 'Identify and exploit SQL injection vulnerabilities in the provided web application',
        dueDate: '2025-12-10',
        points: 100,
        submitted: false,
      },
      {
        id: '2',
        title: 'XSS Vulnerability Report',
        description: 'Find and document XSS vulnerabilities, provide remediation recommendations',
        dueDate: '2025-12-15',
        points: 150,
        submitted: true,
      },
      {
        id: '3',
        title: 'File Upload Exploitation',
        description: 'Demonstrate file upload vulnerabilities and bypass security controls',
        dueDate: '2025-12-20',
        points: 120,
        submitted: false,
      },
    ];

    setClassData(mockClass);
    setAssignments(mockAssignments);
  }, [classId]);

  if (!classData) {
    return <Layout><div>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className={`${classData.color} rounded-lg p-8 mb-8 text-white`}>
        <h1 className="mb-2">{classData.name}</h1>
        <p className="opacity-90 mb-4">{classData.description}</p>
        <div className="flex items-center gap-2">
          <span className="opacity-80">Instructor: {classData.teacher}</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-white">Assignments</h2>
        {user?.role === 'teacher' && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Create Assignment
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-600 dark:text-gray-400 mb-2">No assignments yet</h3>
          <p className="text-gray-500 dark:text-gray-500">Check back later for new assignments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onSubmit={() => setSelectedAssignment(assignment)}
            />
          ))}
        </div>
      )}

      {selectedAssignment && user?.role === 'student' && (
        <SubmitAssignment
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmit={(file, comment) => {
            console.log('Submitting:', file, comment);
            // Update assignment status
            setAssignments(prev =>
              prev.map(a =>
                a.id === selectedAssignment.id ? { ...a, submitted: true } : a
              )
            );
            setSelectedAssignment(null);
          }}
        />
      )}
    </Layout>
  );
}
