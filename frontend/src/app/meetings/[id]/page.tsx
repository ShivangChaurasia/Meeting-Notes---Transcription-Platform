"use client";

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { getMeeting, updateActionItem, updateMeeting, deleteMeeting } from '../../../lib/api';
import { Meeting } from '../../../lib/types';
import { useRouter } from 'next/navigation';

export default function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = parseInt(resolvedParams.id, 10);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit & Delete state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editParticipants, setEditParticipants] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const playerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getMeeting(meetingId).then(data => {
      setMeeting(data);
      setEditTitle(data.title);
      setEditParticipants(data.participants);
      setLoading(false);
    }).catch(console.error);
  }, [meetingId]);

  // Simulated Player Logic
  useEffect(() => {
    if (isPlaying) {
      playerInterval.current = setInterval(() => {
        setCurrentTime(t => {
          if (meeting && t >= meeting.duration) {
            setIsPlaying(false);
            return meeting.duration;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (playerInterval.current) clearInterval(playerInterval.current);
    }
    return () => {
      if (playerInterval.current) clearInterval(playerInterval.current);
    };
  }, [isPlaying, meeting]);

  // Sync Transcript to Player
  useEffect(() => {
    if (activeSegmentRef.current && isPlaying) {
      activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, isPlaying]);

  if (loading || !meeting) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>
        <div style={{width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
        Loading meeting workspace...
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    setCurrentTime(Math.floor(ratio * meeting.duration));
  };

  const handleSegmentClick = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  const handleActionToggle = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await updateActionItem(id, newStatus === 1);
      setMeeting({
        ...meeting,
        action_items: meeting.action_items.map(ai => 
          ai.id === id ? { ...ai, is_completed: newStatus } : ai
        )
      });
      showToast('Action item updated', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update action item', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await updateMeeting(meeting.id, {
        title: editTitle,
        participants: editParticipants
      });
      setMeeting({ ...meeting, title: updated.title, participants: updated.participants });
      setIsEditModalOpen(false);
      showToast('Meeting updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update meeting', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (confirm('Are you sure you want to delete this meeting? This cannot be undone.')) {
      try {
        await deleteMeeting(meeting.id);
        window.alert('Meeting deleted successfully.');
        router.push('/');
      } catch (err) {
        showToast('Failed to delete meeting', 'error');
      }
    }
  };

  return (
    <div className="page-container" style={{display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0, position: 'relative'}}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{width: '500px', maxWidth: '90%'}}>
            <h2 className="section-title">Edit Meeting Details</h2>
            <form onSubmit={handleEditMeeting} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500}}>Title</label>
                <input required value={editTitle} onChange={e => setEditTitle(e.target.value)} type="text" className="search-input" style={{borderRadius: '8px', padding: '10px 16px'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500}}>Participants</label>
                <input required value={editParticipants} onChange={e => setEditParticipants(e.target.value)} type="text" className="search-input" style={{borderRadius: '8px', padding: '10px 16px'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <Link href="/" style={{color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontWeight: 500}}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Meetings
          </Link>
          <h1 className="page-title">{meeting.title}</h1>
          <div className="meeting-meta" style={{marginTop: '8px'}}>
            <span className="badge">{new Date(meeting.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
            <span>&bull;</span>
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {formatTime(meeting.duration)}
            </span>
            <span>&bull;</span>
            <div className="participant-avatars" style={{display: 'inline-flex', verticalAlign: 'middle'}}>
              {meeting.participants.split(',').map((p, i) => (
                <div key={i} className="avatar" title={p.trim()} style={{width: 24, height: 24, fontSize: '0.65rem'}}>
                  {p.trim().charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>Edit</button>
          <button className="btn" style={{background: 'var(--danger)', color: 'white'}} onClick={handleDeleteMeeting}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <div className="meeting-workspace">
        <div className="transcript-section">
          <div className="audio-player">
            <button className="play-button" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? (
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"></path></svg>
              ) : (
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              )}
            </button>
            <div className="progress-container">
              <div className="progress-bar-bg" onClick={handleSeek}>
                <div 
                  className="progress-bar-fill" 
                  style={{width: `${(currentTime / meeting.duration) * 100}%`}} 
                />
              </div>
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(meeting.duration)}</span>
              </div>
            </div>
          </div>

          <div className="transcript-search">
            <div className="search-container" style={{width: '100%'}}>
              <svg className="search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                className="search-input"
                placeholder="Search within transcript..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="transcript-list" ref={transcriptRef}>
            {meeting.segments.map(segment => {
              const isActive = currentTime >= segment.start_time && currentTime < segment.end_time;
              const matchesSearch = searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase());
              
              const highlightText = (text: string, query: string) => {
                if (!query) return text;
                const parts = text.split(new RegExp(`(${query})`, 'gi'));
                return parts.map((part, i) => 
                  part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
                );
              };

              return (
                <div 
                  key={segment.id}
                  ref={isActive ? activeSegmentRef : null}
                  className={`transcript-segment ${isActive ? 'active' : ''}`}
                  onClick={() => handleSegmentClick(segment.start_time)}
                >
                  <div className="segment-time">{formatTime(segment.start_time)}</div>
                  <div className="segment-content">
                    <div className="segment-speaker" style={{color: segment.speaker === 'Host' ? 'var(--accent-color)' : 'var(--text-primary)'}}>
                      {segment.speaker}
                    </div>
                    <div className="segment-text">
                      {matchesSearch ? highlightText(segment.text, searchQuery) : segment.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="card">
            <div className="section-title">
              <svg width="20" height="20" fill="none" stroke="var(--accent-color)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Summary
            </div>
            {meeting.summaries.map(s => (
              <p key={s.id} className="summary-text">{s.text}</p>
            ))}
          </div>

          <div className="card">
            <div className="section-title">
              <svg width="20" height="20" fill="none" stroke="var(--success)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              Action Items
            </div>
            <div>
              {meeting.action_items.map(ai => (
                <div key={ai.id} className={`action-item ${ai.is_completed ? 'completed' : ''}`}>
                  <input 
                    type="checkbox" 
                    className="action-checkbox" 
                    checked={ai.is_completed === 1}
                    onChange={() => handleActionToggle(ai.id, ai.is_completed)}
                  />
                  <div className="action-content">
                    <div className="action-task">{ai.task}</div>
                    <div className="action-assignee">@{ai.assignee}</div>
                  </div>
                </div>
              ))}
              {meeting.action_items.length === 0 && (
                <p className="summary-text" style={{fontSize: '0.875rem'}}>No action items found.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              <svg width="20" height="20" fill="none" stroke="var(--warning)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              Key Topics
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {meeting.topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="badge" 
                  style={{cursor: 'pointer', background: 'var(--surface-hover)'}}
                  onClick={() => handleSegmentClick(topic.start_time)}
                >
                  {topic.name} <span style={{color: 'var(--text-muted)', marginLeft: '4px'}}>{formatTime(topic.start_time)}</span>
                </div>
              ))}
              {meeting.topics.length === 0 && (
                <p className="summary-text" style={{fontSize: '0.875rem'}}>No topics found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
