const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  Alert,
  Share,
  PanResponder,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  Activity,
  Bot,
  Plus,
  Minus,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Lock,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Receipt,
  Utensils,
  Fuel,
  ShoppingBag,
  Bike,
  Coffee,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Zap,
  Info,
  CalendarCheck,
  Handshake,
  ArrowRight,
  ShieldAlert,
  Coins,
  Landmark,
  Flame,
  RotateCcw,
  Camera,
  Check,
  Pill,
  Bus,
  Smartphone,
  ShoppingBasket,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ChevronUp,
  ChevronDown,
  Settings,
  Database,
  Wifi,
  WifiOff,
  User,
  Mail,
  LogOut,
  Briefcase
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- THEME PALETTES (DARK & LIGHT) ---
const THEMES = {
  dark: {
    mode: 'dark',
    bg: '#0B0C10',
    card: '#12141A',
    cardSubtle: '#181B24',
    cardBorder: 'rgba(255,255,255,0.07)',
    cardBorderHover: 'rgba(16,185,129,0.3)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    headerBg: '#0B0C10',
    navBg: 'rgba(11,12,16,0.95)',
    inputBg: '#181B24',
    inputBorder: 'rgba(255,255,255,0.1)',
    emerald: '#10B981',
    emeraldLight: '#34D399',
    amber: '#F59E0B',
    rose: '#EF4444',
    blue: '#3B82F6',
    purple: '#A855F7',
    tagBg: 'rgba(255,255,255,0.04)',
  },
  light: {
    mode: 'light',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardSubtle: '#F1F5F9',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardBorderHover: 'rgba(16,185,129,0.4)',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    headerBg: '#FFFFFF',
    navBg: 'rgba(255,255,255,0.96)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(0,0,0,0.12)',
    emerald: '#059669',
    emeraldLight: '#10B981',
    amber: '#D97706',
    rose: '#DC2626',
    blue: '#2563EB',
    purple: '#9333EA',
    tagBg: 'rgba(0,0,0,0.04)',
  }
};

// Format Currency Utility for INR
const formatINR = (val) => {
  return '₹' + Math.round(val || 0).toLocaleString('en-IN');
};

// Micro-Spend Quick Tags
const QUICK_TAGS = [
  { id: 'tea', name: 'Tea / Chai', category: 'Dining & Food', icon: Coffee, color: '#F59E0B' },
  { id: 'food', name: 'Meals / Food', category: 'Dining & Food', icon: Utensils, color: '#FB923C' },
  { id: 'commute', name: 'Metro / Auto', category: 'Fuel & Commute', icon: Bus, color: '#3B82F6' },
  { id: 'petrol', name: 'Petrol Top-up', category: 'Fuel & Commute', icon: Fuel, color: '#10B981' },
  { id: 'grocery', name: 'Daily Groceries', category: 'Groceries', icon: ShoppingBasket, color: '#14B8A6' },
  { id: 'recharge', name: 'Phone Bill', category: 'Utilities & Bills', icon: Smartphone, color: '#A855F7' },
];

// --- PURE NATIVE CARTOON AI EYES AVATAR ---
function CartoonAIEyesNative({ isTalking = false, size = 'md' }) {
  const eyeBlink = useRef(new Animated.Value(1)).current;
  const pupilX = useRef(new Animated.Value(0)).current;
  const pupilY = useRef(new Animated.Value(0)).current;
  const mouthScale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(eyeBlink, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeBlink, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start();
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const lookInterval = setInterval(() => {
      const targetX = (Math.random() - 0.5) * 8;
      const targetY = (Math.random() - 0.5) * 4;
      Animated.parallel([
        Animated.spring(pupilX, { toValue: targetX, friction: 6, useNativeDriver: true }),
        Animated.spring(pupilY, { toValue: targetY, friction: 6, useNativeDriver: true }),
      ]).start();
    }, 2600);
    return () => clearInterval(lookInterval);
  }, []);

  useEffect(() => {
    if (isTalking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthScale, { toValue: 1.4, duration: 140, useNativeDriver: true }),
          Animated.timing(mouthScale, { toValue: 0.8, duration: 140, useNativeDriver: true }),
        ])
      ).start();
    } else {
      mouthScale.setValue(1);
    }
  }, [isTalking]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -3, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const eyeWidth = size === 'lg' ? 44 : size === 'sm' ? 18 : 26;
  const eyeHeight = size === 'lg' ? 56 : size === 'sm' ? 24 : 34;
  const pupilSize = size === 'lg' ? 20 : size === 'sm' ? 9 : 12;

  return (
    <Animated.View style={[avatarStyles.container, { transform: [{ translateY: floatAnim }] }]}>
      <View style={[
        avatarStyles.facePill, 
        size === 'lg' && avatarStyles.facePillLg,
        size === 'sm' && avatarStyles.facePillSm
      ]}>
        <Animated.View style={[avatarStyles.eyeWhite, { width: eyeWidth, height: eyeHeight, transform: [{ scaleY: eyeBlink }] }]}>
          <Animated.View
            style={[
              avatarStyles.pupil,
              {
                width: pupilSize,
                height: pupilSize,
                transform: [{ translateX: pupilX }, { translateY: pupilY }],
              },
            ]}
          >
            <View style={avatarStyles.twinkle} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[avatarStyles.eyeWhite, { width: eyeWidth, height: eyeHeight, transform: [{ scaleY: eyeBlink }] }]}>
          <Animated.View
            style={[
              avatarStyles.pupil,
              {
                width: pupilSize,
                height: pupilSize,
                transform: [{ translateX: pupilX }, { translateY: pupilY }],
              },
            ]}
          >
            <View style={avatarStyles.twinkle} />
          </Animated.View>
        </Animated.View>
      </View>

      {size !== 'sm' && (
        <Animated.View style={[avatarStyles.mouth, { transform: [{ scaleX: mouthScale }, { scaleY: mouthScale }] }]} />
      )}
    </Animated.View>
  );
}

// --- INNOVATIVE GESTURE SPEND CHIP (SWIPE UP = ADD, SWIPE DOWN = MINUS) ---
function GestureSpendChip({ amount = 5, onIncrement, onDecrement, theme }) {
  const [swipeState, setSwipeState] = useState(null); // 'up' | 'down' | null
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
      onPanResponderMove: (_, gesture) => {
        const clampedY = Math.max(-18, Math.min(18, gesture.dy));
        translateY.setValue(clampedY);
        if (gesture.dy < -6) {
          setSwipeState('up');
        } else if (gesture.dy > 6) {
          setSwipeState('down');
        } else {
          setSwipeState(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -10) {
          onIncrement(amount);
          Animated.sequence([
            Animated.timing(translateY, { toValue: -12, duration: 70, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 5, useNativeDriver: true }),
          ]).start();
        } else if (gesture.dy > 10) {
          onDecrement(amount);
          Animated.sequence([
            Animated.timing(translateY, { toValue: 12, duration: 70, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 5, useNativeDriver: true }),
          ]).start();
        } else {
          onIncrement(amount);
          Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true }).start();
        }
        setSwipeState(null);
      },
    })
  ).current;

  const isUp = swipeState === 'up';
  const isDown = swipeState === 'down';

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        chipStyles.container,
        {
          backgroundColor: isUp ? 'rgba(16,185,129,0.18)' : isDown ? 'rgba(239,68,68,0.18)' : theme.cardSubtle,
          borderColor: isUp ? '#10B981' : isDown ? '#EF4444' : theme.cardBorder,
        },
        { transform: [{ translateY }] }
      ]}
    >
      <View style={chipStyles.indicatorRow}>
        <ChevronUp size={11} color={isUp ? '#10B981' : theme.textMuted} />
      </View>
      <Text style={[chipStyles.text, { color: isUp ? '#10B981' : isDown ? '#EF4444' : theme.text }]}>
        ₹{amount}
      </Text>
      <View style={chipStyles.indicatorRow}>
        <ChevronDown size={11} color={isDown ? '#EF4444' : theme.textMuted} />
      </View>
    </Animated.View>
  );
}

// Export default main App component
export default function App() {
  // Navigation & Flow: 'splash' | 'welcome' | 'login' | 'loading_ai' | 'main'
  const [appState, setAppState] = useState('splash');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  // Active Main Tab: 'radar' | 'bento' | 'diagnostics' | 'copilot'
  const [activeTab, setActiveTab] = useState('radar');

  // Backend Sync Config
  const [backendUrl, setBackendUrl] = useState('http://10.99.163.89:3000');
  const [syncStatus, setSyncStatus] = useState('LOCAL'); // 'SYNCED' | 'LOCAL' | 'SYNCING'

  // User Profile
  const [userProfile, setUserProfile] = useState({
    fullName: 'Alex Vance',
    email: 'alex@spendpace.com',
    occupationCategory: 'SALARIED',
    occupationSubRole: 'Corporate / MNC Staff',
    maritalStatus: 'SINGLE',
    dependentsCount: 0,
    monthlyIncome: 85000,
    spouseIncome: 35000,
    otherIncome: 0,
    payCycleDay: 1,
    savingsTargetPercent: 25,
    alertThresholdPercent: 80,
  });

  // Auth Inputs
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('alex@spendpace.com');
  const [authPassword, setAuthPassword] = useState('PaceSecure2026!');
  const [authFullName, setAuthFullName] = useState('Alex Vance');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaStatus, setCaptchaStatus] = useState('idle'); // 'idle' | 'verifying' | 'verified'
  const [authError, setAuthError] = useState('');

  // AI Loading Screen Progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMilestone, setLoadingMilestone] = useState('Connecting to Encrypted Vault...');

  // Financial Engine State
  const [income, setIncome] = useState(85000);
  const [partTimeIncome, setPartTimeIncome] = useState(6400);
  const [fixedBills, setFixedBills] = useState(32000);
  const [daysRemaining, setDaysRemaining] = useState(18);
  const [spentToday, setSpentToday] = useState(380);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Micro-Spend Instant Pulse
  const [selectedQuickTag, setSelectedQuickTag] = useState(QUICK_TAGS[0]);
  const [quickAmount, setQuickAmount] = useState(10);
  const [quickSuccessBanner, setQuickSuccessBanner] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLendingOpen, setIsLendingOpen] = useState(false);
  const [isRecalibrateOpen, setIsRecalibrateOpen] = useState(false);

  // Form Fields for Add Transaction
  const [logAmount, setLogAmount] = useState('');
  const [logCategory, setLogCategory] = useState('Food & Dining');
  const [logNote, setLogNote] = useState('');

  // Form Fields for Recalibrate Structure
  const [recalIncome, setRecalIncome] = useState('85000');
  const [recalBills, setRecalBills] = useState('32000');
  const [recalDays, setRecalDays] = useState('18');

  // Friends & Informal Money Lent State
  const [moneyLentList, setMoneyLentList] = useState([
    { id: '1', borrowerName: 'Rahul (Colleague)', phone: '+919876543210', amount: 3500, lentDate: '12 Oct 2026', notes: 'Dinner bill split', isRecovered: false },
    { id: '2', borrowerName: 'Priya (Flatmate)', phone: '+919876543211', amount: 1200, lentDate: '24 Oct 2026', notes: 'Electricity bill share', isRecovered: false },
    { id: '3', borrowerName: 'Karan (Gym)', phone: '+919876543212', amount: 500, lentDate: '28 Sep 2026', notes: 'Protein supplement advance', isRecovered: true },
  ]);
  const [newLentName, setNewLentName] = useState('');
  const [newLentPhone, setNewLentPhone] = useState('');
  const [newLentAmount, setNewLentAmount] = useState('');
  const [newLentNotes, setNewLentNotes] = useState('');

  // Transactions Ledger
  const [transactions, setTransactions] = useState([
    { id: '1', name: 'Shell Petrol Station', category: 'Fuel & Commute', amount: 450, date: 'Today, 08:30 AM', source: 'UPI', icon: Fuel },
    { id: '2', name: 'Blue Tokai Coffee', category: 'Food & Dining', amount: 240, date: 'Today, 11:15 AM', source: 'MANUAL', icon: Utensils },
    { id: '3', name: 'Nature Basket Grocery', category: 'Groceries', amount: 1280, date: 'Yesterday', source: 'UPI', icon: ShoppingBag },
    { id: '4', name: 'Swiggy Gourmet Dinner', category: 'Food & Dining', amount: 890, date: '2 days ago', source: 'UPI', icon: Utensils },
    { id: '5', name: 'Airtel Broadband Fiber', category: 'Bills & Utilities', amount: 1179, date: '3 days ago', source: 'AUTO_DEBIT', icon: Receipt },
  ]);

  // Pace AI Copilot Chat State
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: "Hello Alex! I'm Pace, your autonomous spend copilot. Your safe daily pace today is healthy at ₹1,633/day. How can I assist your cashflow today?",
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const chatScrollRef = useRef(null);

  // Computed Safe Daily Pace
  const discretionaryPool = Math.max(0, (income + partTimeIncome) - fixedBills);
  const safeDaily = Math.max(0, Math.round(discretionaryPool / (daysRemaining || 1)));
  const paceBurnRatio = safeDaily > 0 ? (spentToday / safeDaily) : 0;
  const isPaceOverheating = paceBurnRatio > 0.85;

  // --- STARTUP SPLASH TIMEOUT ---
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setAppState('main');
    }, 1400);
    return () => clearTimeout(splashTimer);
  }, []);

  // --- EMAIL FORMAT VALIDATOR ---
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);

  // --- CAPTCHA HANDLER ---
  const handleTriggerCaptcha = () => {
    if (captchaStatus === 'verifying' || captchaStatus === 'verified') return;
    setCaptchaStatus('verifying');
    setTimeout(() => {
      setCaptchaStatus('verified');
    }, 800);
  };

  // --- SUBMIT LOGIN / REGISTER & START AI LOADING SCREEN ---
  const handleAuthSubmit = () => {
    setAuthError('');
    if (!isEmailValid) {
      setAuthError('Please provide a valid email format.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must contain at least 6 characters.');
      return;
    }
    if (captchaStatus !== 'verified') {
      setAuthError('Please tap the security verification shield.');
      return;
    }

    // Launch Fun AI Loading Screen
    setAppState('loading_ai');
    setLoadingProgress(10);
    setLoadingMilestone('Connecting to Encrypted PostgreSQL Database...');

    setTimeout(() => {
      setLoadingProgress(35);
      setLoadingMilestone('Syncing Ledger, Commitments & Fixed EMIs...');
    }, 500);

    setTimeout(() => {
      setLoadingProgress(70);
      setLoadingMilestone('Pace AI Calibrating Daily Safe Velocity...');
    }, 1100);

    setTimeout(() => {
      setLoadingProgress(95);
      setLoadingMilestone('Neural Cashflow Copilot Online...');
    }, 1600);

    setTimeout(() => {
      setLoadingProgress(100);
      setLoadingMilestone('Vault Decrypted! Opening Dashboard...');
      setTimeout(() => {
        setAppState('main');
      }, 400);
    }, 2100);
  };

  // --- INSTANT PULSE INCREMENT / DECREMENT ---
  const handlePulseIncrement = (val) => {
    setQuickAmount((prev) => prev + val);
  };

  const handlePulseDecrement = (val) => {
    setQuickAmount((prev) => Math.max(0, prev - val));
  };

  const handleLogMicroSpend = () => {
    if (quickAmount <= 0) return;
    setSpentToday((prev) => prev + quickAmount);

    const newTx = {
      id: Date.now().toString(),
      name: selectedQuickTag.name,
      category: selectedQuickTag.category,
      amount: quickAmount,
      date: 'Just now',
      source: 'GESTURE_PULSE',
      icon: selectedQuickTag.icon,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setQuickSuccessBanner(\`Logged \${formatINR(quickAmount)} for \${selectedQuickTag.name}!\`);
    setTimeout(() => setQuickSuccessBanner(null), 3500);
    setQuickAmount(10);
  };

  // --- PACE AI COPILOT SEND CHAT WITH BACKEND SYNC ---
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const userMsg = { id: Date.now().toString(), role: 'user', text: userText, time: 'Just now' };
    
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiTalking(true);

    // Scroll to end like ChatGPT
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Try live backend synchronization first
    let gotServerReply = false;
    try {
      const res = await fetch(\`\${backendUrl}/api/ai/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply || data.response || data.message) {
          gotServerReply = true;
          const replyText = data.reply || data.response || data.message;
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText, time: 'Just now' }]);
          setSyncStatus('SYNCED');
        }
      }
    } catch (e) {
      // Backend offline or unreachable -> seamless intelligent local fallback
    }

    if (!gotServerReply) {
      // Intelligent Local Copilot Engine
      setTimeout(() => {
        let aiReply = "Your safe daily spend velocity remains well within optimal bounds.";
        const lower = userText.toLowerCase();

        if (lower.includes('safe') || lower.includes('daily') || lower.includes('pace') || lower.includes('today')) {
          aiReply = \`Today's Safe-to-Spend velocity is \${formatINR(safeDaily)}/day. You have spent \${formatINR(spentToday)} so far, with \${daysRemaining} days left in this salary cycle.\`;
        } else if (lower.includes('spent') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('coffee') || lower.includes('food') || lower.includes('lunch')) {
          const match = lower.match(/\\d+/);
          const amount = match ? parseInt(match[0], 10) : 450;
          setSpentToday((prev) => prev + amount);
          const newTx = {
            id: Date.now().toString(),
            name: 'Pace AI Logged Expense',
            category: lower.includes('fuel') || lower.includes('petrol') ? 'Fuel & Commute' : 'Food & Dining',
            amount,
            date: 'Just now',
            source: 'AI_CHAT',
            icon: lower.includes('fuel') || lower.includes('petrol') ? Fuel : Utensils,
          };
          setTransactions((prev) => [newTx, ...prev]);
          aiReply = \`Logged \${formatINR(amount)} instantly. Deducted from today's safe allowance. Your updated safe daily limit is \${formatINR(safeDaily - Math.round(amount / (daysRemaining || 1)))}/day.\`;
        } else if (lower.includes('swiggy') || lower.includes('earn') || lower.includes('gig') || lower.includes('delivery')) {
          const match = lower.match(/\\d+/);
          const amount = match ? parseInt(match[0], 10) : 1200;
          setPartTimeIncome((prev) => prev + amount);
          aiReply = \`Great shift! Added \${formatINR(amount)} to part-time delivery income. Your daily safe velocity increased by +\${formatINR(Math.round(amount / (daysRemaining || 1)))}/day!\`;
        } else if (lower.includes('leak') || lower.includes('save') || lower.includes('cut')) {
          aiReply = 'Pace AI diagnostics identified a potential savings of ~₹1,200/month by curbing weekend dining surges and ₹899/month on unused subscriptions.';
        }

        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: aiReply, time: 'Just now' }]);
        setIsAiTalking(false);
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 600);
    } else {
      setIsAiTalking(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // --- SAVE MODAL TRANSACTION ---
  const handleSaveTransaction = () => {
    const amt = parseFloat(logAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }
    setSpentToday((prev) => prev + amt);
    const newTx = {
      id: Date.now().toString(),
      name: logNote.trim() || \`\${logCategory} Expense\`,
      category: logCategory,
      amount: amt,
      date: 'Just now',
      source: 'MANUAL',
      icon: logCategory === 'Fuel & Commute' ? Fuel : logCategory === 'Groceries' ? ShoppingBag : Utensils,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setIsAddModalOpen(false);
    setLogAmount('');
    setLogNote('');
    Alert.alert('Expense Logged', \`\${formatINR(amt)} deducted from daily safe velocity.\`);
  };

  // --- SAVE RECALIBRATION ---
  const handleSaveRecalibration = () => {
    const inc = parseFloat(recalIncome);
    const bills = parseFloat(recalBills);
    const days = parseInt(recalDays, 10);
    if (isNaN(inc) || isNaN(bills) || isNaN(days)) {
      Alert.alert('Invalid Input', 'Please check your inputs.');
      return;
    }
    setIncome(inc);
    setFixedBills(bills);
    setDaysRemaining(days);
    setIsRecalibrateOpen(false);
    Alert.alert('Structure Recalibrated', 'Your daily safe velocity has been recomputed.');
  };

  // --- INFORMAL LENDING ACTIONS ---
  const handleSendNudge = (loan) => {
    const message = \`Hi \${loan.borrowerName}, friendly reminder regarding the \${formatINR(loan.amount)} lent on \${loan.lentDate} for \${loan.notes}. Let me know whenever convenient to settle!\`;
    Share.share({ message });
  };

  const handleAddLentRecord = () => {
    if (!newLentName.trim() || !newLentAmount.trim()) {
      Alert.alert('Required Fields', 'Please enter a name and amount.');
      return;
    }
    const amt = parseFloat(newLentAmount);
    const newRecord = {
      id: Date.now().toString(),
      borrowerName: newLentName.trim(),
      phone: newLentPhone.trim() || '+919876543210',
      amount: isNaN(amt) ? 1000 : amt,
      lentDate: 'Today',
      notes: newLentNotes.trim() || 'Friendly informal advance',
      isRecovered: false,
    };
    setMoneyLentList([newRecord, ...moneyLentList]);
    setNewLentName('');
    setNewLentPhone('');
    setNewLentAmount('');
    setNewLentNotes('');
    Alert.alert('Loan Logged', \`\${formatINR(newRecord.amount)} added to outstanding receivables.\`);
  };

  // ==========================================
  // VIEW 1: SPLASH SCREEN
  // ==========================================
  if (appState === 'splash') {
    return (
      <View style={[splashStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
        <View style={splashStyles.logoBox}>
          <View style={splashStyles.glowCircle} />
          <View style={splashStyles.logoBadge}>
            <Sparkles size={38} color="#FFFFFF" />
          </View>
        </View>
        <Text style={[splashStyles.brandTitle, { color: theme.text }]}>
          Spend<Text style={{ color: theme.emerald }}>Pace</Text>
        </Text>
        <Text style={[splashStyles.brandSubtitle, { color: theme.textMuted }]}>
          AUTONOMOUS SPEND VELOCITY & MICRO-BUDGETING
        </Text>
        <View style={splashStyles.loadingStrip}>
          <ActivityIndicator size="small" color={theme.emerald} />
          <Text style={[splashStyles.loadingText, { color: theme.textSecondary }]}>Initializing Encrypted Vault...</Text>
        </View>
      </View>
    );
  }

  // ==========================================
  // VIEW 2: WELCOME / ONBOARDING SCREEN
  // ==========================================
  if (appState === 'welcome') {
    return (
      <SafeAreaView style={[welcomeStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
        
        {/* Top Header with Theme Switcher */}
        <View style={welcomeStyles.topRow}>
          <View style={welcomeStyles.brandRow}>
            <View style={welcomeStyles.miniBadge}>
              <Sparkles size={16} color="#FFFFFF" />
            </View>
            <Text style={[welcomeStyles.miniTitle, { color: theme.text }]}>SpendPace</Text>
          </View>
          <TouchableOpacity 
            style={[welcomeStyles.themeBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#64748B" />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={welcomeStyles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={welcomeStyles.heroBanner}>
            <View style={welcomeStyles.heroAvatarWrap}>
              <CartoonAIEyesNative size="lg" />
            </View>
            <Text style={[welcomeStyles.heroHeading, { color: theme.text }]}>
              Master Your Daily <Text style={{ color: theme.emerald }}>Cashflow Velocity</Text>
            </Text>
            <Text style={[welcomeStyles.heroSubtext, { color: theme.textSecondary }]}>
              Stop waiting until month-end to realize you overspent. SpendPace gives you one daily safe limit and sub-second gesture logging.
            </Text>
          </View>

          {/* 3 Value Proposition Cards */}
          <View style={welcomeStyles.featuresGrid}>
            <View style={[welcomeStyles.featureCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[welcomeStyles.featureIconBox, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <Compass size={20} color={theme.emerald} />
              </View>
              <Text style={[welcomeStyles.featureTitle, { color: theme.text }]}>Safe Daily Pace</Text>
              <Text style={[welcomeStyles.featureDesc, { color: theme.textSecondary }]}>
                A single dynamically recalibrated amount you can spend today without starving your rent, bills, or savings.
              </Text>
            </View>

            <View style={[welcomeStyles.featureCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[welcomeStyles.featureIconBox, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                <Zap size={20} color={theme.blue} />
              </View>
              <Text style={[welcomeStyles.featureTitle, { color: theme.text }]}>Swipe Pulse Logger</Text>
              <Text style={[welcomeStyles.featureDesc, { color: theme.textSecondary }]}>
                Swipe UP to add (+₹5), swipe DOWN to minus (-₹5). Zero form friction for chai, snacks, and fuel.
              </Text>
            </View>

            <View style={[welcomeStyles.featureCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[welcomeStyles.featureIconBox, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                <Bot size={20} color={theme.purple} />
              </View>
              <Text style={[welcomeStyles.featureTitle, { color: theme.text }]}>Pace AI Copilot</Text>
              <Text style={[welcomeStyles.featureDesc, { color: theme.textSecondary }]}>
                ChatGPT-like conversational advisor connected directly to your PostgreSQL database.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={welcomeStyles.ctaGroup}>
            <TouchableOpacity 
              style={[welcomeStyles.primaryCta, { backgroundColor: theme.emerald }]}
              onPress={() => { setAuthMode('login'); setAppState('login'); }}
            >
              <Text style={welcomeStyles.primaryCtaText}>Sign In to Your Vault</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[welcomeStyles.secondaryCta, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
              onPress={() => { setAuthMode('register'); setAppState('login'); }}
            >
              <Text style={[welcomeStyles.secondaryCtaText, { color: theme.text }]}>Create Encrypted Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 3: LOGIN / AUTH SCREEN WITH CAPTCHA & PASSWORD EYE TOGGLE
  // ==========================================
  if (appState === 'login') {
    return (
      <SafeAreaView style={[loginStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
        
        {/* Navigation Bar */}
        <View style={loginStyles.navRow}>
          <TouchableOpacity 
            style={[loginStyles.backBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setAppState('welcome')}
          >
            <X size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[loginStyles.navTitle, { color: theme.text }]}>
            {authMode === 'login' ? 'Sign In' : 'Create Vault'}
          </Text>
          <TouchableOpacity 
            style={[loginStyles.backBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#64748B" />}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={loginStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Logo Badge */}
            <View style={loginStyles.brandHeader}>
              <View style={loginStyles.logoBadge}>
                <Sparkles size={28} color="#FFFFFF" />
              </View>
              <Text style={[loginStyles.brandHeading, { color: theme.text }]}>
                Spend<Text style={{ color: theme.emerald }}>Pace</Text>
              </Text>
              <Text style={[loginStyles.brandSub, { color: theme.textSecondary }]}>
                {authMode === 'login' 
                  ? 'Access live spend velocity and AI cashflow forecasting' 
                  : 'Start autonomous daily budget management'}
              </Text>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={[loginStyles.tabSwitch, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
              <TouchableOpacity 
                style={[loginStyles.tabBtn, authMode === 'login' && { backgroundColor: theme.card }]}
                onPress={() => { setAuthMode('login'); setAuthError(''); }}
              >
                <Text style={[loginStyles.tabText, { color: authMode === 'login' ? theme.emerald : theme.textSecondary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[loginStyles.tabBtn, authMode === 'register' && { backgroundColor: theme.card }]}
                onPress={() => { setAuthMode('register'); setAuthError(''); }}
              >
                <Text style={[loginStyles.tabText, { color: authMode === 'register' ? theme.emerald : theme.textSecondary }]}>
                  Create Vault
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {authError ? (
              <View style={loginStyles.errorBanner}>
                <AlertCircle size={15} color="#EF4444" />
                <Text style={loginStyles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Input Form */}
            <View style={loginStyles.formGroup}>
              {authMode === 'register' && (
                <View style={loginStyles.inputBlock}>
                  <Text style={[loginStyles.label, { color: theme.textSecondary }]}>FULL NAME</Text>
                  <View style={[loginStyles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                    <User size={16} color={theme.textMuted} />
                    <TextInput
                      style={[loginStyles.textInput, { color: theme.text }]}
                      placeholder="Alex Vance"
                      placeholderTextColor={theme.textMuted}
                      value={authFullName}
                      onChangeText={setAuthFullName}
                    />
                  </View>
                </View>
              )}

              {/* Email with Format Validation Check */}
              <View style={loginStyles.inputBlock}>
                <View style={loginStyles.labelRow}>
                  <Text style={[loginStyles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                  {authEmail.length > 0 && (
                    <Text style={{ fontSize: 11, color: isEmailValid ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                      {isEmailValid ? '✓ Valid format' : 'Invalid email'}
                    </Text>
                  )}
                </View>
                <View style={[loginStyles.inputWrap, { backgroundColor: theme.inputBg, borderColor: isEmailValid ? '#10B981' : theme.inputBorder }]}>
                  <Mail size={16} color={isEmailValid ? '#10B981' : theme.textMuted} />
                  <TextInput
                    style={[loginStyles.textInput, { color: theme.text }]}
                    placeholder="alex@spendpace.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={authEmail}
                    onChangeText={setAuthEmail}
                  />
                  {isEmailValid && <CheckCircle2 size={16} color="#10B981" />}
                </View>
              </View>

              {/* Password with View/Hide Eye Toggle */}
              <View style={loginStyles.inputBlock}>
                <Text style={[loginStyles.label, { color: theme.textSecondary }]}>PASSWORD</Text>
                <View style={[loginStyles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                  <Lock size={16} color={theme.textMuted} />
                  <TextInput
                    style={[loginStyles.textInput, { color: theme.text }]}
                    placeholder="••••••••••••"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    value={authPassword}
                    onChangeText={setAuthPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={loginStyles.eyeBtn}>
                    {showPassword ? <EyeOff size={17} color={theme.textSecondary} /> : <Eye size={17} color={theme.textSecondary} />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Interactive Turnstile Security Shield Captcha */}
              <View style={loginStyles.inputBlock}>
                <Text style={[loginStyles.label, { color: theme.textSecondary }]}>SECURITY VERIFICATION</Text>
                <TouchableOpacity 
                  style={[
                    loginStyles.captchaBox, 
                    { backgroundColor: theme.cardSubtle, borderColor: captchaStatus === 'verified' ? '#10B981' : theme.cardBorder }
                  ]}
                  onPress={handleTriggerCaptcha}
                  activeOpacity={0.8}
                >
                  <View style={loginStyles.captchaLeft}>
                    {captchaStatus === 'verified' ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : captchaStatus === 'verifying' ? (
                      <ActivityIndicator size="small" color={theme.emerald} />
                    ) : (
                      <View style={loginStyles.captchaEmptyBox} />
                    )}
                    <View>
                      <Text style={[loginStyles.captchaMainText, { color: theme.text }]}>
                        {captchaStatus === 'verified' 
                          ? 'Security Token Verified' 
                          : captchaStatus === 'verifying' 
                          ? 'Checking Human Operator...' 
                          : 'Tap to complete Turnstile check'}
                      </Text>
                      <Text style={[loginStyles.captchaSubText, { color: theme.textMuted }]}>
                        {captchaStatus === 'verified' ? 'SHA-256 Cloudflare Signature' : 'Anti-bot zero-friction verification'}
                      </Text>
                    </View>
                  </View>
                  <ShieldCheck size={20} color={captchaStatus === 'verified' ? '#10B981' : theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity 
                style={[loginStyles.submitBtn, { backgroundColor: theme.emerald }]}
                onPress={handleAuthSubmit}
              >
                <Text style={loginStyles.submitBtnText}>
                  {authMode === 'login' ? 'Open Encrypted Vault' : 'Create & Encrypt Vault'}
                </Text>
                <ArrowRight size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 4: FUN AI ANIMATED LOADING SCREEN WITH PERCENTAGE
  // ==========================================
  if (appState === 'loading_ai') {
    return (
      <View style={[aiLoadingStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
        
        {/* Animated Cartoon AI Eyes */}
        <View style={aiLoadingStyles.avatarBox}>
          <CartoonAIEyesNative isTalking={true} size="lg" />
        </View>

        {/* Live Percentage Counter */}
        <Text style={[aiLoadingStyles.percentText, { color: theme.emerald }]}>
          {loadingProgress}%
        </Text>

        {/* Milestone Description */}
        <Text style={[aiLoadingStyles.milestoneText, { color: theme.text }]}>
          {loadingMilestone}
        </Text>

        {/* Smooth Animated Progress Bar */}
        <View style={[aiLoadingStyles.progressBarTrack, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
          <View style={[aiLoadingStyles.progressBarFill, { width: \`\${loadingProgress}%\`, backgroundColor: theme.emerald }]} />
        </View>

        <Text style={[aiLoadingStyles.footerHint, { color: theme.textMuted }]}>
          SpendPace Autonomous Engine • AES-256 Client Vault
        </Text>
      </View>
    );
  }

  // ==========================================
  // VIEW 5: MAIN DASHBOARD TABS (RADAR, BENTO, DIAGNOSTICS, PACE AI)
  // ==========================================
  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* --- UNIFIED SINGLE-ROW EXECUTIVE HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>SpendPace</Text>
              <View style={[styles.pacingChip, { backgroundColor: isPaceOverheating ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }]}>
                <View style={[styles.pulseDot, { backgroundColor: isPaceOverheating ? theme.rose : theme.emerald }]} />
                <Text style={[styles.pacingChipText, { color: isPaceOverheating ? theme.rose : theme.emerald }]}>
                  {isPaceOverheating ? 'Pacing Overheat' : 'Pacing Optimal'}
                </Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {userProfile.fullName} • {daysRemaining}d left
            </Text>
          </View>
        </View>

        {/* Action Cluster (Receipt, Settings, Theme Toggle) */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionIconBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#64748B" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionIconBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]} 
            onPress={() => setIsSettingsOpen(true)}
          >
            <SlidersHorizontal size={15} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- TAB CONTENT CONTAINER --- */}
      {activeTab === 'copilot' ? (
        // DEDICATED PACE AI COPILOT VIEW (CHATGPT-LIKE UPWARD SCROLLING & ADAPTIVE KEYBOARD)
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[chatStyles.container, { backgroundColor: theme.bg }]}>
            {/* AI Status Card */}
            <View style={[chatStyles.headerStatusCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={chatStyles.headerStatusLeft}>
                <CartoonAIEyesNative isTalking={isAiTalking} size="sm" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[chatStyles.aiName, { color: theme.text }]}>Pace AI Copilot</Text>
                  <Text style={[chatStyles.aiRole, { color: theme.emerald }]}>Autonomous Ledger Advisor • Active</Text>
                </View>
              </View>
              <View style={chatStyles.headerStatusRight}>
                <TouchableOpacity 
                  style={[chatStyles.resetChatBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={() => setMessages([{ id: Date.now().toString(), role: 'assistant', text: "Chat history cleared. How can I help your budget today?", time: 'Just now' }])}
                >
                  <RotateCcw size={13} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Message Stream (Docked at bottom, scrolls upward naturally) */}
            <ScrollView
              ref={chatScrollRef}
              style={chatStyles.messageList}
              contentContainerStyle={chatStyles.messageListContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <View 
                    key={m.id} 
                    style={[
                      chatStyles.bubbleRow, 
                      isUser ? chatStyles.userBubbleRow : chatStyles.assistantBubbleRow
                    ]}
                  >
                    {!isUser && (
                      <View style={[chatStyles.avatarBubble, { backgroundColor: theme.cardSubtle }]}>
                        <Bot size={14} color={theme.emerald} />
                      </View>
                    )}
                    <View 
                      style={[
                        chatStyles.bubbleBox,
                        isUser 
                          ? [chatStyles.userBubble, { backgroundColor: theme.emerald }] 
                          : [chatStyles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]
                      ]}
                    >
                      <Text style={[chatStyles.bubbleText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                        {m.text}
                      </Text>
                      {m.time && (
                        <Text style={[chatStyles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                          {m.time}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {isAiTalking && (
                <View style={[chatStyles.bubbleRow, chatStyles.assistantBubbleRow]}>
                  <View style={[chatStyles.avatarBubble, { backgroundColor: theme.cardSubtle }]}>
                    <Bot size={14} color={theme.emerald} />
                  </View>
                  <View style={[chatStyles.bubbleBox, chatStyles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <ActivityIndicator size="small" color={theme.emerald} />
                    <Text style={[chatStyles.bubbleText, { color: theme.textSecondary, marginLeft: 8 }]}>Pace is thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Prompt Carousel */}
            <View style={[chatStyles.promptBar, { borderTopColor: theme.cardBorder }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chatStyles.promptScroll}>
                {[
                  { text: 'Safe pace today?', icon: Compass },
                  { text: 'Spent ₹450 on fuel', icon: Fuel },
                  { text: 'Spent ₹250 on lunch', icon: Utensils },
                  { text: 'Earned ₹1,200 on gig', icon: Bike },
                  { text: 'Audit spend leaks', icon: AlertTriangle },
                ].map((p, i) => {
                  const IconP = p.icon;
                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={[chatStyles.promptChip, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
                      onPress={() => setChatInput(p.text)}
                    >
                      <IconP size={12} color={theme.emerald} />
                      <Text style={[chatStyles.promptChipText, { color: theme.text }]}>{p.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sticky Chat Input Bar */}
            <View style={[chatStyles.inputBar, { backgroundColor: theme.headerBg, borderTopColor: theme.cardBorder }]}>
              <TextInput
                style={[chatStyles.inputField, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                placeholder="Ask Pace or fast-log: 'Spent 350 for dinner'..."
                placeholderTextColor={theme.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity 
                style={[chatStyles.sendBtn, { backgroundColor: theme.emerald }]} 
                onPress={handleSendChat}
                activeOpacity={0.8}
              >
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // DASHBOARD SCROLLVIEW TABS (RADAR, BENTO, DIAGNOSTICS)
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* VIEW 1: HERO RADAR */}
          {activeTab === 'radar' && (
            <View style={styles.sectionStack}>
              {/* PRIMARY HERO RADAR CARD */}
              <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.heroTopRow}>
                  <View>
                    <Text style={[styles.heroPaceLabel, { color: theme.textSecondary }]}>TODAY'S SAFE-TO-SPEND LIMIT</Text>
                    <Text style={[styles.heroPaceValue, { color: theme.emerald }]}>{formatINR(safeDaily)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.recalBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
                    onPress={() => setIsRecalibrateOpen(true)}
                  >
                    <Text style={[styles.recalBtnText, { color: theme.emerald }]}>Recalibrate</Text>
                  </TouchableOpacity>
                </View>

                {/* Pace Burn Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={[styles.progressSpentText, { color: theme.textSecondary }]}>
                      Spent Today: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatINR(spentToday)}</Text>
                    </Text>
                    <Text style={[styles.progressRatioText, { color: isPaceOverheating ? theme.rose : theme.emerald }]}>
                      {Math.round(paceBurnRatio * 100)}% of daily allowance
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.cardSubtle }]}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: \`\${Math.min(100, paceBurnRatio * 100)}%\`, backgroundColor: isPaceOverheating ? theme.rose : theme.emerald }
                      ]} 
                    />
                  </View>
                </View>

                {/* Fluid 2x2 Metric Grid */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridRowPair}>
                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Remaining Days</Text>
                      <Text style={[styles.metricValue, { color: theme.text }]}>{daysRemaining}d</Text>
                      <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Until next paycheck</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Discretionary Pool</Text>
                      <Text style={[styles.metricValue, { color: theme.emerald }]}>{formatINR(discretionaryPool)}</Text>
                      <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Net monthly surplus</Text>
                    </View>
                  </View>

                  <View style={styles.gridRowPair}>
                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Committed Bills</Text>
                      <Text style={[styles.metricValue, { color: theme.rose }]}>{formatINR(fixedBills)}</Text>
                      <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Rent, EMIs & utilities</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Gig / Shift Inflow</Text>
                      <Text style={[styles.metricValue, { color: theme.blue }]}>{formatINR(partTimeIncome)}</Text>
                      <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Freelance & delivery</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* INNOVATIVE INSTANT PULSE SECTION (SWIPE UP / SWIPE DOWN) */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.chipHeaderRow}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>Instant Pulse Logger</Text>
                      <View style={styles.gestureHintBadge}>
                        <Text style={styles.gestureHintText}>Swipe UP (+) • Swipe DOWN (-)</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>
                      Micro-spends with zero form friction. Swipe chips vertically to adjust amount.
                    </Text>
                  </View>
                </View>

                {/* Horizontal Category Carousel */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagCarousel}>
                  {QUICK_TAGS.map((t) => {
                    const IconC = t.icon;
                    const isSelected = selectedQuickTag.id === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.tagPill, 
                          { backgroundColor: isSelected ? 'rgba(16,185,129,0.12)' : theme.cardSubtle, borderColor: isSelected ? theme.emerald : theme.cardBorder }
                        ]}
                        onPress={() => setSelectedQuickTag(t)}
                      >
                        <IconC size={13} color={isSelected ? theme.emerald : t.color} />
                        <Text style={[styles.tagPillText, { color: isSelected ? theme.emerald : theme.textSecondary }]}>
                          {t.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Active Amount Display & Controls */}
                <View style={[styles.tapControlsBar, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                  <View style={styles.tapDisplayRow}>
                    <Text style={[styles.tapActiveTagName, { color: theme.textSecondary }]}>{selectedQuickTag.name}</Text>
                    <View style={styles.tapAmountGroup}>
                      <Text style={[styles.tapAmountValue, { color: theme.text }]}>₹{quickAmount}</Text>
                      <TouchableOpacity onPress={() => setQuickAmount(10)} style={styles.tapResetBtn}>
                        <RotateCcw size={13} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Innovative Gesture Chips */}
                  <View style={styles.gestureChipsRow}>
                    {[1, 2, 5, 10, 20, 50, 100].map((val) => (
                      <GestureSpendChip
                        key={val}
                        amount={val}
                        theme={theme}
                        onIncrement={handlePulseIncrement}
                        onDecrement={handlePulseDecrement}
                      />
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryLogBtn, { backgroundColor: theme.emerald }]}
                    onPress={handleLogMicroSpend}
                    activeOpacity={0.85}
                  >
                    <Zap size={15} color="#FFFFFF" />
                    <Text style={styles.primaryLogBtnText}>Log ₹{quickAmount} Now</Text>
                  </TouchableOpacity>
                </View>

                {quickSuccessBanner && (
                  <View style={styles.successBanner}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text style={styles.successBannerText}>{quickSuccessBanner}</Text>
                  </View>
                )}
              </View>

              {/* RECENT TRANSACTIONS LEDGER */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Transactions</Text>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>Live records persisted in database</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: theme.cardSubtle }]}>
                    <Text style={[styles.countBadgeText, { color: theme.textSecondary }]}>{transactions.length} items</Text>
                  </View>
                </View>

                {transactions.slice(0, 5).map((tx) => {
                  const IconTx = tx.icon || Utensils;
                  return (
                    <View key={tx.id} style={[styles.txItem, { borderBottomColor: theme.cardBorder }]}>
                      <View style={[styles.txIconBox, { backgroundColor: theme.cardSubtle }]}>
                        <IconTx size={16} color={theme.emerald} />
                      </View>
                      <View style={styles.txDetails}>
                        <Text style={[styles.txName, { color: theme.text }]}>{tx.name}</Text>
                        <Text style={[styles.txMeta, { color: theme.textMuted }]}>{tx.category} • {tx.date}</Text>
                      </View>
                      <Text style={[styles.txAmount, { color: theme.text }]}>-{formatINR(tx.amount)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* VIEW 2: BENTO GRID */}
          {activeTab === 'bento' && (
            <View style={styles.sectionStack}>
              {/* Pattern Analyser Launch Card */}
              <TouchableOpacity 
                style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setIsCalendarOpen(true)}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Spending Calendar & Patterns</Text>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>Daily save checks, 3-day waves & over-burns</Text>
                  </View>
                  <Calendar size={18} color={theme.emerald} />
                </View>
              </TouchableOpacity>

              {/* Informal Friends Lending Card */}
              <TouchableOpacity 
                style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setIsLendingOpen(true)}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Informal Money Lent</Text>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>Track friendly receivables & WhatsApp nudges</Text>
                  </View>
                  <Handshake size={18} color={theme.emerald} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* VIEW 3: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <View style={styles.sectionStack}>
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>AI Burn Rate Diagnostics</Text>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>Autonomous leak detection & spend anomalies</Text>
                  </View>
                  <Activity size={18} color={theme.emerald} />
                </View>

                <View style={[styles.diagnosticAlert, { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' }]}>
                  <AlertTriangle size={16} color={theme.amber} />
                  <Text style={[styles.diagnosticAlertText, { color: theme.text }]}>
                    Weekend dining spend surges by ~38% compared to weekdays. Pace AI suggests a ₹600 cap on Friday night.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom clearance for nav dock */}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* --- REFINED ELEVATED FLOATING BOTTOM DOCK --- */}
      <View style={[styles.bottomNavContainer, { backgroundColor: theme.navBg, borderTopColor: theme.cardBorder }]}>
        <View style={styles.bottomNavDock}>
          {/* Slot 1: Radar */}
          <TouchableOpacity 
            style={styles.navSlot} 
            onPress={() => setActiveTab('radar')}
          >
            <Compass size={19} color={activeTab === 'radar' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'radar' ? theme.emerald : theme.textMuted }]}>
              Radar
            </Text>
          </TouchableOpacity>

          {/* Slot 2: Bento */}
          <TouchableOpacity 
            style={styles.navSlot} 
            onPress={() => setActiveTab('bento')}
          >
            <Layers size={19} color={activeTab === 'bento' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'bento' ? theme.emerald : theme.textMuted }]}>
              Bento
            </Text>
          </TouchableOpacity>

          {/* Slot 3: Center Elevated Action Button (Log Expense) */}
          <TouchableOpacity 
            style={[styles.centerFab, { backgroundColor: theme.emerald }]} 
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.85}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Slot 4: Diagnostics */}
          <TouchableOpacity 
            style={styles.navSlot} 
            onPress={() => setActiveTab('diagnostics')}
          >
            <Activity size={19} color={activeTab === 'diagnostics' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'diagnostics' ? theme.emerald : theme.textMuted }]}>
              Diagnostics
            </Text>
          </TouchableOpacity>

          {/* Slot 5: Pace AI Copilot */}
          <TouchableOpacity 
            style={styles.navSlot} 
            onPress={() => setActiveTab('copilot')}
          >
            <Bot size={19} color={activeTab === 'copilot' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'copilot' ? theme.emerald : theme.textMuted }]}>
              Pace AI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MODAL 1: ADD EXPENSE MODAL --- */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Log Expense</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Instantly updates daily safe pace velocity</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsAddModalOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>AMOUNT (₹)</Text>
            <TextInput
              style={[modalStyles.amountInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              placeholder="450"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={logAmount}
              onChangeText={setLogAmount}
              autoFocus={true}
            />

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
            <View style={modalStyles.categoryRow}>
              {[
                { name: 'Food & Dining', icon: Utensils },
                { name: 'Fuel & Commute', icon: Fuel },
                { name: 'Groceries', icon: ShoppingBag },
                { name: 'Bills & Utilities', icon: Receipt },
              ].map((c) => {
                const IconC = c.icon;
                const isSelected = logCategory === c.name;
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      modalStyles.catChip, 
                      { backgroundColor: isSelected ? 'rgba(16,185,129,0.12)' : theme.cardSubtle, borderColor: isSelected ? theme.emerald : theme.cardBorder }
                    ]}
                    onPress={() => setLogCategory(c.name)}
                  >
                    <IconC size={13} color={isSelected ? theme.emerald : theme.textSecondary} />
                    <Text style={[modalStyles.catChipText, { color: isSelected ? theme.emerald : theme.textSecondary }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>NOTE / MERCHANT (OPTIONAL)</Text>
            <TextInput
              style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              placeholder="e.g. Swiggy Lunch or Shell Fuel"
              placeholderTextColor={theme.textMuted}
              value={logNote}
              onChangeText={setLogNote}
            />

            <TouchableOpacity 
              style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} 
              onPress={handleSaveTransaction}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.submitBtnText}>Deduct from Daily Pace</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: PROFILE & SETTINGS EDIT MODAL --- */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '92%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Settings & Vault Profile</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Manage account, theme, budget rules & database sync</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsSettingsOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Theme Selector */}
              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>APP THEME</Text>
              <View style={[settingsStyles.themeToggleRow, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                <TouchableOpacity 
                  style={[settingsStyles.themeBtn, isDarkMode && { backgroundColor: theme.card }]}
                  onPress={() => setIsDarkMode(true)}
                >
                  <Moon size={16} color={isDarkMode ? theme.emerald : theme.textMuted} />
                  <Text style={[settingsStyles.themeBtnText, { color: isDarkMode ? theme.emerald : theme.textSecondary }]}>Dark Mode</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[settingsStyles.themeBtn, !isDarkMode && { backgroundColor: theme.card }]}
                  onPress={() => setIsDarkMode(false)}
                >
                  <Sun size={16} color={!isDarkMode ? theme.emerald : theme.textMuted} />
                  <Text style={[settingsStyles.themeBtnText, { color: !isDarkMode ? theme.emerald : theme.textSecondary }]}>Light Mode</Text>
                </TouchableOpacity>
              </View>

              {/* Profile Details */}
              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary, marginTop: 16 }]}>FULL NAME</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                value={userProfile.fullName}
                onChangeText={(t) => setUserProfile({ ...userProfile, fullName: t })}
              />

              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                value={userProfile.email}
                onChangeText={(t) => setUserProfile({ ...userProfile, email: t })}
              />

              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>MONTHLY TAKE-HOME INCOME (₹)</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                keyboardType="numeric"
                value={userProfile.monthlyIncome.toString()}
                onChangeText={(t) => {
                  const val = parseFloat(t) || 0;
                  setUserProfile({ ...userProfile, monthlyIncome: val });
                  setIncome(val);
                }}
              />

              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>PAY CYCLE DAY (1 - 31)</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                keyboardType="numeric"
                value={userProfile.payCycleDay.toString()}
                onChangeText={(t) => setUserProfile({ ...userProfile, payCycleDay: parseInt(t, 10) || 1 })}
              />

              {/* Backend API Host */}
              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>BACKEND SERVER API HOST</Text>
              <View style={[loginStyles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                <Database size={15} color={theme.emerald} />
                <TextInput
                  style={[loginStyles.textInput, { color: theme.text }]}
                  value={backendUrl}
                  onChangeText={setBackendUrl}
                  placeholder="http://10.99.163.89:3000"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={[settingsStyles.syncBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
                onPress={async () => {
                  try {
                    const r = await fetch(\`\${backendUrl}/api/dashboard\`);
                    if (r.ok) {
                      Alert.alert('Connection Successful', 'PostgreSQL database connected and synced!');
                      setSyncStatus('SYNCED');
                    } else {
                      Alert.alert('Server Status', 'Server reached but returned error.');
                    }
                  } catch (e) {
                    Alert.alert('Connection Notice', 'Local Next.js server unreachable at this IP. Using intelligent local vault mode.');
                  }
                }}
              >
                <Wifi size={14} color={theme.emerald} />
                <Text style={[settingsStyles.syncBtnText, { color: theme.text }]}>Test Database Sync</Text>
              </TouchableOpacity>

              {/* Sign Out CTA */}
              <TouchableOpacity 
                style={[settingsStyles.logoutBtn, { borderColor: theme.cardBorder }]}
                onPress={() => {
                  setIsSettingsOpen(false);
                  setAppState('welcome');
                }}
              >
                <LogOut size={15} color="#EF4444" />
                <Text style={settingsStyles.logoutText}>Sign Out / Switch Vault</Text>
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: RECALIBRATE STRUCTURE MODAL --- */}
      <Modal
        visible={isRecalibrateOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRecalibrateOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Recalibrate Structure</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Adjust income, commitments & cycle</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsRecalibrateOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>NET SALARY (₹)</Text>
            <TextInput
              style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              keyboardType="numeric"
              value={recalIncome}
              onChangeText={setRecalIncome}
            />

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>FIXED BILLS & EMIs (₹)</Text>
            <TextInput
              style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              keyboardType="numeric"
              value={recalBills}
              onChangeText={setRecalBills}
            />

            <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>DAYS REMAINING</Text>
            <TextInput
              style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              keyboardType="numeric"
              value={recalDays}
              onChangeText={setRecalDays}
            />

            <TouchableOpacity 
              style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} 
              onPress={handleSaveRecalibration}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.submitBtnText}>Save & Recalibrate Velocity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 4: CALENDAR & LENDING MODALS --- */}
      <Modal
        visible={isCalendarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '90%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Spending Patterns & Calendar</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Daily save checks & over-burn analysis</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsCalendarOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={calendarStyles.monthHeader}>
                <Text style={[calendarStyles.monthTitle, { color: theme.text }]}>Current Salary Cycle</Text>
              </View>
              <View style={calendarStyles.waveCard}>
                <TrendingUp size={15} color={theme.emerald} />
                <Text style={[calendarStyles.waveDesc, { color: theme.text }]}>
                  You maintain 3 consecutive days below safe daily velocity, followed by a slight weekend spike. Pacing engine absorbs this rhythm safely.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLendingOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLendingOpen(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '92%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Informal Money Lent</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Friendly receivables & WhatsApp nudges</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsLendingOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {moneyLentList.map((loan) => (
                <View key={loan.id} style={[lendingStyles.loanCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                  <View style={lendingStyles.loanHeader}>
                    <View>
                      <Text style={[lendingStyles.loanName, { color: theme.text }]}>{loan.borrowerName}</Text>
                      <Text style={[lendingStyles.loanMeta, { color: theme.textMuted }]}>{loan.lentDate} • {loan.notes}</Text>
                    </View>
                    <Text style={[lendingStyles.loanAmount, { color: theme.emerald }]}>{formatINR(loan.amount)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[lendingStyles.nudgeBtn, { backgroundColor: theme.emerald }]}
                    onPress={() => handleSendNudge(loan)}
                  >
                    <Handshake size={13} color="#FFFFFF" />
                    <Text style={lendingStyles.nudgeBtnText}>WhatsApp Nudge</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary, marginTop: 15 }]}>ADD NEW INFORMAL LOAN</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                placeholder="Friend's Name"
                placeholderTextColor={theme.textMuted}
                value={newLentName}
                onChangeText={setNewLentName}
              />
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                placeholder="Amount (₹)"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={newLentAmount}
                onChangeText={setNewLentAmount}
              />
              <TouchableOpacity 
                style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} 
                onPress={handleAddLentRecord}
              >
                <Text style={modalStyles.submitBtnText}>+ Track Informal Loan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// STYLESHEET DEFINITIONS
// ==========================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pacingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pacingChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionStack: {
    gap: 14,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroPaceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroPaceValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 2,
  },
  recalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  recalBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressSpentText: {
    fontSize: 12,
  },
  progressRatioText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gridContainer: {
    marginTop: 14,
    gap: 8,
  },
  gridRowPair: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  metricSub: {
    fontSize: 10,
    marginTop: 2,
  },
  surfaceCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  gestureHintBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  gestureHintText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  tagCarousel: {
    marginVertical: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 7,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tapControlsBar: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  tapDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tapActiveTagName: {
    fontSize: 12,
    fontWeight: '600',
  },
  tapAmountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapAmountValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  tapResetBtn: {
    padding: 4,
  },
  gestureChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  primaryLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryLogBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.12)',
    marginTop: 10,
  },
  successBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txDetails: {
    flex: 1,
  },
  txName: {
    fontSize: 13,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  diagnosticAlert: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  diagnosticAlertText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  bottomNavDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navSlotText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

// Gesture Chip Styles
const chipStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 42,
  },
  indicatorRow: {
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    marginVertical: 1,
  },
});

// Avatar Styles
const avatarStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  facePill: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 6,
    gap: 6,
    alignItems: 'center',
  },
  facePillLg: {
    borderRadius: 30,
    padding: 10,
    gap: 10,
  },
  facePillSm: {
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  eyeWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pupil: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 2,
  },
  twinkle: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  mouth: {
    width: 10,
    height: 4,
    backgroundColor: '#047857',
    borderRadius: 2,
    marginTop: 3,
  },
});

// Splash Styles
const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16,185,129,0.18)',
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 6,
    textAlign: 'center',
  },
  loadingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  loadingText: {
    fontSize: 12,
  },
});

// Welcome Styles
const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  heroBanner: {
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 16,
  },
  heroAvatarWrap: {
    marginBottom: 14,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heroSubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  featuresGrid: {
    gap: 12,
    marginVertical: 14,
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  ctaGroup: {
    gap: 10,
    marginTop: 10,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryCta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

// Login Styles
const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandHeading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  formGroup: {
    gap: 12,
  },
  inputBlock: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 4,
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  captchaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captchaEmptyBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  captchaMainText: {
    fontSize: 12,
    fontWeight: '700',
  },
  captchaSubText: {
    fontSize: 10,
    marginTop: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

// AI Loading Screen Styles
const aiLoadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  avatarBox: {
    marginBottom: 24,
  },
  percentText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    minHeight: 40,
  },
  progressBarTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 18,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  footerHint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 24,
  },
});

// Pace AI Chat Styles
const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiName: {
    fontSize: 14,
    fontWeight: '800',
  },
  aiRole: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetChatBtn: {
    padding: 6,
    borderRadius: 8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userBubbleRow: {
    justifyContent: 'flex-end',
  },
  assistantBubbleRow: {
    justifyContent: 'flex-start',
  },
  avatarBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleBox: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  promptBar: {
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  promptScroll: {
    paddingHorizontal: 14,
    gap: 6,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    marginBottom: Platform.OS === 'ios' ? 70 : 64,
  },
  inputField: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Modal Styles
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  amountInput: {
    height: 52,
    fontSize: 24,
    fontWeight: '900',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 18,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

// Settings Styles
const settingsStyles = StyleSheet.create({
  themeToggleRow: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
});

// Lending Styles
const lendingStyles = StyleSheet.create({
  loanCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  loanName: {
    fontSize: 13,
    fontWeight: '800',
  },
  loanMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  loanAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// Calendar Styles
const calendarStyles = StyleSheet.create({
  monthHeader: {
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  waveCard: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  waveDesc: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
`;

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', code);
console.log('Successfully wrote App.js to spendpace-expo!');
