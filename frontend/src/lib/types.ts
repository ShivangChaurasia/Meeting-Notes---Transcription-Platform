export interface TranscriptSegment {
    id: number;
    meeting_id: number;
    start_time: number;
    end_time: number;
    speaker: string;
    text: string;
}

export interface Summary {
    id: number;
    meeting_id: number;
    text: string;
}

export interface ActionItem {
    id: number;
    meeting_id: number;
    assignee: string;
    task: string;
    is_completed: number;
}

export interface Topic {
    id: number;
    meeting_id: number;
    name: string;
    start_time: number;
}

export interface Meeting {
    id: number;
    title: string;
    date: string;
    duration: number;
    participants: string;
    segments: TranscriptSegment[];
    summaries: Summary[];
    action_items: ActionItem[];
    topics: Topic[];
}
