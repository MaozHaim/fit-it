import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const EMPTY_ADDRESS = { firstName: '', lastName: '', address: '', city: '', zip: '', country: '' };

function addressesKey(email) { return `fitit_addresses_${email}`; }
function defaultIdxKey(email) { return `fitit_default_address_idx_${email}`; }

function loadAddresses(email) {
  return JSON.parse(localStorage.getItem(addressesKey(email)) || '[]');
}

function loadDefaultIdx(email) {
  const raw = localStorage.getItem(defaultIdxKey(email));
  return raw !== null ? parseInt(raw, 10) : null;
}

function persist(email, list, defaultIdx) {
  localStorage.setItem(addressesKey(email), JSON.stringify(list));
  if (defaultIdx !== null && defaultIdx !== undefined) {
    localStorage.setItem(defaultIdxKey(email), String(defaultIdx));
  } else {
    localStorage.removeItem(defaultIdxKey(email));
  }
}

function AddressForm({ form, onChange, onSave, onCancel }) {
  const field = (key, label, type = 'text') => (
    <div className="profile-form-row">
      <label>{label}</label>
      <input type={type} value={form[key]} onChange={e => onChange(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );
  return (
    <div className="profile-form profile-form-card">
      <div className="profile-form-two-col">
        {field('firstName', 'First Name')}
        {field('lastName', 'Last Name')}
      </div>
      {field('address', 'Address')}
      <div className="profile-form-two-col">
        {field('city', 'City')}
        {field('zip', 'ZIP Code')}
      </div>
      {field('country', 'Country')}
      <div className="profile-form-actions">
        <button className="btn btn-primary" onClick={onSave}>Save</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SavedAddresses({ userEmail }) {
  const [addresses, setAddresses] = useState(() => loadAddresses(userEmail));
  const [defaultIdx, setDefaultIdx] = useState(() => loadDefaultIdx(userEmail));
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);

  const startAdd = () => { setForm(EMPTY_ADDRESS); setEditingIdx(-1); };
  const startEdit = (i) => { setForm({ ...addresses[i] }); setEditingIdx(i); };

  const save = () => {
    const updated = editingIdx === -1
      ? [...addresses, form]
      : addresses.map((a, i) => i === editingIdx ? form : a);
    let newDefault = defaultIdx;
    if (updated.length === 1) newDefault = 0;
    setAddresses(updated);
    setDefaultIdx(newDefault);
    persist(userEmail, updated, newDefault);
    setEditingIdx(null);
  };

  const remove = (i) => {
    const updated = addresses.filter((_, j) => j !== i);
    let newDefault = defaultIdx;
    if (defaultIdx === i) newDefault = updated.length === 1 ? 0 : null;
    else if (defaultIdx !== null && i < defaultIdx) newDefault = defaultIdx - 1;
    setAddresses(updated);
    setDefaultIdx(newDefault);
    persist(userEmail, updated, newDefault);
  };

  const pickDefault = (i) => {
    setDefaultIdx(i);
    localStorage.setItem(defaultIdxKey(userEmail), String(i));
  };

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h2>Saved Addresses</h2>
        {editingIdx === null && <button className="profile-edit-btn" onClick={startAdd}>Add</button>}
      </div>

      {addresses.length === 0 && editingIdx === null && (
        <p className="profile-empty">No saved addresses.</p>
      )}

      {addresses.map((a, i) =>
        editingIdx === i ? (
          <AddressForm key={i} form={form} onChange={setForm} onSave={save} onCancel={() => setEditingIdx(null)} />
        ) : (
          <div key={i} className={`saved-address-card ${defaultIdx === i ? 'is-default' : ''}`}>
            <div className="saved-address-body">
              <p>{a.firstName} {a.lastName}</p>
              <p>{a.address}</p>
              <p>{a.city}, {a.zip}</p>
              <p>{a.country}</p>
              {defaultIdx === i
                ? <span className="address-default-badge">Default</span>
                : <button className="address-set-default-btn" onClick={() => pickDefault(i)}>Set as default</button>
              }
            </div>
            <div className="saved-address-actions">
              <button className="cart-item-action-btn" onClick={() => startEdit(i)} aria-label="Edit address"><FiEdit2 size={15} /></button>
              <button className="cart-item-action-btn" onClick={() => remove(i)} aria-label="Delete address"><FiTrash2 size={15} /></button>
            </div>
          </div>
        )
      )}

      {editingIdx === -1 && (
        <AddressForm form={form} onChange={setForm} onSave={save} onCancel={() => setEditingIdx(null)} />
      )}
    </div>
  );
}

export default SavedAddresses;
