export type Role = "ADMIN" | "OFFICER";

export type User = {
  id: number;
  username: string;
  role: Role;
};

export type RackStatus = "AVAILABLE" | "OCCUPIED";

export type TransactionStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

export type Rack = {
  id: number;
  code: string;
  status: RackStatus;
};

export type Transaction = {
  id: number;
  ticketCode: string;
  qrToken: string;
  plateNumber: string;
  rackId: number;
  officerId: number;
  status: TransactionStatus;
  checkInAt: string;
  checkOutAt: string | null;
  rack: Rack;
};

export type DailyReport = {
  id: number;
  reportDate: string;
  totalTransactions: number;
  completedTransactions: number;
  activeTransactions: number;
  transactions: Transaction[];
};
