// Community Types - Groups, Events, Forum, Challenges, Jobs

export interface CommunityGroup {
    id: string;
    name: string;
    description: string;
    image: string;
    leader: string;
    leaderAvatar: string;
    membersCount: number;
    rolesNeeded: string[];
    tags: string[];
    status: 'Reclutando' | 'En Progreso' | 'Finalizado';
    postedTime: string;
    domain?: 'creative' | 'dev';
}

export interface EventItem {
    id: string;
    title: string;
    description: string;
    image: string;
    organizer: string;
    organizerAvatar: string;
    date: string;
    month: string;
    day: string;
    time: string;
    location: string;
    type: 'Webinar' | 'Workshop' | 'Conferencia' | 'Meetup' | 'Hackathon';
    price: number;
    attendees: number;
    category: string;
    domain?: 'creative' | 'dev';
}

export interface ForumReply {
    id: string;
    author: string;
    authorAvatar: string;
    content: string;
    date: string;
    isSolution?: boolean;
    votes: number;
}

export interface ForumPost {
    id: string;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    date: string;
    category: string;
    tags: string[];
    views: number;
    votes: number;
    replies: ForumReply[];
    isSolved: boolean;
    domain?: 'creative' | 'dev';
}

export interface ChallengeItem {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    sponsor?: string;
    sponsorLogo?: string;
    deadline: string;
    daysLeft: number;
    participants: number;
    prizes: string[];
    status: 'Active' | 'Voting' | 'Closed';
    tags: string[];
    domain?: 'creative' | 'dev';
}

export interface JobItem {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    location: string;
    type: 'Full-time' | 'Contract' | 'Remote' | 'Hybrid';
    level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
    postedAt: string;
    salary?: string;
    tags: string[];
    isFeatured?: boolean;
    domain?: 'creative' | 'dev';
}
