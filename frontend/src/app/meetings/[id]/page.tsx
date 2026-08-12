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
    return <div className="page-container">Loading workspace...</div>;
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
        // Using window.alert because router.push might immediately transition away from toast, but we can try toast then route
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
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: 'white', padding: '12px 20px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast.message}
        </div>
      )}

      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', 
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{width: '500px', maxWidth: '90%'}}>
            <h2 className="section-title">Edit Meeting</h2>
            <form onSubmit={handleEditMeeting} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '4px'}}>Title</label>
                <input required value={editTitle} onChange={e => setEditTitle(e.target.value)} type="text" style={{width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '4px'}}>Participants</label>
                <input required value={editParticipants} onChange={e => setEditParticipants(e.target.value)} type="text" style={{width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header" style={{marginBottom: '16px'}}>
        <div>
          <Link href="/" style={{color: 'var(--accent-color)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px'}}>
            &larr; Back to Meetings
          </Link>
          <h1 className="page-title">{meeting.title}</h1>
          <div className="meeting-meta" style={{marginTop: '4px'}}>
            <span>{new Date(meeting.date).toLocaleDateString()}</span>
            <span>&bull;</span>
            <span>{formatTime(meeting.duration)}</span>
            <span>&bull;</span>
            <span>{meeting.participants}</span>
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>Edit</button>
          <button className="btn" style={{background: 'var(--danger)'}} onClick={handleDeleteMeeting}>Delete</button>
        </div>
      </div>

      <div className="meeting-workspace">
        <div className="transcript-section">
          <div className="audio-player">
            <button className="play-button" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? '⏸' : '▶'}
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
            <input 
              type="text" 
              placeholder="Search transcript..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    <div className="segment-speaker">{segment.speaker}</div>
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
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Summary
            </div>
            {meeting.summaries.map(s => (
              <p key={s.id} className="summary-text">{s.text}</p>
            ))}
          </div>

          <div className="card">
            <div className="section-title">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
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
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              Topics
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {meeting.topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="badge" 
                  style={{cursor: 'pointer'}}
                  onClick={() => handleSegmentClick(topic.start_time)}
                >
                  {topic.name} ({formatTime(topic.start_time)})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
