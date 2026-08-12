import { Meeting } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getMeetings(): Promise<Meeting[]> {
    const res = await fetch(`${API_URL}/meetings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return res.json();
}

export async function getMeeting(id: number): Promise<Meeting> {
    const res = await fetch(`${API_URL}/meetings/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch meeting');
    return res.json();
}

export async function updateActionItem(id: number, isCompleted: boolean) {
    const res = await fetch(`${API_URL}/action-items/${id}?is_completed=${isCompleted ? 1 : 0}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to update action item');
    return res.json();
}

export async function createMeeting(data: Partial<Meeting>) {
    const res = await fetch(`${API_URL}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create meeting');
    return res.json();
}

export async function updateMeeting(id: number, data: Partial<Meeting>) {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update meeting');
    return res.json();
}

export async function deleteMeeting(id: number) {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete meeting');
    return res.json();
}
