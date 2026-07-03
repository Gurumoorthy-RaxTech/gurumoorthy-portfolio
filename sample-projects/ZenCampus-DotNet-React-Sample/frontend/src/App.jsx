import { useEffect, useState } from 'react';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import { getStudents, createStudent, updateStudent, deleteStudent } from './api/studentApi';
import './App.css';

// App.jsx is the "smart" component: it owns all the state (the student list,
// which student — if any — is being edited, loading/error status) and passes
// data + callbacks down into the two presentational children below it.
function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      setStudents(await getStudents());
      setError('');
    } catch {
      setError('Could not reach the API. Is the .NET backend running on http://localhost:5041?');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formData) {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        setEditingStudent(null);
      } else {
        await createStudent(formData);
      }
      await loadStudents();
    } catch {
      setError('Save failed. Check that the backend is running and try again.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this student?')) return;
    try {
      await deleteStudent(id);
      await loadStudents();
    } catch {
      setError('Delete failed. Check that the backend is running and try again.');
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🎓 ZenCampus Student Management</h1>
        <p>.NET 9 Web API + React (Vite) sample project</p>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <StudentForm
        initialData={editingStudent}
        onSubmit={handleSubmit}
        onCancel={() => setEditingStudent(null)}
      />

      {loading ? (
        <p className="loading">Loading students...</p>
      ) : (
        <StudentList students={students} onEdit={setEditingStudent} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;
