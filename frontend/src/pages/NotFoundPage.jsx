import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="notfound__content">
        <Compass size={48} className="notfound__icon" />
        <h1>404</h1>
        <h2>Lost in transit</h2>
        <p>This page doesn't exist. Let's get you back on track.</p>
        <Link to="/dashboard" className="notfound__btn">Back to Dashboard</Link>
      </div>
    </div>
  );
}
