import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import {
  MapPin, Calendar, Clock, Plane, Building2, Compass,
  Landmark, Utensils, Train, Palmtree, Star, Eye
} from 'lucide-react';
import './SharedItineraryPage.css';

const categoryIcon = (cat) => {
  const icons = {
    travel: <Plane size={13} />, accommodation: <Building2 size={13} />,
    sightseeing: <Landmark size={13} />, dining: <Utensils size={13} />,
    transport: <Train size={13} />, leisure: <Palmtree size={13} />,
  };
  return icons[cat] || <Star size={13} />;
};

const categoryColor = (cat) => ({
  travel: '#60a5fa', accommodation: '#a78bfa', sightseeing: 'var(--teal)',
  dining: 'var(--rose)', transport: '#94a3b8', leisure: '#34d399',
}[cat] || 'var(--text-soft)');

export default function SharedItineraryPage() {
  const { token } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => api.get(`/share/${token}`).then((r) => r.data),
  });

  const itinerary = data?.itinerary;

  if (isLoading) {
    return (
      <div className="shared-page">
        <div className="shared-loading">
          <Compass size={32} className="shared-loading__icon" />
          <p>Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="shared-page">
        <div className="shared-error">
          <h2>Itinerary not found</h2>
          <p>This link may have been revoked or is invalid.</p>
          <Link to="/login" className="shared-cta">Create your own →</Link>
        </div>
      </div>
    );
  }

  const activitiesByDay = {};
  itinerary.activities?.forEach((a) => {
    const day = a.day || 1;
    if (!activitiesByDay[day]) activitiesByDay[day] = [];
    activitiesByDay[day].push(a);
  });

  const days = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="shared-page">
      {/* Top bar */}
      <header className="shared-topbar">
        <div className="shared-topbar__brand">
          <Compass size={22} />
          <span>Wandr</span>
        </div>
        <div className="shared-topbar__right">
          {itinerary.shareViewCount > 0 && (
            <span className="shared-views">
              <Eye size={14} /> {itinerary.shareViewCount} views
            </span>
          )}
          <Link to="/register" className="shared-topbar__cta">
            Create your own →
          </Link>
        </div>
      </header>

      <div className="shared-content">
        {/* Hero */}
        <div className="shared-hero">
          {itinerary.tags?.length > 0 && (
            <div className="shared-hero__tags">
              {itinerary.tags.slice(0, 4).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}

          <h1 className="shared-hero__title">{itinerary.title}</h1>

          <div className="shared-hero__meta">
            <span><MapPin size={15} />{itinerary.destination}</span>
            {itinerary.startDate && <span><Calendar size={15} />{itinerary.startDate}</span>}
            {itinerary.totalDays > 0 && <span><Clock size={15} />{itinerary.totalDays} days</span>}
          </div>

          {itinerary.summary && (
            <p className="shared-hero__summary">{itinerary.summary}</p>
          )}

          {itinerary.user && (
            <div className="shared-hero__author">
              <div className="shared-hero__avatar">
                {itinerary.user.name?.[0]?.toUpperCase()}
              </div>
              <span>Planned by <strong>{itinerary.user.name}</strong></span>
            </div>
          )}
        </div>

        {/* Highlights */}
        {itinerary.highlights?.length > 0 && (
          <div className="shared-section">
            <h2>✨ Highlights</h2>
            <div className="shared-highlights">
              {itinerary.highlights.map((h, i) => (
                <div key={i} className="shared-highlight">{h}</div>
              ))}
            </div>
          </div>
        )}

        {/* Flights */}
        {itinerary.flights?.length > 0 && (
          <div className="shared-section">
            <h2><Plane size={18} /> Flights</h2>
            <div className="shared-cards">
              {itinerary.flights.map((f, i) => (
                <div key={i} className="shared-flight-card">
                  <div className="shared-route">
                    <div><strong>{f.from}</strong><br /><small>{f.departureTime}</small></div>
                    <div className="shared-route__arrow">✈</div>
                    <div className="shared-route__right"><strong>{f.to}</strong><br /><small>{f.arrivalTime}</small></div>
                  </div>
                  <div className="shared-card-meta">
                    {f.airline && <span>{f.airline}</span>}
                    {f.flightNumber && <span>#{f.flightNumber}</span>}
                    {f.departureDate && <span>{f.departureDate}</span>}
                    {f.class && <span>{f.class}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {itinerary.hotels?.length > 0 && (
          <div className="shared-section">
            <h2><Building2 size={18} /> Hotels</h2>
            <div className="shared-cards">
              {itinerary.hotels.map((h, i) => (
                <div key={i} className="shared-hotel-card">
                  <h3>{h.name}</h3>
                  {h.address && <p>{h.address}</p>}
                  <div className="shared-card-meta">
                    <span>Check-in: {h.checkIn}</span>
                    <span>Check-out: {h.checkOut}</span>
                    {h.nights > 0 && <span>{h.nights} nights</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily timeline */}
        {days.map((day) => (
          <div key={day} className="shared-section">
            <h2>Day {day} {activitiesByDay[day]?.[0]?.date ? `· ${activitiesByDay[day][0].date}` : ''}</h2>
            <div className="shared-timeline">
              {activitiesByDay[day].map((act, i) => (
                <div key={i} className="shared-timeline__item">
                  <div className="shared-timeline__time">{act.time || '—'}</div>
                  <div
                    className="shared-timeline__dot"
                    style={{ background: categoryColor(act.category) }}
                  />
                  <div className="shared-timeline__content">
                    <div className="shared-timeline__cat" style={{ color: categoryColor(act.category) }}>
                      {categoryIcon(act.category)} {act.category}
                    </div>
                    <h4>{act.title}</h4>
                    {act.description && <p>{act.description}</p>}
                    {act.location && (
                      <p className="shared-timeline__loc"><MapPin size={12} /> {act.location}</p>
                    )}
                    {act.tips?.map((t, j) => (
                      <p key={j} className="shared-timeline__tip">💡 {t}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Footer */}
        <div className="shared-footer">
          <h2>Plan your own trip with AI</h2>
          <p>Upload your booking documents and get a full itinerary in minutes.</p>
          <Link to="/register" className="shared-cta-btn">Get started free →</Link>
        </div>
      </div>
    </div>
  );
}
