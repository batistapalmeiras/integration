export interface PersonNote {
  id: string;
  body: string;
  createdAt: string;
  authorName: string | null;
  private: boolean;
}
