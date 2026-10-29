const fs = require('fs');

const fullCode = `import React, { useState, useEffect, useRef } from 'react';
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
  User,
  Mail,
  LogOut,
  AlertCircle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- UNIVERSAL THEME PALETTES (DARK & LIGHT) ---
const THEMES = {
  dark: {
    mode: 'dark',
    bg: '#0B0C10',
    card: '#12141A',
    cardSubtle: '#181B24',
    cardBorder: 'rgba(255,255,255,0.07)',
    cardBorderActive: 'rgba(16,185,129,0.3)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    headerBg: '#0B0C10',
    navBg: 'rgba(11,12,16,0.96)',
    inputBg: '#181B24',
    inputBorder: 'rgba(255,255,255,0.1)',
    emerald: '#10B981',
    emeraldLight: '#34D399',
    amber: '#F59E0B',
    rose: '#EF4444',
    blue: '#3B82F6',
    purple: '#A855F7',
    tagBg: 'rgba(255,255,255,0.04)',
    statusBarStyle: 'light-content',
  },
  light: {
    mode: 'light',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardSubtle: '#F1F5F9',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardBorderActive: 'rgba(16,185,129,0.4)',
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
    statusBarStyle: 'dark-content',
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

// Export default App component
export default function App() {
  // Navigation Flow: 'splash' | 'welcome' | 'login' | 'loading_ai' | 'main'
  const [appState, setAppState] = useState('main'); // Defaults to main for instant dashboard access
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  // Active Tab: 'radar' | 'bento' | 'diagnostics' | 'copilot'
  const [activeTab, setActiveTab] = useState('radar');
  const [diagnosticsSubTab, setDiagnosticsSubTab] = useState('trajectory');
  const [newsTab, setNewsTab] = useState('macro');

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

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecalibrateOpen, setIsRecalibrateOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLendingOpen, setIsLendingOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Financial Engine Parameters
  const [monthlyIncome, setMonthlyIncome] = useState(85000);
  const [committedBills, setCommittedBills] = useState(32000);
  const [daysRemaining, setDaysRemaining] = useState(18);
  const [spentToday, setSpentToday] = useState(380);
  const [partTimeIncome, setPartTimeIncome] = useState(6400);

  // Dynamic Toggles & Alerts
  const [weekendFlex, setWeekendFlex] = useState(false);
  const [autoTightenPace, setAutoTightenPace] = useState(false);
  const [goalAlertDismissed, setGoalAlertDismissed] = useState(false);
  const [goalDaysRemaining, setGoalDaysRemaining] = useState(64);

  // Micro-Spend Quick Tracker
  const [selectedQuickTag, setSelectedQuickTag] = useState(QUICK_TAGS[0]);
  const [quickAmount, setQuickAmount] = useState(10);
  const [quickSuccessBanner, setQuickSuccessBanner] = useState(null);

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

  // Pace AI Copilot Conversation
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

  // --- MATHEMATICAL FORMULAS ---
  const totalInflows = monthlyIncome + partTimeIncome;
  const discretionaryPool = Math.max(0, totalInflows - committedBills);
  const remainingDiscretionary = Math.max(0, discretionaryPool - (spentToday * (30 - daysRemaining)));
  
  let safeDailyBase = daysRemaining > 0 ? Math.round(remainingDiscretionary / daysRemaining) : 0;
  if (weekendFlex) safeDailyBase = Math.round(safeDailyBase * 1.25);
  if (autoTightenPace) safeDailyBase = Math.max(0, safeDailyBase - 320);

  const safeDaily = safeDailyBase;
  const burnRate = safeDaily > 0 ? Math.min(100, Math.round((spentToday / safeDaily) * 100)) : 0;

  const getPacingStatus = () => {
    if (burnRate > 85) return { label: 'Burn Overheating', color: '#F43F5E', bgColor: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.3)' };
    if (burnRate > 60) return { label: 'Moderate Velocity', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' };
    return { label: 'Optimal Pace', color: '#10B981', bgColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' };
  };

  const status = getPacingStatus();

  // Email format validator
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);

  // Captcha trigger
  const handleTriggerCaptcha = () => {
    if (captchaStatus === 'verifying' || captchaStatus === 'verified') return;
    setCaptchaStatus('verifying');
    setTimeout(() => {
      setCaptchaStatus('verified');
    }, 800);
  };

  // Submit Auth & start AI Loading screen
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

    setAppState('loading_ai');
    setLoadingProgress(10);
    setLoadingMilestone('Connecting to Encrypted PostgreSQL Database...');

    setTimeout(() => {
      setLoadingProgress(40);
      setLoadingMilestone('Syncing Ledger, Commitments & Fixed EMIs...');
    }, 500);

    setTimeout(() => {
      setLoadingProgress(75);
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

  // Instant Pulse Increments / Decrements
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

  // Pace AI Copilot Send Chat
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const userMsg = { id: Date.now().toString(), role: 'user', text: userText, time: 'Just now' };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiTalking(true);

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
      // Offline fallback
    }

    if (!gotServerReply) {
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
          aiReply = \`Great shift! Added \${formatINR(amount)} to delivery income. Your daily safe velocity increased by +\${formatINR(Math.round(amount / (daysRemaining || 1)))}/day!\`;
        } else if (lower.includes('leak') || lower.includes('save') || lower.includes('cut')) {
          aiReply = 'Pace AI diagnostics identified potential savings of ~₹1,200/month by curbing weekend dining surges and ₹899/month on unused subscriptions.';
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

  // Save Modal Transaction
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

  // Save Recalibration
  const handleSaveRecalibration = () => {
    const inc = parseFloat(recalIncome);
    const bills = parseFloat(recalBills);
    const days = parseInt(recalDays, 10);
    if (isNaN(inc) || isNaN(bills) || isNaN(days)) {
      Alert.alert('Invalid Input', 'Please check your inputs.');
      return;
    }
    setMonthlyIncome(inc);
    setCommittedBills(bills);
    setDaysRemaining(days);
    setIsRecalibrateOpen(false);
    Alert.alert('Structure Recalibrated', 'Your daily safe velocity has been recomputed.');
  };

  const handleAddGig = (val) => {
    setPartTimeIncome((prev) => prev + val);
    Alert.alert('Inflow Added', \`+\${formatINR(val)} credited from gig shift.\`);
  };

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
    Alert.alert('Loan Logged', \`\${formatINR(newRecord.amount)} added to receivables.\`);
  };

  // ==========================================
  // VIEW: SPLASH SCREEN
  // ==========================================
  if (appState === 'splash') {
    return (
      <View style={[splashStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
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
  // VIEW: WELCOME / ONBOARDING SCREEN
  // ==========================================
  if (appState === 'welcome') {
    return (
      <SafeAreaView style={[welcomeStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
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

          <View style={welcomeStyles.featuresGrid}>
            <View style={[welcomeStyles.featureCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[welcomeStyles.featureIconBox, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <Compass size={20} color={theme.emerald} />
              </View>
              <Text style={[welcomeStyles.featureTitle, { color: theme.text }]}>Safe Daily Pace</Text>
              <Text style={[welcomeStyles.featureDesc, { color: theme.textSecondary }]}>
                One dynamically calculated safe limit per day that protects rent, EMIs, and savings.
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

            <TouchableOpacity 
              style={{ alignItems: 'center', paddingVertical: 10 }}
              onPress={() => setAppState('main')}
            >
              <Text style={{ fontSize: 12, color: theme.emerald, fontWeight: '700' }}>Explore Dashboard Directly &rarr;</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW: LOGIN / REGISTER SCREEN
  // ==========================================
  if (appState === 'login') {
    return (
      <SafeAreaView style={[loginStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
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

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={loginStyles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={loginStyles.brandHeader}>
              <View style={loginStyles.logoBadge}>
                <Sparkles size={28} color="#FFFFFF" />
              </View>
              <Text style={[loginStyles.brandHeading, { color: theme.text }]}>
                Spend<Text style={{ color: theme.emerald }}>Pace</Text>
              </Text>
              <Text style={[loginStyles.brandSub, { color: theme.textSecondary }]}>
                {authMode === 'login' ? 'Access live spend velocity and AI cashflow forecasting' : 'Start autonomous daily budget management'}
              </Text>
            </View>

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

            {authError ? (
              <View style={loginStyles.errorBanner}>
                <AlertCircle size={15} color="#EF4444" />
                <Text style={loginStyles.errorText}>{authError}</Text>
              </View>
            ) : null}

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

              <View style={loginStyles.inputBlock}>
                <Text style={[loginStyles.label, { color: theme.textSecondary }]}>SECURITY VERIFICATION</Text>
                <TouchableOpacity 
                  style={[loginStyles.captchaBox, { backgroundColor: theme.cardSubtle, borderColor: captchaStatus === 'verified' ? '#10B981' : theme.cardBorder }]}
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
                        {captchaStatus === 'verified' ? 'Security Token Verified' : captchaStatus === 'verifying' ? 'Checking Human Operator...' : 'Tap to complete Turnstile check'}
                      </Text>
                      <Text style={[loginStyles.captchaSubText, { color: theme.textMuted }]}>
                        {captchaStatus === 'verified' ? 'SHA-256 Cloudflare Signature' : 'Anti-bot zero-friction verification'}
                      </Text>
                    </View>
                  </View>
                  <ShieldCheck size={20} color={captchaStatus === 'verified' ? '#10B981' : theme.textMuted} />
                </TouchableOpacity>
              </View>

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
  // VIEW: FUN AI ANIMATED LOADING SCREEN
  // ==========================================
  if (appState === 'loading_ai') {
    return (
      <View style={[aiLoadingStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
        <View style={aiLoadingStyles.avatarBox}>
          <CartoonAIEyesNative isTalking={true} size="lg" />
        </View>
        <Text style={[aiLoadingStyles.percentText, { color: theme.emerald }]}>
          {loadingProgress}%
        </Text>
        <Text style={[aiLoadingStyles.milestoneText, { color: theme.text }]}>
          {loadingMilestone}
        </Text>
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
  // VIEW: MAIN DASHBOARD TABS
  // ==========================================
  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.headerBg} />

      {/* --- UNIFIED SINGLE-ROW EXECUTIVE HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>SpendPace</Text>
              <View style={[styles.pacingChip, { backgroundColor: status.bgColor }]}>
                <View style={[styles.pulseDot, { backgroundColor: status.color }]} />
                <Text style={[styles.pacingChipText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {userProfile.fullName} • {daysRemaining}d left
            </Text>
          </View>
        </View>

        {/* Action Cluster (Receipt, Dark/Light Toggle, Settings) */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionIconBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
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

      {/* --- DEDICATED PACE AI TAB VS DASHBOARD SCROLLVIEW --- */}
      {activeTab === 'copilot' ? (
        // DEDICATED PACE AI COPILOT CHAT (CHATGPT-LIKE UPWARD SCROLLING & ADAPTIVE KEYBOARD)
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[chatStyles.container, { backgroundColor: theme.bg }]}>
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
                  <View key={m.id} style={[chatStyles.bubbleRow, isUser ? chatStyles.userBubbleRow : chatStyles.assistantBubbleRow]}>
                    {!isUser && (
                      <View style={[chatStyles.avatarBubble, { backgroundColor: theme.cardSubtle }]}>
                        <Bot size={14} color={theme.emerald} />
                      </View>
                    )}
                    <View style={[chatStyles.bubbleBox, isUser ? [chatStyles.userBubble, { backgroundColor: theme.emerald }] : [chatStyles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]]}>
                      <Text style={[chatStyles.bubbleText, { color: isUser ? '#FFFFFF' : theme.text }]}>{m.text}</Text>
                      {m.time && (
                        <Text style={[chatStyles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>{m.time}</Text>
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

            <View style={[chatStyles.inputBar, { backgroundColor: theme.headerBg, borderTopColor: theme.cardBorder }]}>
              <TextInput
                style={[chatStyles.inputField, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                placeholder="Ask Pace or fast-log: 'Spent 350 for dinner'..."
                placeholderTextColor={theme.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity style={[chatStyles.sendBtn, { backgroundColor: theme.emerald }]} onPress={handleSendChat} activeOpacity={0.8}>
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // DASHBOARD SCROLLVIEW (RADAR, BENTO, DIAGNOSTICS)
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* VIEW 1: RADAR */}
          {activeTab === 'radar' && (
            <View style={styles.sectionStack}>
              {/* GOAL SHORTAGE WARNING */}
              {!goalAlertDismissed && (
                <View style={[styles.goalAlertCard, { backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.25)' }]}>
                  <View style={styles.goalAlertTop}>
                    <View style={styles.goalAlertBadge}>
                      <ShieldAlert size={12} color="#FFFFFF" />
                      <Text style={styles.goalAlertBadgeText}>SHORTAGE WARNING</Text>
                    </View>
                    <TouchableOpacity onPress={() => setGoalAlertDismissed(true)}>
                      <X size={15} color="#F43F5E" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.goalAlertTitle, { color: theme.text }]}>Emergency Fund Milestone Deficit</Text>
                  <Text style={[styles.goalAlertBody, { color: theme.textSecondary }]}>
                    Discretionary pace running <Text style={{ color: '#F43F5E', fontWeight: '800' }}>-₹320/day shortfall</Text> to hit ₹1,00,000 goal on time.
                  </Text>

                  <View style={styles.goalActionRow}>
                    <TouchableOpacity 
                      style={[styles.goalPillBtn, autoTightenPace && styles.goalPillBtnActive]}
                      onPress={() => setAutoTightenPace(!autoTightenPace)}
                    >
                      <TrendingDown size={13} color="#FFFFFF" />
                      <Text style={styles.goalPillBtnText}>
                        {autoTightenPace ? 'Shield Active (-₹320/d)' : 'Auto-Tighten Spend'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.goalExtendBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
                      onPress={() => {
                        setGoalDaysRemaining((prev) => prev + 30);
                        Alert.alert('Extended', 'Milestone target date extended by +30 days.');
                      }}
                    >
                      <Clock size={12} color="#F59E0B" />
                      <Text style={styles.goalExtendBtnText}>+30d</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* HERO RADAR ODOMETER CARD */}
              <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.heroTopRow}>
                  <View>
                    <Text style={[styles.heroKicker, { color: theme.textMuted }]}>AUTONOMOUS VELOCITY</Text>
                    <Text style={[styles.heroHeading, { color: theme.text }]}>Daily Safe-to-Spend</Text>
                  </View>

                  <View style={styles.heroBadgesRight}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                      <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                      <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.flexToggle, weekendFlex && styles.flexToggleActive, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
                      onPress={() => setWeekendFlex(!weekendFlex)}
                      activeOpacity={0.7}
                    >
                      <Sparkles size={11} color={weekendFlex ? '#F59E0B' : theme.textMuted} />
                      <Text style={[styles.flexToggleText, weekendFlex && styles.flexToggleTextActive, { color: weekendFlex ? '#F59E0B' : theme.textMuted }]}>
                        Flex
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.odometerRow}>
                  <Text style={[styles.odometerFigure, { color: theme.emerald }]}>{formatINR(safeDaily)}</Text>
                  <Text style={[styles.odometerUnit, { color: theme.textMuted }]}>/ day</Text>
                </View>

                <View style={styles.rolloverRow}>
                  <View style={[styles.rolloverPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Text style={[styles.rolloverPillText, { color: theme.emerald }]}>+₹180 Rollover from yesterday</Text>
                  </View>
                  <Text style={[styles.cycleSubCaption, { color: theme.textMuted }]}>{daysRemaining} days left in cycle</Text>
                </View>

                <View style={styles.burnTrackContainer}>
                  <View style={[styles.burnTrackBg, { backgroundColor: theme.cardSubtle }]}>
                    <View style={[styles.burnTrackFill, { width: \`\${Math.max(10, burnRate)}%\`, backgroundColor: status.color }]} />
                  </View>
                  <View style={styles.burnTrackLabels}>
                    <Text style={[styles.burnTrackLabel, { color: theme.textSecondary }]}>Discretionary Burn: <Text style={{ color: theme.text, fontWeight: '800' }}>{burnRate}%</Text></Text>
                    <Text style={[styles.burnTrackTarget, { color: theme.textMuted }]}>Target: &lt;65%</Text>
                  </View>
                </View>

                {/* FLUID 2x2 METRIC GRID */}
                <View style={styles.grid2x2}>
                  <View style={styles.gridRowPair}>
                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <View style={styles.metricHeader}>
                        <ShieldCheck size={13} color="#10B981" />
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Unallocated Buffer</Text>
                      </View>
                      <Text style={[styles.metricValue, { color: theme.text }]}>{formatINR(remainingDiscretionary)}</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <View style={styles.metricHeader}>
                        <Lock size={13} color="#F59E0B" />
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Committed Bills</Text>
                      </View>
                      <Text style={[styles.metricValue, { color: theme.rose }]}>{formatINR(committedBills)}</Text>
                    </View>
                  </View>

                  <View style={styles.gridRowPair}>
                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <View style={styles.metricHeader}>
                        <Clock size={13} color="#3B82F6" />
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Remaining Days</Text>
                      </View>
                      <Text style={[styles.metricValue, { color: theme.text }]}>{daysRemaining} Days</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <View style={styles.metricHeader}>
                        <Bike size={13} color="#10B981" />
                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Gig Inflows</Text>
                      </View>
                      <Text style={[styles.metricValue, { color: theme.blue }]}>{formatINR(partTimeIncome)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* INNOVATIVE INSTANT PULSE LOGGER WITH SWIPE UP (+) / SWIPE DOWN (-) */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.chipHeaderRow}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>Instant Pulse & Chai Logger</Text>
                      <View style={styles.gestureHintBadge}>
                        <Text style={styles.gestureHintText}>Swipe UP (+) • Swipe DOWN (-)</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>
                      Zero typing. Swipe chips vertically or tap to adjust micro-spends.
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
                        style={[styles.tagPill, { backgroundColor: isSelected ? 'rgba(16,185,129,0.12)' : theme.cardSubtle, borderColor: isSelected ? theme.emerald : theme.cardBorder }]}
                        onPress={() => setSelectedQuickTag(t)}
                      >
                        <IconC size={13} color={isSelected ? theme.emerald : t.color} />
                        <Text style={[styles.tagPillText, { color: isSelected ? theme.emerald : theme.textSecondary }]}>{t.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

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

                  {/* Innovative Gesture Chips (₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100) */}
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
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Ledger</Text>
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

          {/* VIEW 2: BENTO GRID (ALL ORIGINAL SECTIONS RESTORED) */}
          {activeTab === 'bento' && (
            <View style={styles.sectionStack}>
              {/* TILE 1: CASHFLOW VELOCITY */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Cashflow Velocity</Text>
                    <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>Inflow vs Discretionary Outflow</Text>
                  </View>
                  <View style={[styles.pillTag, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Text style={[styles.pillTagText, { color: theme.emerald }]}>Live Engine</Text>
                  </View>
                </View>

                <View style={styles.cashflowStack}>
                  <View style={styles.cashflowRow}>
                    <View style={styles.cashflowLabelWrap}>
                      <ArrowUpRight size={15} color="#10B981" />
                      <Text style={[styles.cashflowLabel, { color: theme.text }]}>Monthly Primary Inflow</Text>
                    </View>
                    <Text style={[styles.cashflowValGreen, { color: theme.emerald }]}>{formatINR(monthlyIncome)}</Text>
                  </View>

                  <View style={[styles.gigBox, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                    <View style={styles.gigTop}>
                      <View style={styles.gigTagRow}>
                        <Bike size={13} color="#10B981" />
                        <Text style={[styles.gigTagText, { color: theme.emerald }]}>+{formatINR(partTimeIncome)} Delivery Revenue</Text>
                      </View>
                      <Text style={[styles.gigPlatformText, { color: theme.textMuted }]}>Swiggy / Zomato</Text>
                    </View>
                    <View style={styles.gigButtonRow}>
                      <TouchableOpacity style={[styles.gigBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => handleAddGig(500)}>
                        <Text style={[styles.gigBtnText, { color: theme.text }]}>+₹500</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.gigBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => handleAddGig(1000)}>
                        <Text style={[styles.gigBtnText, { color: theme.text }]}>+₹1,000</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.gigBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => handleAddGig(1500)}>
                        <Text style={[styles.gigBtnText, { color: theme.text }]}>+₹1,500</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.cashflowRow}>
                    <View style={styles.cashflowLabelWrap}>
                      <ArrowDownRight size={15} color="#F43F5E" />
                      <Text style={[styles.cashflowLabel, { color: theme.text }]}>Discretionary Outflow</Text>
                    </View>
                    <Text style={styles.cashflowValRose}>{formatINR(spentToday)}</Text>
                  </View>

                  <View style={[styles.surplusRow, { borderTopColor: theme.cardBorder }]}>
                    <Text style={[styles.surplusLabel, { color: theme.textSecondary }]}>Net Surplus Saved</Text>
                    <Text style={[styles.surplusValue, { color: theme.emerald }]}>+{formatINR(discretionaryPool - spentToday)}</Text>
                  </View>
                </View>
              </View>

              {/* TILE 2: COMMITTED OUTFLOW SHIELD */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <Calendar size={15} color="#F59E0B" />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Committed Outflow Shield</Text>
                  </View>
                  <View style={[styles.reservedBadge, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                    <Text style={styles.reservedBadgeText}>Reserved</Text>
                  </View>
                </View>

                <View style={styles.shieldRows}>
                  <View style={[styles.shieldItem, { borderBottomColor: theme.cardBorder }]}>
                    <View>
                      <Text style={[styles.shieldName, { color: theme.text }]}>Bank EMIs & Loans</Text>
                      <Text style={[styles.shieldSub, { color: theme.textMuted }]}>Fixed commitments</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.shieldAmount, { color: theme.rose }]}>{formatINR(committedBills * 0.4)}</Text>
                      <Text style={styles.shieldStatusCommitted}>Committed</Text>
                    </View>
                  </View>

                  <View style={styles.shieldItem}>
                    <View>
                      <Text style={[styles.shieldName, { color: theme.text }]}>Family Living Reserve</Text>
                      <Text style={[styles.shieldSub, { color: theme.textMuted }]}>Rent & utilities</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.shieldAmount, { color: theme.amber }]}>{formatINR(committedBills * 0.6)}</Text>
                      <Text style={styles.shieldStatusProtected}>Protected</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* TILE 3: REGIONAL ECONOMIC RADAR */}
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardKicker, { color: theme.textMuted }]}>LIVE ECONOMIC RADAR</Text>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Regional Rates & Bulletins</Text>
                  </View>
                  <View style={[styles.toggleTabs, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                    <TouchableOpacity
                      style={[styles.toggleTab, newsTab === 'macro' && styles.toggleTabActive]}
                      onPress={() => setNewsTab('macro')}
                    >
                      <Text style={[styles.toggleTabText, newsTab === 'macro' && styles.toggleTabTextActive]}>Rates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleTab, newsTab === 'news' && styles.toggleTabActive]}
                      onPress={() => setNewsTab('news')}
                    >
                      <Text style={[styles.toggleTabText, newsTab === 'news' && styles.toggleTabTextActive]}>News</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newsTab === 'macro' ? (
                  <View style={styles.grid2x2}>
                    <View style={styles.gridRowPair}>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Fuel size={13} color="#F59E0B" />
                          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Petrol / L</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: theme.text }]}>₹101.20</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Stable today</Text>
                      </View>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Coins size={13} color="#EAB308" />
                          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>24K Gold / g</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: theme.text }]}>₹7,860</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>+0.4% week</Text>
                      </View>
                    </View>

                    <View style={styles.gridRowPair}>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Landmark size={13} color="#3B82F6" />
                          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>RBI Repo</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: theme.text }]}>6.50%</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>EMI stable</Text>
                      </View>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Flame size={13} color="#F43F5E" />
                          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>LPG Cylinder</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: theme.text }]}>₹803.00</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Subsidized</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.bulletinList}>
                    {[
                      { tag: 'Fuel', title: 'Crude oil consolidates around $74/bbl: Retail petrol steady.', tip: 'Safe monthly fuel envelope.' },
                      { tag: 'Gold', title: 'Gold prices witness steady festive accumulation.', tip: 'Gold asset milestone on track.' },
                      { tag: 'Banking', title: 'Monetary Policy Committee maintains repo pause.', tip: 'EMI projections stay fixed.' },
                    ].map((b, idx) => (
                      <View key={idx} style={[styles.bulletinItem, { borderBottomColor: theme.cardBorder }]}>
                        <Text style={styles.bulletinTag}>{b.tag}</Text>
                        <Text style={[styles.bulletinTitle, { color: theme.text }]}>{b.title}</Text>
                        <Text style={[styles.bulletinTip, { color: theme.textMuted }]}>{b.tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* TILE 4: FRIENDS & INFORMAL MONEY LENT GATEWAY */}
              <TouchableOpacity 
                style={[styles.gatewayTile, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setIsLendingOpen(true)}
                activeOpacity={0.7}
              >
                <View style={styles.gatewayIconWrapTeal}>
                  <Handshake size={20} color="#14B8A6" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.gatewayTitleRow}>
                    <Text style={[styles.gatewayHeading, { color: theme.text }]}>Informal Money Lent</Text>
                    <View style={styles.tealBadge}>
                      <Text style={styles.tealBadgeText}>WhatsApp Nudge</Text>
                    </View>
                  </View>
                  <Text style={[styles.gatewayCaption, { color: theme.textSecondary }]}>Track friendly receivables & send WhatsApp nudges</Text>
                </View>
                <ArrowRight size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* VIEW 3: DIAGNOSTICS & PREDICTIVE FORECASTING */}
          {activeTab === 'diagnostics' && (
            <View style={styles.sectionStack}>
              <View style={[styles.surfaceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.diagBadge}>
                      <Activity size={16} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>Pace Diagnostics</Text>
                      <Text style={[styles.cardSubText, { color: theme.textSecondary }]}>6-Month Predictive Trajectory</Text>
                    </View>
                  </View>

                  <View style={styles.healthBox}>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.healthLabel, { color: theme.textMuted }]}>HEALTH</Text>
                      <Text style={[styles.healthScore, { color: theme.text }]}>88 / 100</Text>
                    </View>
                    <View style={styles.gradeBox}>
                      <Text style={styles.gradeText}>A</Text>
                    </View>
                  </View>
                </View>

                {/* Verdict Banner */}
                <View style={[styles.verdictCard, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Sparkles size={14} color="#10B981" />
                  <Text style={[styles.verdictText, { color: theme.text }]}>
                    Discretionary pacing is tracking 14% below monthly ceiling. Safe surplus projected at ₹32,000.
                  </Text>
                </View>

                {/* Diagnostics Sub-Tabs */}
                <View style={[styles.diagTabs, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                  <TouchableOpacity 
                    style={[styles.diagTabBtn, diagnosticsSubTab === 'trajectory' && styles.diagTabBtnActive]}
                    onPress={() => setDiagnosticsSubTab('trajectory')}
                  >
                    <Text style={[styles.diagTabText, diagnosticsSubTab === 'trajectory' && styles.diagTabTextActive]}>
                      Trajectory
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.diagTabBtn, diagnosticsSubTab === 'categories' && styles.diagTabBtnActive]}
                    onPress={() => setDiagnosticsSubTab('categories')}
                  >
                    <Text style={[styles.diagTabText, diagnosticsSubTab === 'categories' && styles.diagTabTextActive]}>
                      Trends
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.diagTabBtn, diagnosticsSubTab === 'leaks' && styles.diagTabBtnActive]}
                    onPress={() => setDiagnosticsSubTab('leaks')}
                  >
                    <Text style={[styles.diagTabText, diagnosticsSubTab === 'leaks' && styles.diagTabTextActive]}>
                      Leaks (2)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 6-Month Trajectory Simulator (2x2 Pairs) */}
                {diagnosticsSubTab === 'trajectory' && (
                  <View style={styles.grid2x2}>
                    <View style={styles.gridRowPair}>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Nov</Text>
                          <Text style={styles.trajConf}>High</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹18,500</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹18,500</Text>
                      </View>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Dec</Text>
                          <Text style={styles.trajConf}>High</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹19,200</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹37,700</Text>
                      </View>
                    </View>

                    <View style={styles.gridRowPair}>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Jan</Text>
                          <Text style={styles.trajConf}>Med</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹17,800</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹55,500</Text>
                      </View>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Feb</Text>
                          <Text style={styles.trajConf}>Med</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹18,100</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹73,600</Text>
                      </View>
                    </View>

                    <View style={styles.gridRowPair}>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Mar</Text>
                          <Text style={styles.trajConf}>Med</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹19,500</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹93,100</Text>
                      </View>
                      <View style={[styles.metricCard, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                        <View style={styles.metricHeader}>
                          <Text style={[styles.trajMonth, { color: theme.text }]}>Apr</Text>
                          <Text style={styles.trajConf}>Est</Text>
                        </View>
                        <Text style={[styles.trajSurplus, { color: theme.emerald }]}>+₹20,000</Text>
                        <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Pool: ₹1,13,100</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Categories Tab */}
                {diagnosticsSubTab === 'categories' && (
                  <View style={styles.shieldRows}>
                    {[
                      { name: 'Dining & Outside Food', amount: 3400, percent: 38, color: '#F59E0B' },
                      { name: 'Fuel & Daily Commute', amount: 2200, percent: 24, color: '#3B82F6' },
                      { name: 'Groceries & Household', amount: 1800, percent: 20, color: '#10B981' },
                      { name: 'Subscriptions & Bills', amount: 1600, percent: 18, color: '#A855F7' },
                    ].map((cat, idx) => (
                      <View key={idx} style={[styles.shieldItem, { borderBottomColor: theme.cardBorder }]}>
                        <View>
                          <Text style={[styles.shieldName, { color: theme.text }]}>{cat.name}</Text>
                          <Text style={[styles.shieldSub, { color: theme.textMuted }]}>{cat.percent}% of discretionary burn</Text>
                        </View>
                        <Text style={[styles.shieldAmount, { color: cat.color }]}>{formatINR(cat.amount)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Leaks Tab */}
                {diagnosticsSubTab === 'leaks' && (
                  <View style={{ gap: 8 }}>
                    <View style={[styles.diagnosticAlert, { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' }]}>
                      <AlertTriangle size={15} color="#F59E0B" />
                      <Text style={[styles.diagnosticAlertText, { color: theme.text }]}>
                        Weekend dining spend surges by ~38% compared to weekdays. Pace AI suggests a ₹600 cap on Friday nights.
                      </Text>
                    </View>
                    <View style={[styles.diagnosticAlert, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }]}>
                      <AlertTriangle size={15} color="#EF4444" />
                      <Text style={[styles.diagnosticAlertText, { color: theme.text }]}>
                        2 streaming memberships unutilized in the past 45 days (~₹899/mo potential savings).
                      </Text>
                    </View>
                  </View>
                )}
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
          <TouchableOpacity style={styles.navSlot} onPress={() => setActiveTab('radar')}>
            <Compass size={19} color={activeTab === 'radar' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'radar' ? theme.emerald : theme.textMuted }]}>Radar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navSlot} onPress={() => setActiveTab('bento')}>
            <Layers size={19} color={activeTab === 'bento' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'bento' ? theme.emerald : theme.textMuted }]}>Bento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.centerFab, { backgroundColor: theme.emerald }]} 
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.85}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navSlot} onPress={() => setActiveTab('diagnostics')}>
            <Activity size={19} color={activeTab === 'diagnostics' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'diagnostics' ? theme.emerald : theme.textMuted }]}>Diagnostics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navSlot} onPress={() => setActiveTab('copilot')}>
            <Bot size={19} color={activeTab === 'copilot' ? theme.emerald : theme.textMuted} />
            <Text style={[styles.navSlotText, { color: activeTab === 'copilot' ? theme.emerald : theme.textMuted }]}>Pace AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MODAL 1: ADD TRANSACTION --- */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsAddModalOpen(false)}>
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
                    style={[modalStyles.catChip, { backgroundColor: isSelected ? 'rgba(16,185,129,0.12)' : theme.cardSubtle, borderColor: isSelected ? theme.emerald : theme.cardBorder }]}
                    onPress={() => setLogCategory(c.name)}
                  >
                    <IconC size={13} color={isSelected ? theme.emerald : theme.textSecondary} />
                    <Text style={[modalStyles.catChipText, { color: isSelected ? theme.emerald : theme.textSecondary }]}>{c.name}</Text>
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

            <TouchableOpacity style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} onPress={handleSaveTransaction} activeOpacity={0.85}>
              <Text style={modalStyles.submitBtnText}>Deduct from Daily Pace</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: RECALIBRATE STRUCTURE --- */}
      <Modal visible={isRecalibrateOpen} animationType="slide" transparent={true} onRequestClose={() => setIsRecalibrateOpen(false)}>
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

            <TouchableOpacity style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} onPress={handleSaveRecalibration} activeOpacity={0.85}>
              <Text style={modalStyles.submitBtnText}>Save & Recalibrate Velocity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: PROFILE & SETTINGS EDIT MODAL --- */}
      <Modal visible={isSettingsOpen} animationType="slide" transparent={true} onRequestClose={() => setIsSettingsOpen(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '92%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Settings & Vault Profile</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Manage account, theme & database sync</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsSettingsOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                value={monthlyIncome.toString()}
                onChangeText={(t) => {
                  const val = parseFloat(t) || 0;
                  setMonthlyIncome(val);
                }}
              />

              <Text style={[modalStyles.inputLabel, { color: theme.textSecondary }]}>PAY CYCLE DAY (1 - 31)</Text>
              <TextInput
                style={[modalStyles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                keyboardType="numeric"
                value={userProfile.payCycleDay.toString()}
                onChangeText={(t) => setUserProfile({ ...userProfile, payCycleDay: parseInt(t, 10) || 1 })}
              />

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

      {/* --- MODAL 4: CALENDAR & PATTERNS --- */}
      <Modal visible={isCalendarOpen} animationType="slide" transparent={true} onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '90%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Spending Patterns & Calendar</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Daily save checks & 3-day waves</Text>
              </View>
              <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsCalendarOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={calendarStyles.monthHeader}>
                <Text style={[calendarStyles.monthTitle, { color: theme.text }]}>Current Salary Cycle</Text>
              </View>
              <View style={[calendarStyles.waveCard, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                <TrendingUp size={15} color={theme.emerald} />
                <Text style={[calendarStyles.waveDesc, { color: theme.text }]}>
                  You maintain 3 consecutive days below safe daily velocity, followed by a minor weekend spike on Friday/Saturday. Pacing engine absorbs this rhythm safely.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 5: INFORMAL LENDING --- */}
      <Modal visible={isLendingOpen} animationType="slide" transparent={true} onRequestClose={() => setIsLendingOpen(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: theme.card, maxHeight: '92%' }]}>
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Friends & Informal Money Lent</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.textSecondary }]}>Track friendly receivables & WhatsApp nudges</Text>
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
              <TouchableOpacity style={[modalStyles.submitBtn, { backgroundColor: theme.emerald }]} onPress={handleAddLentRecord}>
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
// STYLESHEET
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
  goalAlertCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalAlertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalAlertBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  goalAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  goalAlertBody: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  goalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  goalPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  goalPillBtnActive: {
    backgroundColor: '#10B981',
  },
  goalPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalExtendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  goalExtendBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
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
  heroKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  heroBadgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  flexToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  flexToggleActive: {
    borderColor: '#F59E0B',
  },
  flexToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  flexToggleTextActive: {
    color: '#F59E0B',
  },
  odometerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  odometerFigure: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  odometerUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  rolloverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  rolloverPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rolloverPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cycleSubCaption: {
    fontSize: 11,
  },
  burnTrackContainer: {
    marginTop: 14,
  },
  burnTrackBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  burnTrackFill: {
    height: '100%',
    borderRadius: 4,
  },
  burnTrackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  burnTrackLabel: {
    fontSize: 11,
  },
  burnTrackTarget: {
    fontSize: 11,
  },
  grid2x2: {
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
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
  pillTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cashflowStack: {
    gap: 8,
  },
  cashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cashflowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashflowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  cashflowValGreen: {
    fontSize: 14,
    fontWeight: '800',
  },
  cashflowValRose: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F43F5E',
  },
  gigBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  gigTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gigTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  gigTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gigPlatformText: {
    fontSize: 10,
  },
  gigButtonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gigBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  gigBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  surplusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  surplusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  surplusValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reservedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reservedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  shieldRows: {
    gap: 8,
  },
  shieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  shieldName: {
    fontSize: 13,
    fontWeight: '700',
  },
  shieldSub: {
    fontSize: 10,
    marginTop: 2,
  },
  shieldAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  shieldStatusCommitted: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  shieldStatusProtected: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 2,
  },
  cardKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggleTabs: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleTabActive: {
    backgroundColor: '#10B981',
  },
  toggleTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTabTextActive: {
    color: '#FFFFFF',
  },
  bulletinList: {
    gap: 8,
    marginTop: 4,
  },
  bulletinItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  bulletinTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  bulletinTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bulletinTip: {
    fontSize: 10,
    marginTop: 2,
  },
  gatewayTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  gatewayIconWrapTeal: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(20,184,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gatewayHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  tealBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(20,184,166,0.15)',
  },
  tealBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#14B8A6',
  },
  gatewayCaption: {
    fontSize: 11,
    marginTop: 2,
  },
  diagBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  healthScore: {
    fontSize: 12,
    fontWeight: '800',
  },
  gradeBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  verdictCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  verdictText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  diagTabs: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  diagTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 7,
  },
  diagTabBtnActive: {
    backgroundColor: '#10B981',
  },
  diagTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  diagTabTextActive: {
    color: '#FFFFFF',
  },
  trajMonth: {
    fontSize: 13,
    fontWeight: '800',
  },
  trajConf: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  trajSurplus: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  diagnosticAlert: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  diagnosticAlertText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
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
  },
  waveDesc: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
`;

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', fullCode);
console.log('Successfully wrote unified App.js!');
`;

fs.writeFileSync('d:/Shortfundly/spendpace/scripts/create_full_app.js', fullCode);
console.log('Script written!');
