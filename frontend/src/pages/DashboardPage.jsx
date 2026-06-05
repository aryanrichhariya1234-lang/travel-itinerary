import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, MapPin, Calendar, Clock, Trash2, ArrowRight, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './DashboardPage.css';

const StatusBadge = ({ status }) => {
  const map = {
    ready: { label: 'Ready', color: 'var(--teal)' },
    processing: { label: 'Processing...', color: 'var(--accent)' },
    failed: { label: 'Failed', color: 'var(--rose)' },
  };
  const { label, color } = map[status] || map.ready;
  return (
    <span className="status-badge" style={{ color, background: `${color}18`, borderColor: `${color}33` }}>
      {status === 'processing' && <span className="pulse-dot" style={{ background: color }} />}
      {label}
    </span>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['itineraries'],
    queryFn: () => api.get('/itineraries').then((r) => r.data),
    refetchInterval: (data) => {
      // Keep polling if any are still processing
      const hasProcessing = data?.itineraries?.some((i) => i.status === 'processing');
      return hasProcessing ? 4000 : false;
    },
  });

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this itinerary?')) return;
    try {
      await api.delete(`/itineraries/${id}`);
      toast.success('Itinerary deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const itineraries = data?.itineraries || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard page-enter">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">
            {greeting()}, <span>{user?.name?.split(' ')[0]}</span> ✈️
          </h1>
          <p className="dashboard__subtitle">
            {itineraries.length === 0
              ? 'Upload your first travel documents to get started'
              : `You have ${itineraries.length} itiner${itineraries.length === 1 ? 'y' : 'aries'}`}
          </p>
        </div>
        <Link to="/upload" className="dashboard__new-btn">
          <Plus size={18} />
          New Itinerary
        </Link>
      </div>

      {/* Stats */}
      {itineraries.length > 0 && (
        <div className="dashboard__stats">
          <div className="stat-card">
            <Globe size={20} className="stat-card__icon" />
            <div>
              <p className="stat-card__value">{itineraries.length}</p>
              <p className="stat-card__label">Trips planned</p>
            </div>
          </div>
          <div className="stat-card">
            <MapPin size={20} className="stat-card__icon" style={{ color: 'var(--teal)' }} />
            <div>
              <p className="stat-card__value">
                {new Set(itineraries.filter(i => i.status === 'ready').map((i) => i.destination)).size}
              </p>
              <p className="stat-card__label">Destinations</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={20} className="stat-card__icon" style={{ color: 'var(--rose)' }} />
            <div>
              <p className="stat-card__value">
                {itineraries.filter((i) => i.status === 'ready').reduce((a, i) => a + (i.totalDays || 0), 0)}
              </p>
              <p className="stat-card__label">Days planned</p>
            </div>
          </div>
        </div>
      )}

      {/* Itineraries grid */}
      {isLoading ? (
        <div className="dashboard__grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="itinerary-card itinerary-card--skeleton">
              <div className="shimmer" style={{ height: 120, borderRadius: 12 }} />
              <div style={{ padding: '16px' }}>
                <div className="shimmer" style={{ height: 18, borderRadius: 6, marginBottom: 10 }} />
                <div className="shimmer" style={{ height: 14, borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : itineraries.length === 0 ? (
        <div className="dashboard__empty">
          <div className="dashboard__empty-icon">🗺️</div>
          <h2>No itineraries yet</h2>
          <p>Upload your flight tickets, hotel bookings, or travel documents to generate a smart itinerary.</p>
          <Link to="/upload" className="dashboard__new-btn">
            <Plus size={18} /> Upload documents
          </Link>
        </div>
      ) : (
        <div className="dashboard__grid">
          {itineraries.map((item) => (
            <Link
              key={item._id}
              to={item.status === 'ready' ? `/itinerary/${item._id}` : '#'}
              className={`itinerary-card ${item.status !== 'ready' ? 'itinerary-card--processing' : ''}`}
            >
              <div className="itinerary-card__header">
                <StatusBadge status={item.status} />
                {item.status === 'ready' && (
                  <button
                    className="itinerary-card__delete"
                    onClick={(e) => handleDelete(item._id, e)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <h3 className="itinerary-card__title">{item.title}</h3>

              <div className="itinerary-card__meta">
                {item.destination && item.destination !== 'Processing...' && (
                  <span><MapPin size={13} /> {item.destination}</span>
                )}
                {item.totalDays > 0 && (
                  <span><Clock size={13} /> {item.totalDays} days</span>
                )}
                {item.startDate && (
                  <span>
                    <Calendar size={13} />
                    {item.startDate}
                  </span>
                )}
              </div>

              {item.status === 'processing' && (
                <div className="itinerary-card__progress">
                  <div className="itinerary-card__progress-bar" />
                </div>
              )}

              {item.status === 'ready' && (
                <div className="itinerary-card__footer">
                  <span>View itinerary</span>
                  <ArrowRight size={14} />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
