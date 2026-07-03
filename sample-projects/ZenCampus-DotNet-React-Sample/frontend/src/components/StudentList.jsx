// A "dumb" presentational component: it receives data and callbacks as
// props and renders them. It has no idea the data came from an API — that's
// App.jsx's job. This separation makes StudentList reusable and easy to test.
export default function StudentList({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return <p className="empty-state">No students yet — add one above.</p>;
  }

  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No.</th>
          <th>Class</th>
          <th>Email</th>
          <th>Fee Due</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.rollNumber}</td>
            <td>{s.className}</td>
            <td>{s.email}</td>
            <td>₹{s.feeDue}</td>
            <td>
              <span className={s.feesPaid ? 'badge paid' : 'badge due'}>
                {s.feesPaid ? 'Paid' : 'Due'}
              </span>
            </td>
            <td className="row-actions">
              <button onClick={() => onEdit(s)}>Edit</button>
              <button className="danger" onClick={() => onDelete(s.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
