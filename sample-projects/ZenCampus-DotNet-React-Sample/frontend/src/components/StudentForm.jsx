import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  rollNumber: '',
  className: '',
  email: '',
  feeDue: 0,
  feesPaid: false,
};

// A single controlled form used for BOTH adding and editing — when
// `initialData` is provided it becomes "edit mode", otherwise it's "add mode".
// This mirrors the controlled-component pattern: the form's values live in
// React state, not in the DOM inputs themselves.
export default function StudentForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(initialData ? { ...initialData } : emptyForm);
  }, [initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, feeDue: Number(form.feeDue) });
    if (!initialData) setForm(emptyForm); // clear the form after a fresh "add"
  }

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h2>{initialData ? `Edit ${initialData.name}` : 'Add Student'}</h2>

      <div className="form-grid">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Roll Number
          <input name="rollNumber" value={form.rollNumber} onChange={handleChange} required />
        </label>

        <label>
          Class
          <input name="className" value={form.className} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Fee Due (₹)
          <input type="number" name="feeDue" min="0" value={form.feeDue} onChange={handleChange} />
        </label>

        <label className="checkbox-label">
          <input type="checkbox" name="feesPaid" checked={form.feesPaid} onChange={handleChange} />
          Fees Paid
        </label>
      </div>

      <div className="form-actions">
        <button type="submit">{initialData ? 'Save Changes' : 'Add Student'}</button>
        {initialData && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
