import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import { BookOpen } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  description: string;
  teacher: string;
  color: string;
  students: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    // Mock data - In real app, fetch from backend
    const mockClasses: Class[] = [
      {
        id: '1',
        name: 'Web Security Fundamentals',
        description: 'Learn the basics of web application security',
        teacher: 'Dr. Sarah Johnson',
        color: 'bg-blue-500',
        students: 24,
      },
      {
        id: '2',
        name: 'Advanced Penetration Testing',
        description: 'Deep dive into penetration testing techniques',
        teacher: 'Prof. Michael Chen',
        color: 'bg-purple-500',
        students: 18,
      },
      {
        id: '3',
        name: 'Cryptography Essentials',
        description: 'Understanding encryption and cryptographic protocols',
        teacher: 'Dr. Emily Roberts',
        color: 'bg-green-500',
        students: 32,
      },
      {
        id: '4',
        name: 'Network Security',
        description: 'Securing network infrastructure and protocols',
        teacher: 'Prof. David Martinez',
        color: 'bg-orange-500',
        students: 27,
      },
    ];

    setClasses(mockClasses);
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'teacher' ? 'Manage your classes' : 'Continue your learning journey'}
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-gray-600 dark:text-gray-400 mb-2">No classes yet</h2>
          <p className="text-gray-500 dark:text-gray-500">
            {user?.role === 'teacher' 
              ? 'Create your first class to get started'
              : 'Enroll in a class to start learning'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      )}
    </Layout>
  );
}
