import { RowDataPacket } from 'mysql2';

export interface Photo extends RowDataPacket {
  id: string;
  sessionId: string;
  type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
} 