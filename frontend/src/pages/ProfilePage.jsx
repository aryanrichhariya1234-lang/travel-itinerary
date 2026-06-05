import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.patch('/auth/profile', { name });
      toast.success('Name updated!');
      // Update local storage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="profile-page page-enter">
      <h1 className="profile-page__title">Account Settings</h1>

      <div className="profile-sections">
        {/* Profile info */}
        <div className="profile-section">
          <div className="profile-section__header">
            <User size={18} />
            <h2>Profile</h2>
          </div>
          <form onSubmit={handleNameSave} className="profile-form">
            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
              <p className="profile-field__hint">Email cannot be changed.</p>
            </div>
            <div className="profile-field">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
              />
            </div>
            <button type="submit" className="profile-save-btn" disabled={savingName}>
              <Save size={15} />
              {savingName ? 'Saving...' : 'Save name'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="profile-section">
          <div className="profile-section__header">
            <Lock size={18} />
            <h2>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="profile-form">
            {[
              { label: 'Current password', key: 'current', placeholder: '••••••••' },
              { label: 'New password', key: 'new', placeholder: 'Min. 6 characters' },
              { label: 'Confirm new password', key: 'confirm', placeholder: '••••••••' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="profile-field">
                <label>{label}</label>
                <input
                  type="password"
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
            <button type="submit" className="profile-save-btn" disabled={savingPw}>
              <Save size={15} />
              {savingPw ? 'Saving...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <div className="profile-danger">
        <h3>Account info</h3>
        <p>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
      </div>
    </div>
  );
}
