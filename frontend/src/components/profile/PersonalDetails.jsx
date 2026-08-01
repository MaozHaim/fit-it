import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function formatDate(raw) {
  if (!raw) return null;
  const [y, m, d] = raw.split('-');
  return `${d}/${m}/${y}`;
}

const FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName',  label: 'Last Name' },
  { key: 'email',     label: 'Email',      type: 'email' },
  { key: 'phone',     label: 'Phone',      type: 'tel' },
  { key: 'birthDate', label: 'Birth Date', type: 'date' },
];

function PersonalDetails() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      email:     user.email     || '',
      phone:     user.phone     || '',
      birthDate: user.birthDate || '',
    });
    setEditing(true);
  };

  const save = () => { updateProfile(form); setEditing(false); };

  const displayValue = (key) => {
    const raw = user[key];
    if (key === 'birthDate') return formatDate(raw) || <span className="profile-empty">Not set</span>;
    return raw || <span className="profile-empty">Not set</span>;
  };

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h2>Personal Details</h2>
        {!editing && <button className="profile-edit-btn" onClick={startEdit}>Edit</button>}
      </div>

      {editing ? (
        <div className="profile-form">
          <div className="profile-form-two-col">
            {FIELDS.slice(0, 2).map(({ key, label }) => (
              <div key={key} className="profile-form-row">
                <label>{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {FIELDS.slice(2).map(({ key, label, type = 'text' }) => (
            <div key={key} className="profile-form-row">
              <label>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="profile-form-actions">
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        FIELDS.map(({ key, label }) => (
          <div key={key} className="profile-detail">
            <span className="profile-detail-label">{label}</span>
            <span>{displayValue(key)}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default PersonalDetails;
