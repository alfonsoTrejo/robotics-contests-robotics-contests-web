export type Role = "ADMIN" | "STUDENT";

export type ContestStatus = "OPEN" | "CLOSED";
export type WinnerPosition = "FIRST" | "SECOND" | "THIRD";

export type User = {
  id: string;
  name?: string;
  email: string;
  role: Role;
};

export type Contest = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: ContestStatus;
};

export type Modality = {
  id: string;
  name: string;
  description: string;
  contestId: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
};

export type Team = {
  id: string;
  name: string;
  contestId: string;
  modalityId: string;
  members?: TeamMember[];
  createdAt?: string;
};

export type Winner = {
  id: string;
  teamId: string;
  modalityId: string;
  position: WinnerPosition;
};

export type StudentHistoryItem = {
  id: string;
  name: string;
  createdAt: string;
  contest: {
    id: string;
    title: string;
    status: ContestStatus;
  };
  modality: {
    id: string;
    name: string;
  };
  members: TeamMember[];
  winner?: {
    id: string;
    position: WinnerPosition;
    modalityId: string;
    certificateUrl: string;
  };
};
