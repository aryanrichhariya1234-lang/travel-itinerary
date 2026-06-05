import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, Clock, Plane, Building2, Share2, Copy,
  CheckCheck, ArrowLeft, Link2, Trash2, Utensils, Eye,
  Landmark, Train, Palmtree, Star
} from 'lucide-react';
import './ItineraryPage.css';

const categoryIcon = (cat) => {
  const icons = {
    travel: <Plane size={14} />,
    accommodation: <Building2 size={14} />,
    sightseeing: <Landmark size={14} />,
    dining: <Utensils size={14} />,
    transport: <Train size={14} />,
    leisure: <Palmtree size={14} />,
  };
  return icons[cat] || <Star size={14} />;
};

const categoryColor = (cat) => {
  const colors = {
    travel: '#60a5fa',
    accommodation: '#a78bfa',
    sightseeing: 'var(--teal)',
    dining: 'var(--rose)',
    transport: '#94a3b8',
    leisure: '#34d399',
  };
  return colors[cat] || 'var(--text-soft)';
};

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => api.get(`/itineraries/${id}`).then((r) => r.data),
  });

  const itinerary = data?.itinerary;

  const handleShare = async () => {
    try {
      const { data } = await api.post(`/share/${id}/generate`);
      const url = `${window.location.origin}/shared/${data.shareToken}`;
      setShareUrl(url);
      toast.success('Share link generated!');
    } catch {
      toast.error('Failed to generate share link');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this itinerary permanently?')) return;
    try {
      await api.delete(`/itineraries/${id}`);
      toast.success('Deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="itin-loading">
        <div className="itin-loading__inner">
          <div className="shimmer" style={{ height: 32, width: 300, borderRadius: 8, marginBottom: 12 }} />
          <div className="shimmer" style={{ height: 20, width: 200, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="itin-error">
        <p>Itinerary not found.</p>
        <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    );
  }

  // Group activities by day
  const activitiesByDay = {};
  itinerary.activities?.forEach((a) => {
    const day = a.day || 1;
    if (!activitiesByDay[day]) activitiesByDay[day] = [];
    activitiesByDay[day].push(a);
  });

  const days = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="itin page-enter">
      {/* Back */}
      <button className="itin__back" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Dashboard
      </button>

      {/* Hero header */}
      <div className="itin__hero">
        <div className="itin__hero-content">
          <div className="itin__hero-tags">
            {itinerary.tags?.slice(0, 3).map((t) => (
              <span key={t} className="itin__tag">{t}</span>
            ))}
          </div>

          <h1 className="itin__title">{itinerary.title}</h1>

          <div className="itin__meta">
            <span><MapPin size={15} />{itinerary.destination}</span>
            {itinerary.startDate && <span><Calendar size={15} />{itinerary.startDate}</span>}
            {itinerary.totalDays > 0 && <span><Clock size={15} />{itinerary.totalDays} days</span>}
          </div>

          {itinerary.summary && (
            <p className="itin__summary">{itinerary.summary}</p>
          )}
        </div>

        {/* Actions */}
        <div className="itin__actions">
          <button className="itin__action-btn" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>
          <button className="itin__action-btn itin__action-btn--danger" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Share banner */}
      {shareUrl && (
        <div className="share-banner">
          <Link2 size={16} />
          <span className="share-banner__url">{shareUrl}</span>
          <button className="share-banner__copy" onClick={handleCopy}>
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Highlights */}
      {itinerary.highlights?.length > 0 && (
        <div className="itin__highlights">
          <h2 className="itin__section-title">Highlights</h2>
          <div className="itin__highlights-grid">
            {itinerary.highlights.map((h, i) => (
              <div key={i} className="highlight-chip">
                <Star size={13} className="highlight-chip__icon" />
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flights + Hotels */}
      {(itinerary.flights?.length > 0 || itinerary.hotels?.length > 0) && (
        <div className="itin__bookings">
          {itinerary.flights?.length > 0 && (
            <div className="booking-section">
              <h2 className="itin__section-title"><Plane size={18} /> Flights</h2>
              <div className="booking-cards">
                {itinerary.flights.map((f, i) => (
                  <div key={i} className="booking-card booking-card--flight">
                    <div className="flight-route">
                      <div className="flight-route__city">
                        <span className="flight-route__code">{f.from}</span>
                        <span className="flight-route__time">{f.departureTime}</span>
                        <span className="flight-route__date">{f.departureDate}</span>
                      </div>
                      <div className="flight-route__arrow">
                        <Plane size={16} />
                        <div className="flight-route__line" />
                      </div>
                      <div className="flight-route__city flight-route__city--right">
                        <span className="flight-route__code">{f.to}</span>
                        <span className="flight-route__time">{f.arrivalTime}</span>
                        <span className="flight-route__date">{f.arrivalDate}</span>
                      </div>
                    </div>
                    <div className="booking-card__details">
                      {f.airline && <span>{f.airline}</span>}
                      {f.flightNumber && <span>Flight {f.flightNumber}</span>}
                      {f.class && <span>{f.class}</span>}
                      {f.pnr && <span>PNR: {f.pnr}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itinerary.hotels?.length > 0 && (
            <div className="booking-section">
              <h2 className="itin__section-title"><Building2 size={18} /> Hotels</h2>
              <div className="booking-cards">
                {itinerary.hotels.map((h, i) => (
                  <div key={i} className="booking-card booking-card--hotel">
                    <h3>{h.name}</h3>
                    <p>{h.address || h.city}</p>
                    <div className="booking-card__details">
                      <span>Check-in: {h.checkIn}</span>
                      <span>Check-out: {h.checkOut}</span>
                      {h.nights > 0 && <span>{h.nights} nights</span>}
                      {h.roomType && <span>{h.roomType}</span>}
                      {h.confirmationNumber && <span>Conf: {h.confirmationNumber}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day-by-day itinerary */}
      {days.length > 0 && (
        <div className="itin__timeline">
          <h2 className="itin__section-title">Day-by-Day Plan</h2>

          {/* Day tabs */}
          <div className="day-tabs">
            {days.map((d) => (
              <button
                key={d}
                className={`day-tab ${activeDay === d ? 'day-tab--active' : ''}`}
                onClick={() => setActiveDay(d)}
              >
                Day {d}
                {activitiesByDay[d]?.[0]?.date && (
                  <span className="day-tab__date">{activitiesByDay[d][0].date}</span>
                )}
              </button>
            ))}
          </div>

          {/* Activities for active day */}
          <div className="timeline">
            {(activitiesByDay[activeDay] || []).map((act, i) => (
              <div key={i} className="timeline__item">
                <div className="timeline__time">
                  {act.time || '—'}
                </div>
                <div
                  className="timeline__dot"
                  style={{ background: categoryColor(act.category), boxShadow: `0 0 0 4px ${categoryColor(act.category)}22` }}
                />
                <div className="timeline__content">
                  <div className="timeline__header">
                    <span
                      className="timeline__category"
                      style={{ color: categoryColor(act.category), background: `${categoryColor(act.category)}18` }}
                    >
                      {categoryIcon(act.category)} {act.category}
                    </span>
                    {act.duration && <span className="timeline__duration">{act.duration}</span>}
                  </div>
                  <h3 className="timeline__title">{act.title}</h3>
                  {act.description && <p className="timeline__desc">{act.description}</p>}
                  {act.location && (
                    <p className="timeline__location">
                      <MapPin size={13} /> {act.location}
                    </p>
                  )}
                  {act.tips?.length > 0 && (
                    <div className="timeline__tips">
                      {act.tips.map((tip, j) => (
                        <p key={j} className="timeline__tip">💡 {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
