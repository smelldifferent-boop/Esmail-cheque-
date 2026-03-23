/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, List, CheckCircle2, Trash2, AlertCircle, Bell, Phone, DollarSign, Calendar, Hash, User, X, FileText, Download, Building2, CreditCard, UserCheck, MessageSquare, Image as ImageIcon, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Voucher } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as htmlToImage from 'html-to-image';

// Custom number to words implementation for Arabic and English
const numberToWordsAr = (num: number): string => {
  const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
  const teens = ["أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  
  if (num === 0) return "صفر";
  if (num > 9999999) return num.toString(); // Fallback for very large numbers

  const convert = (n: number): string => {
    if (n === 0) return "";
    if (n <= 10) return units[n];
    if (n < 20) return teens[n - 11];
    if (n < 100) {
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      return (unit > 0 ? units[unit] + " و" : "") + tens[ten];
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return hundreds[hundred] + (remainder > 0 ? " و" + convert(remainder) : "");
    }
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      let thousandWord = "ألف";
      if (thousand === 2) thousandWord = "ألفين";
      else if (thousand >= 3 && thousand <= 10) thousandWord = convert(thousand) + " آلاف";
      else thousandWord = convert(thousand) + " ألف";
      
      return thousandWord + (remainder > 0 ? " و" + convert(remainder) : "");
    }
    const million = Math.floor(n / 1000000);
    const remainder = n % 1000000;
    let millionWord = "مليون";
    if (million === 2) millionWord = "مليونين";
    else if (million >= 3 && million <= 10) millionWord = convert(million) + " ملايين";
    else millionWord = convert(million) + " مليون";
    
    return millionWord + (remainder > 0 ? " و" + convert(remainder) : "");
  };

  return convert(Math.floor(num));
};

const numberToWordsEn = (num: number): string => {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const scales = ['', 'thousand', 'million', 'billion'];

  if (num === 0) return 'zero';

  const convertChunk = (n: number): string => {
    let res = '';
    if (n >= 100) {
      res += units[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      res += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + units[n % 10] : '');
    } else if (n > 0) {
      res += units[n];
    }
    return res.trim();
  };

  let res = '';
  let scaleIdx = 0;
  let tempNum = Math.floor(num);
  while (tempNum > 0) {
    const chunk = tempNum % 1000;
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk);
      res = chunkWords + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '') + (res ? ' ' + res : '');
    }
    tempNum = Math.floor(tempNum / 1000);
    scaleIdx++;
  }
  return res.trim();
};

const PhoneInput = ({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  icon, 
  language, 
  t 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string, 
  label: string, 
  icon: any, 
  language: string, 
  t: any 
}) => {
  const [countryCode, setCountryCode] = useState('+233');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (value) {
      const codes = ['+966', '+967', '+233', '+1'];
      const foundCode = codes.find(c => value.startsWith(c));
      if (foundCode) {
        setCountryCode(foundCode);
        setPhoneNumber(value.replace(foundCode, ''));
      } else {
        setPhoneNumber(value);
      }
    } else {
      setPhoneNumber('');
    }
  }, [value]);

  const handlePhoneChange = (newPhone: string) => {
    setPhoneNumber(newPhone);
    onChange(countryCode + newPhone);
  };

  const handleCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    onChange(newCode + phoneNumber);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-xs"
        >
          <option value="+966">🇸🇦 +966</option>
          <option value="+967">🇾🇪 +967</option>
          <option value="+233">🇬🇭 +233</option>
          <option value="+1">🇺🇸 +1</option>
        </select>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
        />
      </div>
    </div>
  );
};

export default function App() {
  const [checks, setChecks] = useState<Check[]>(() => {
    try {
      const saved = localStorage.getItem('checks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading checks:", e);
      return [];
    }
  });
  
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'ar' | 'en') || 'ar';
  });

  const translations = {
    ar: {
      title: "مدير الشيكات",
      subtitle: "Check Manager Pro",
      addTab: "إضافة شيك",
      listTab: "قائمة الشيكات",
      addNewCheck: "إضافة شيك جديد",
      checkNumber: "رقم الشيك",
      payeeName: "اسم المستفيد",
      customerName: "اسم العميل",
      amount: "المبلغ",
      amountInWords: "المبلغ بالحروف",
      issueDate: "تاريخ الإصدار",
      dueDate: "تاريخ الاستحقاق",
      drawerName: "اسم الساحب",
      drawnBank: "البنك المسحوب عليه",
      depositedBank: "البنك المودع فيه",
      accountNumber: "رقم الحساب",
      accountHolder: "صاحب الحساب",
      representativeName: "المندوب",
      representativePhone: "رقم المندوب",
      phoneAlert: "أرقام الهواتف للتنبيه (افصل بفاصلة)",
      saveCheck: "حفظ الشيك",
      checkList: "قائمة الشيكات",
      exportPDF: "تصدير PDF",
      total: "إجمالي",
      filterStatus: "تصفية حسب الحالة",
      sortBy: "ترتيب حسب",
      sortOrder: "اتجاه الترتيب",
      all: "الكل",
      pending: "في الانتظار",
      paid: "تم الدفع",
      id: "تاريخ الإضافة",
      date: "تاريخ الاستحقاق",
      name: "اسم المستفيد",
      desc: "تنازلي",
      asc: "تصاعدي",
      noChecks: "لا توجد شيكات مضافة حالياً",
      paidOn: "تم الدفع في",
      markAsPaid: "تسجيل الدفع",
      delete: "حذف",
      smsReminder: "إرسال رسالة تذكير SMS",
      whatsappReminder: "إرسال رسالة تذكير WhatsApp",
      successSave: "✅ تم حفظ الشيك بنجاح",
      errorFill: "الرجاء ملء جميع الحقول المطلوبة",
      successPaid: "✅ تم تسجيل الدفع للشيك رقم",
      successExport: "✅ تم تصدير الملف بنجاح",
      errorExport: "❌ فشل تصدير الملف",
      overdue: "متأخر",
      daysLeft: "يتبقى",
      days: "يوم",
      waiting: "في الانتظار",
      footer: "مدير الشيكات الذكي - جميع الحقوق محفوظة",
      currency: "العملة",
      placeholderCheckNum: "مثال: 123456",
      placeholderPayee: "اسم المستفيد بالكامل",
      placeholderCustomer: "اسم العميل",
      placeholderAmountWords: "مثال: ألف ريال فقط",
      placeholderDrawer: "اسم محرر الشيك",
      placeholderDrawnBank: "اسم بنك الساحب",
      placeholderDepositedBank: "اسم بنك الإيداع",
      placeholderAccountNum: "رقم الحساب المودع إليه",
      placeholderAccountHolder: "اسم صاحب الحساب",
      placeholderRepName: "اسم المندوب",
      placeholderRepPhone: "رقم هاتف المندوب",
      placeholderPhone: "أدخل رقم الهاتف",
      addPhone: "إضافة رقم تنبيه",
      exportImage: "تصدير كصورة",
      shareWhatsApp: "مشاركة عبر واتساب",
      repNotification: "تم إرسال تنبيه للمندوب بنجاح",
      autoAlerts: "تنبيه تلقائي لجميع الأرقام",
      managerPhone: "رقم هاتف المدير للتنبيهات",
      managerNotification: "تم إرسال تنبيه للمدير بنجاح",
      placeholderManagerPhone: "أدخل رقم هاتف المدير",
      managerAlertMsg: "تمت إضافة شيك جديد للمتابعة من قبل المدير",
      drawerPhone: "رقم هاتف الساحب",
      placeholderDrawerPhone: "أدخل رقم هاتف الساحب",
      searchPlaceholder: "البحث في الشيكات (رقم، مستفيد، عميل، بنك...)",
      countrySaudi: "السعودية (+966)",
      countryYemen: "اليمن (+967)",
      countryGhana: "غانا (+233)",
      countryUSA: "أمريكا (+1)",
    },
    en: {
      title: "Check Manager",
      subtitle: "Check Manager Pro",
      addTab: "Add Check",
      listTab: "Check List",
      addNewCheck: "Add New Check",
      checkNumber: "Check Number",
      payeeName: "Payee Name",
      customerName: "Customer Name",
      amount: "Amount",
      amountInWords: "Amount in Words",
      issueDate: "Issue Date",
      dueDate: "Due Date",
      drawerName: "Drawer Name",
      drawnBank: "Drawn Bank",
      depositedBank: "Deposited Bank",
      accountNumber: "Account Number",
      accountHolder: "Account Holder",
      representativeName: "Representative",
      representativePhone: "Rep. Phone",
      phoneAlert: "Phone Numbers for Alerts (comma separated)",
      saveCheck: "Save Check",
      checkList: "Check List",
      exportPDF: "Export PDF",
      total: "Total",
      filterStatus: "Filter by Status",
      sortBy: "Sort by",
      sortOrder: "Sort Order",
      all: "All",
      pending: "Pending",
      paid: "Paid",
      id: "Date Added",
      date: "Due Date",
      name: "Payee Name",
      desc: "Descending",
      asc: "Ascending",
      noChecks: "No checks added yet",
      paidOn: "Paid on",
      markAsPaid: "Mark as Paid",
      delete: "Delete",
      smsReminder: "Send SMS Reminder",
      whatsappReminder: "Send WhatsApp Reminder",
      successSave: "✅ Check saved successfully",
      errorFill: "Please fill all required fields",
      successPaid: "✅ Payment recorded for check #",
      successExport: "✅ File exported successfully",
      errorExport: "❌ Failed to export file",
      overdue: "Overdue",
      daysLeft: "Days left",
      days: "days",
      waiting: "Waiting",
      footer: "Smart Check Manager - All rights reserved",
      currency: "Currency",
      placeholderCheckNum: "e.g., 123456",
      placeholderPayee: "Full payee name",
      placeholderCustomer: "Customer name",
      placeholderAmountWords: "e.g., One thousand riyals only",
      placeholderDrawer: "Check issuer name",
      placeholderDrawnBank: "Drawer's bank name",
      placeholderDepositedBank: "Deposit bank name",
      placeholderAccountNum: "Deposit account number",
      placeholderAccountHolder: "Account holder name",
      placeholderRepName: "Representative name",
      placeholderRepPhone: "Representative phone",
      placeholderPhone: "Enter phone number",
      addPhone: "Add Alert Number",
      exportImage: "Export as Image",
      shareWhatsApp: "Share via WhatsApp",
      repNotification: "Representative notified successfully",
      autoAlerts: "Auto-alert all numbers",
      managerPhone: "Manager Phone for Alerts",
      managerNotification: "Manager notified successfully",
      placeholderManagerPhone: "Enter manager phone number",
      managerAlertMsg: "New check added for manager follow-up",
      drawerPhone: "Drawer Phone",
      placeholderDrawerPhone: "Enter drawer phone number",
      searchPlaceholder: "Search checks (number, payee, customer, bank...)",
      countrySaudi: "Saudi (+966)",
      countryYemen: "Yemen (+967)",
      countryGhana: "Ghana (+233)",
      countryUSA: "USA (+1)",
    }
  };

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  
  // Sort and Filter state
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [notifiedChecks, setNotifiedChecks] = useState<Set<number>>(new Set());
  
  // Form state
  const [checkNumber, setCheckNumber] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [currency, setCurrency] = useState<'SAR' | 'USD' | 'GHS'>('GHS');
  const [amountInWords, setAmountInWords] = useState('');
  const [drawerName, setDrawerName] = useState('');
  const [drawnBank, setDrawnBank] = useState('');
  const [depositedBank, setDepositedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativePhone, setRepresentativePhone] = useState('');
  const [drawerPhone, setDrawerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [managerPhone, setManagerPhone] = useState(() => {
    return localStorage.getItem('managerPhone') || '';
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  const [isExporting, setIsExporting] = useState(false);

  // Persist manager phone
  useEffect(() => {
    localStorage.setItem('managerPhone', managerPhone);
  }, [managerPhone]);

  // Automatic amount in words
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setAmountInWords('');
      return;
    }

    try {
      const num = parseFloat(amount);
      const words = language === 'ar' ? numberToWordsAr(num) : numberToWordsEn(num);
      
      let currencyName = '';
      if (language === 'ar') {
        if (currency === 'SAR') currencyName = 'ريال سعودي';
        else if (currency === 'USD') currencyName = 'دولار أمريكي';
        else if (currency === 'GHS') currencyName = 'سيدي غاني';
        setAmountInWords(`${words} ${currencyName} فقط لا غير`);
      } else {
        if (currency === 'SAR') currencyName = 'Saudi Riyals';
        else if (currency === 'USD') currencyName = 'US Dollars';
        else if (currency === 'GHS') currencyName = 'Ghanaian Cedis';
        setAmountInWords(`${words} ${currencyName} only`);
      }
    } catch (e) {
      console.error("Error converting number to words:", e);
    }
  }, [amount, currency, language]);

  // Persist checks
  useEffect(() => {
    try {
      localStorage.setItem('checks', JSON.stringify(checks));
    } catch (e) {
      console.error("Error saving checks:", e);
      showToast('خطأ في حفظ البيانات في الذاكرة المحلية', 'error');
    }
  }, [checks]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      tomorrow.setHours(0, 0, 0, 0);

      checks.forEach(check => {
        if (check.status === 'paid' || notifiedChecks.has(check.id)) return;

        const due = new Date(check.dueDate);
        due.setHours(0, 0, 0, 0);

        // If due date is tomorrow (24 hours away)
        if (due.getTime() === tomorrow.getTime()) {
          const message = `⏰ تنبيه: الشيك رقم ${check.checkNumber} للمستفيد ${check.payeeName} يستحق غداً!`;
          
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('تنبيه استحقاق شيك', { body: message });
          }
          
          showToast(message, 'success');
          setNotifiedChecks(prev => new Set(prev).add(check.id));
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, [checks, notifiedChecks]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addCheck = () => {
    if (!checkNumber || !payeeName || !amount || !dueDate) {
      showToast(t.errorFill, 'error');
      return;
    }

    const newCheck: Check = {
      id: Date.now(),
      checkNumber,
      payeeName,
      customerName,
      amount: parseFloat(amount),
      currency,
      amountInWords,
      issueDate,
      dueDate,
      phoneNumbers: phoneNumbers.filter(p => p.trim() !== ''),
      drawerName,
      drawerPhone,
      drawnBank,
      depositedBank,
      accountNumber,
      accountHolder,
      representativeName,
      representativePhone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setChecks(prev => [...prev, newCheck]);
    
    // Notify representative
    if (representativePhone) {
      notifyRepresentative(newCheck);
    }

    // Notify manager
    if (managerPhone) {
      notifyManager(newCheck);
    }

    // Notify drawer
    if (drawerPhone) {
      notifyDrawer(newCheck);
    }

    // Reset form
    setCheckNumber('');
    setPayeeName('');
    setCustomerName('');
    setAmount('');
    setCurrency('SAR');
    setAmountInWords('');
    setIssueDate('');
    setDueDate('');
    setPhoneNumbers(['']);
    setDrawerName('');
    setDrawerPhone('');
    setDrawnBank('');
    setDepositedBank('');
    setAccountNumber('');
    setAccountHolder('');
    setRepresentativeName('');
    setRepresentativePhone('');
    
    showToast(t.successSave);
    setActiveTab('list');
  };

  const sendReminderSMS = (check: Check) => {
    const allPhones = [...(check.phoneNumbers || [])];
    if (check.representativePhone) allPhones.push(check.representativePhone);

    if (allPhones.length === 0) {
      showToast(language === 'ar' ? 'لا توجد أرقام هواتف مسجلة لهذا الشيك' : 'No phone numbers registered for this check', 'error');
      return;
    }
    const message = language === 'ar'
      ? `⏰ تنبيه من مدير الشيكات: الشيك رقم ${check.checkNumber} بمبلغ ${check.amount} ${check.currency} يستحق غداً (${check.dueDate}). يرجى التأكد من توفر الرصيد.`
      : `⏰ Check Manager Alert: Check #${check.checkNumber} with amount ${check.amount} ${check.currency} is due tomorrow (${check.dueDate}). Please ensure funds are available.`;
    
    allPhones.forEach(num => {
      const cleanNum = num.replace(/\D/g, '');
      window.open(`sms:${cleanNum}?body=${encodeURIComponent(message)}`, '_blank');
    });
  };

  const sendReminderWhatsApp = (check: Check) => {
    const allPhones = [...(check.phoneNumbers || [])];
    if (check.representativePhone) allPhones.push(check.representativePhone);

    if (allPhones.length === 0) {
      showToast(language === 'ar' ? 'لا توجد أرقام هواتف مسجلة لهذا الشيك' : 'No phone numbers registered for this check', 'error');
      return;
    }
    const message = language === 'ar'
      ? `⏰ *تنبيه من مدير الشيكات*\n\nالشيك رقم: *${check.checkNumber}*\nالمبلغ: *${check.amount} ${check.currency}*\nالمستفيد: *${check.payeeName}*\nتاريخ الاستحقاق: *${check.dueDate}*\n\n_يرجى التأكد من توفر الرصيد في الحساب._`
      : `⏰ *Check Manager Alert*\n\nCheck Number: *${check.checkNumber}*\nAmount: *${check.amount} ${check.currency}*\nPayee: *${check.payeeName}*\nDue Date: *${check.dueDate}*\n\n_Please ensure funds are available in the account._`;
    
    allPhones.forEach(num => {
      const cleanNum = num.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
    });
  };

  const markAsPaid = (id: number) => {
    setChecks(prev => prev.map(check => {
      if (check.id === id) {
        const updatedCheck = { 
          ...check, 
          status: 'paid' as const, 
          paidDate: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') 
        };
        
        try {
          // Create voucher
          const voucher: Voucher = {
            id: Date.now(),
            checkId: check.id,
            checkNumber: check.checkNumber,
            payeeName: check.payeeName,
            amount: check.amount,
            paymentDate: new Date().toISOString(),
          };
          
          const vouchersStr = localStorage.getItem('vouchers');
          const vouchers = vouchersStr ? JSON.parse(vouchersStr) : [];
          vouchers.push(voucher);
          localStorage.setItem('vouchers', JSON.stringify(vouchers));
          
          showToast(`${t.successPaid} ${check.checkNumber}`);

          if (check.phoneNumbers && check.phoneNumbers.length > 0) {
            const message = language === 'ar' 
              ? `✅ تم تسجيل دفع الشيك رقم ${check.checkNumber} بمبلغ ${check.amount} ${check.currency}. شكراً لاستخدامك مدير الشيكات`
              : `✅ Payment recorded for check #${check.checkNumber} with amount ${check.amount} ${check.currency}. Thank you for using Check Manager`;
            
            check.phoneNumbers.forEach(phone => {
              const cleanNum = phone.replace(/\D/g, '');
              window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
            });
          }

          if (check.representativePhone) {
            const message = language === 'ar'
              ? `✅ تم صرف الشيك رقم ${check.checkNumber} بمبلغ ${check.amount} ${check.currency}.`
              : `✅ Check #${check.checkNumber} with amount ${check.amount} ${check.currency} has been paid.`;
            const cleanNum = check.representativePhone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
          }
        } catch (e) {
          console.error("Error creating voucher:", e);
        }
        
        return updatedCheck;
      }
      return check;
    }));
  };

  const deleteCheck = (id: number) => {
    // Custom confirm logic could be added here, using simple state for now
    setChecks(prev => prev.filter(c => c.id !== id));
    showToast(language === 'ar' ? 'تم حذف الشيك' : 'Check deleted');
  };

  const exportToPDF = async () => {
    const element = document.getElementById('checks-list-container');
    if (!element) {
      showToast(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#f8fafc',
        style: {
          padding: '20px',
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add title manually to PDF for accessibility if needed, but the image has it
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`checks_report_${new Date().getTime()}.pdf`);
      showToast(t.successExport);
    } catch (error) {
      console.error('PDF Export Error:', error);
      showToast(t.errorExport, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportListAsImage = async () => {
    const element = document.getElementById('checks-list-container');
    if (!element) return;

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#f8fafc',
        style: {
          padding: '20px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `checks_report_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      showToast(t.successExport);
    } catch (error) {
      console.error('Error exporting list image:', error);
      showToast(t.errorExport, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async (checkId: number) => {
    const element = document.getElementById(`check-card-${checkId}`);
    if (!element) return;

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#f8fafc',
        style: {
          padding: '20px',
          borderRadius: '20px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `check-${checkId}.png`;
      link.href = dataUrl;
      link.click();
      showToast(t.successExport);
    } catch (error) {
      console.error('Error exporting image:', error);
      showToast(t.errorExport, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const notifyRepresentative = (check: Check) => {
    if (!check.representativePhone) return;
    
    const message = language === 'ar'
      ? `⏰ *تنبيه للمندوب*\n\nتمت إضافة شيك جديد للمتابعة:\nرقم الشيك: *${check.checkNumber}*\nالمبلغ: *${check.amount} ${check.currency}*\nالمستفيد: *${check.payeeName}*\nتاريخ الاستحقاق: *${check.dueDate}*\n\n_الشيك حالياً في قائمة الانتظار._`
      : `⏰ *Representative Notification*\n\nNew check added for follow-up:\nCheck Number: *${check.checkNumber}*\nAmount: *${check.amount} ${check.currency}*\nPayee: *${check.payeeName}*\nDue Date: *${check.dueDate}*\n\n_Check is currently in the waiting list._`;
    
    const cleanNum = check.representativePhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const notifyManager = (check: Check) => {
    if (!managerPhone) return;
    
    const message = language === 'ar'
      ? `🔔 *تنبيه للمدير*\n\nتمت إضافة شيك جديد:\nرقم الشيك: *${check.checkNumber}*\nالمبلغ: *${check.amount} ${check.currency}*\nالمستفيد: *${check.payeeName}*\nتاريخ الاستحقاق: *${check.dueDate}*\n\n_يرجى المتابعة._`
      : `🔔 *Manager Notification*\n\nNew check added:\nCheck Number: *${check.checkNumber}*\nAmount: *${check.amount} ${check.currency}*\nPayee: *${check.payeeName}*\nDue Date: *${check.dueDate}*\n\n_Please follow up._`;
    
    const cleanNum = managerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const notifyDrawer = (check: Check) => {
    if (!check.drawerPhone) return;
    
    const message = language === 'ar'
      ? `🔔 *تنبيه للساحب*\n\nتمت إضافة شيك جديد باسمك:\nرقم الشيك: *${check.checkNumber}*\nالمبلغ: *${check.amount} ${check.currency}*\nالمستفيد: *${check.payeeName}*\nتاريخ الاستحقاق: *${check.dueDate}*\n\n_يرجى التأكد من توفر الرصيد._`
      : `🔔 *Drawer Notification*\n\nNew check added in your name:\nCheck Number: *${check.checkNumber}*\nAmount: *${check.amount} ${check.currency}*\nPayee: *${check.payeeName}*\nDue Date: *${check.dueDate}*\n\n_Please ensure funds are available._`;
    
    const cleanNum = check.drawerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const checkStatus = (check: Check) => {
    if (check.status === 'paid') return { label: t.paid, color: 'bg-green-500', icon: <CheckCircle2 size={16} /> };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(check.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `${t.overdue} (${Math.abs(diffDays)} ${t.days})`, color: 'bg-red-500', icon: <AlertCircle size={16} /> };
    if (diffDays <= 7) return { label: `${t.daysLeft} ${diffDays} ${t.days}`, color: 'bg-orange-500', icon: <Bell size={16} /> };
    return { label: t.waiting, color: 'bg-blue-500', icon: <Calendar size={16} /> };
  };

  const sortedChecks = useMemo(() => {
    let filtered = [...checks];
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.checkNumber.toLowerCase().includes(q) ||
        c.payeeName.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.amount.toString().includes(q) ||
        c.amountInWords.toLowerCase().includes(q) ||
        c.drawerName.toLowerCase().includes(q) ||
        c.drawnBank.toLowerCase().includes(q) ||
        c.depositedBank.toLowerCase().includes(q) ||
        c.accountNumber.toLowerCase().includes(q) ||
        c.accountHolder.toLowerCase().includes(q) ||
        c.representativeName.toLowerCase().includes(q) ||
        (c.drawerPhone && c.drawerPhone.includes(q)) ||
        c.representativePhone.includes(q)
      );
    }

    // Filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'name') {
        comparison = a.payeeName.localeCompare(b.payeeName, 'ar');
      } else {
        comparison = a.id - b.id;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [checks, sortBy, sortOrder, filterStatus]);

  return (
    <div className={`min-h-screen bg-slate-50 py-8 px-4 font-['Cairo'] ${language === 'en' ? 'font-sans' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {toast.message}
            <button onClick={() => setToast(null)} className={`${language === 'ar' ? 'mr-2' : 'ml-2'} opacity-70 hover:opacity-100`}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center relative">
          <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} flex items-center gap-2`}>
            {!isOnline && (
              <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                {language === 'ar' ? 'أوفلاين' : 'Offline'}
              </div>
            )}
            {deferredPrompt && (
              <button 
                onClick={installApp}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
              >
                <Download size={12} />
                {language === 'ar' ? 'تثبيت' : 'Install'}
              </button>
            )}
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-all"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Hash className="text-emerald-200" />
              {t.title}
            </h1>
            <p className="text-emerald-100 opacity-90">{t.subtitle}</p>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex p-4 gap-4 bg-slate-50/50 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'add' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle size={20} />
            {t.addTab}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'list' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <List size={20} />
            {t.listTab}
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'add' ? (
              <motion.div
                key="add"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-5"
              >
                <h2 className={`text-xl font-bold text-slate-800 mb-6 ${language === 'ar' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-emerald-500`}>{t.addNewCheck}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Hash size={16} /> {t.checkNumber}
                    </label>
                    <input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      placeholder={t.placeholderCheckNum}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <User size={16} /> {t.payeeName}
                    </label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      placeholder={t.placeholderPayee}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <User size={16} /> {t.customerName}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.placeholderCustomer}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <DollarSign size={16} /> {t.amount}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold"
                      >
                        <option value="SAR">SAR</option>
                        <option value="USD">USD</option>
                        <option value="GHS">GHS</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <FileText size={16} /> {t.amountInWords}
                    </label>
                    <input
                      type="text"
                      value={amountInWords}
                      onChange={(e) => setAmountInWords(e.target.value)}
                      placeholder={t.placeholderAmountWords}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Calendar size={16} /> {t.issueDate}
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Calendar size={16} /> {t.dueDate}
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <UserCheck size={16} /> {t.drawerName}
                    </label>
                    <input
                      type="text"
                      value={drawerName}
                      onChange={(e) => setDrawerName(e.target.value)}
                      placeholder={t.placeholderDrawer}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <PhoneInput
                    value={drawerPhone}
                    onChange={setDrawerPhone}
                    placeholder={t.placeholderDrawerPhone}
                    label={t.drawerPhone}
                    icon={<Phone size={16} />}
                    language={language}
                    t={t}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Building2 size={16} /> {t.drawnBank}
                    </label>
                    <input
                      type="text"
                      value={drawnBank}
                      onChange={(e) => setDrawnBank(e.target.value)}
                      placeholder={t.placeholderDrawnBank}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Building2 size={16} /> {t.depositedBank}
                    </label>
                    <input
                      type="text"
                      value={depositedBank}
                      onChange={(e) => setDepositedBank(e.target.value)}
                      placeholder={t.placeholderDepositedBank}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <CreditCard size={16} /> {t.accountNumber}
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={t.placeholderAccountNum}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <User size={16} /> {t.accountHolder}
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder={t.placeholderAccountHolder}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <User size={16} /> {t.representativeName}
                    </label>
                    <input
                      type="text"
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      placeholder={t.placeholderRepName}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <PhoneInput
                    value={representativePhone}
                    onChange={setRepresentativePhone}
                    placeholder={t.placeholderRepPhone}
                    label={t.representativePhone}
                    icon={<Phone size={16} />}
                    language={language}
                    t={t}
                  />

                  <PhoneInput
                    value={managerPhone}
                    onChange={setManagerPhone}
                    placeholder={t.placeholderManagerPhone}
                    label={t.managerPhone}
                    icon={<Phone size={16} />}
                    language={language}
                    t={t}
                  />

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Bell size={16} /> {t.phoneAlert}
                    </label>
                    <div className="space-y-2">
                      {phoneNumbers.map((num, index) => (
                        <div key={index} className="flex gap-2">
                          <PhoneInput
                            value={num}
                            onChange={(val) => {
                              const newPhones = [...phoneNumbers];
                              newPhones[index] = val;
                              setPhoneNumbers(newPhones);
                            }}
                            placeholder={t.placeholderPhone}
                            label=""
                            icon={null}
                            language={language}
                            t={t}
                          />
                          {phoneNumbers.length > 1 && (
                            <button
                              onClick={() => setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))}
                              className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setPhoneNumbers([...phoneNumbers, ''])}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                      >
                        <Plus size={18} />
                        {t.addPhone}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={addCheck}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={22} />
                  {t.saveCheck}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold text-slate-800 ${language === 'ar' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-emerald-500`}>{t.checkList}</h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={exportListAsImage}
                        disabled={isExporting}
                        className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                      >
                        <ImageIcon size={14} />
                        {t.exportImage}
                      </button>
                      <button 
                        onClick={exportToPDF}
                        className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-200"
                      >
                        <Download size={14} />
                        {t.exportPDF}
                      </button>
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{t.total}: {sortedChecks.length}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-3' : 'left-3'} flex items-center pointer-events-none text-slate-400`}>
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className={`w-full p-3 ${language === 'ar' ? 'pr-10' : 'pl-10'} bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold text-slate-400 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.filterStatus}</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="all">{t.all}</option>
                        <option value="pending">{t.pending}</option>
                        <option value="paid">{t.paid}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold text-slate-400 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.sortBy}</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="id">{t.id}</option>
                        <option value="date">{t.date}</option>
                        <option value="amount">{t.amount}</option>
                        <option value="name">{t.name}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold text-slate-400 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.sortOrder}</label>
                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="desc">{t.desc}</option>
                        <option value="asc">{t.asc}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {sortedChecks.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="text-slate-400" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">{t.noChecks}</p>
                  </div>
                ) : (
                  <div id="checks-list-container" className="space-y-4">
                    {sortedChecks.map((check) => {
                      const status = checkStatus(check);
                      return (
                        <motion.div
                          layout
                          key={check.id}
                          id={`check-card-${check.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                          <div className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1.5 ${status.color}`}></div>
                          
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {t.checkNumber}: {check.checkNumber}
                              </h3>
                              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                <User size={14} /> {check.payeeName}
                              </p>
                              {check.customerName && (
                                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                  <UserCheck size={12} /> {t.customerName}: {check.customerName}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </div>
                              <button
                                onClick={() => exportAsImage(check.id)}
                                disabled={isExporting}
                                className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
                              >
                                <ImageIcon size={12} />
                                {t.exportImage}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-xs text-slate-400 mb-1">{t.amount}</p>
                              <p className="font-bold text-emerald-700">{check.amount.toLocaleString()} {check.currency}</p>
                              {check.amountInWords && <p className="text-[10px] text-slate-500 mt-1 italic">{check.amountInWords}</p>}
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-xs text-slate-400 mb-1">{t.dueDate}</p>
                              <p className="font-bold text-slate-700">{check.dueDate}</p>
                              {check.issueDate && (
                                <p className="text-[10px] text-slate-400 mt-1">{t.issueDate}: {check.issueDate}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                            {check.drawerName && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <UserCheck size={12} className="text-emerald-500" />
                                <span>{t.drawerName}: {check.drawerName}</span>
                              </div>
                            )}
                            {check.drawnBank && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <Building2 size={12} className="text-emerald-500" />
                                <span>{t.drawnBank}: {check.drawnBank}</span>
                              </div>
                            )}
                            {check.depositedBank && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <Building2 size={12} className="text-blue-500" />
                                <span>{t.depositedBank}: {check.depositedBank}</span>
                              </div>
                            )}
                            {check.accountNumber && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <CreditCard size={12} className="text-blue-500" />
                                <span>{t.accountNumber}: {check.accountNumber}</span>
                              </div>
                            )}
                            {check.representativeName && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <User size={12} className="text-orange-500" />
                                <span>{t.representativeName}: {check.representativeName}</span>
                              </div>
                            )}
                          </div>

                          {check.phoneNumbers && check.phoneNumbers.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-4 bg-blue-50 p-2 rounded-lg">
                              <Phone size={14} className="text-blue-500" />
                              <span className="font-bold">{t.phoneAlert}:</span>
                              {check.phoneNumbers.map((num, i) => (
                                <span key={i} className="bg-white px-2 py-0.5 rounded border border-blue-100 text-xs">{num}</span>
                              ))}
                            </div>
                          )}

                          {check.status === 'paid' && (
                            <div className="text-green-600 text-sm font-bold flex items-center gap-2 mb-4">
                              <CheckCircle2 size={16} />
                              {t.paidOn} {check.paidDate}
                            </div>
                          )}

                          <div className="flex gap-3">
                            {check.status !== 'paid' && (
                              <>
                                <button
                                  onClick={() => markAsPaid(check.id)}
                                  className="flex-1 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={18} />
                                  {t.markAsPaid}
                                </button>
                                {check.phoneNumbers && check.phoneNumbers.length > 0 && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => sendReminderSMS(check)}
                                      className="px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                      title={t.smsReminder}
                                    >
                                      <Bell size={18} />
                                    </button>
                                    <button
                                      onClick={() => sendReminderWhatsApp(check)}
                                      className="px-4 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                      title={t.whatsappReminder}
                                    >
                                      <MessageSquare size={18} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => deleteCheck(check.id)}
                              className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                              <Trash2 size={18} />
                              {t.delete}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="max-w-2xl mx-auto mt-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} {t.footer}</p>
      </div>
    </div>
  );
}
