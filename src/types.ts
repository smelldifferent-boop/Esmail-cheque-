export interface Check {
  id: number;
  checkNumber: string;
  payeeName: string;
  customerName: string; // اسم العميل
  amount: number;
  currency: 'SAR' | 'USD' | 'GHS';
  amountInWords: string;
  issueDate: string; // تاريخ الإصدار
  dueDate: string;
  phoneNumbers: string[]; // List of alert phone numbers
  drawerName: string; // اسم الساحب
  drawnBank: string; // البنك المسحوب عليه
  depositedBank: string; // البنك المودع فيه
  accountNumber: string; // الحساب
  accountHolder: string; // صاحب الحساب المودع إليه
  representativeName: string; // المندوب
  representativePhone: string; // رقم المندوب
  drawerPhone?: string; // رقم هاتف الساحب
  status: 'pending' | 'paid';
  createdAt: string;
  paidDate?: string;
}

export interface Voucher {
  id: number;
  checkId: number;
  checkNumber: string;
  payeeName: string;
  amount: number;
  paymentDate: string;
}
