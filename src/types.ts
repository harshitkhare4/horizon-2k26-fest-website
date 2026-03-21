export interface SubEvent {
  id: string;
  name: string;
  isTeamOnly?: boolean;
  isSoloOnly?: boolean;
  isBoth?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export interface Event {
  id: string;
  name: string;
  day: number;
  category?: string;
  subEvents?: SubEvent[];
  isTeamOnly?: boolean;
  isSoloOnly?: boolean;
  isBoth?: boolean;
  soloFee?: number;
  teamFee?: number;
  perMemberFee?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export interface RegistrationEvent {
  eventId: string;
  subEventId?: string;
  type: 'solo' | 'team';
  teamName?: string;
  teamSize?: number;
  boysCount?: number;
  girlsCount?: number;
  songName?: string;
  members?: string[];
  fee: number;
}

export interface Registration {
  id?: string;
  fullName: string;
  collegeName: string;
  branch: string;
  year: string;
  phoneNumber: string;
  email: string;
  events: RegistrationEvent[];
  totalAmount: number;
  transactionId: string;
  paymentScreenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationId: string;
  createdAt: string;
}
