const fs = require('fs');

let code = fs.readFileSync('d:/Shortfundly/spendpace-expo/App.js', 'utf8');

// 1. Add Svg imports and Keyboard
if (!code.includes('react-native-svg')) {
  code = code.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport Svg, { Path, Rect, Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';"
  );
}

if (!code.includes('Keyboard,') && !code.includes('Keyboard\n')) {
  code = code.replace(
    'KeyboardAvoidingView,',
    'KeyboardAvoidingView,\n  Keyboard,'
  );
}

// 2. Add SpendPaceLogoMark component before CartoonAIEyesNative
const logoMarkComponent = `
// --- SPENDPACE VECTOR LOGO MARK (FINANCE AI MANAGER) ---
function SpendPaceLogoMark({ size = 44, withGlow = true }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 256 256" width={size} height={size}>
        <Defs>
          <LinearGradient id="emeraldGrad" x1="40" y1="216" x2="216" y2="40" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#059669" />
            <Stop offset="50%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#34D399" />
          </LinearGradient>
          <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect x="12" y="12" width="232" height="232" rx="54" fill="#0B0C10" stroke="#10B981" strokeWidth="3" strokeOpacity={0.3} />
        {withGlow && <Circle cx="128" cy="128" r="80" fill="url(#coreGlow)" />}

        {/* Continuous Pace Loop: Upper Dynamic S-Ribbon */}
        <Path
          d="M 172 72 C 204 72 216 98 210 124 C 202 152 168 166 128 174 C 88 182 64 196 64 212"
          stroke="url(#emeraldGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Counter Balance Arc (Financial Health & Equilibrium) */}
        <Path
          d="M 84 184 C 52 184 40 158 46 132 C 54 104 88 90 128 82 C 168 74 192 60 192 44"
          stroke="url(#emeraldGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.4}
        />

        {/* Center AI Node: 4-Point Neural Sparkle */}
        <Path
          d="M 128 104 C 128 117 137 128 152 128 C 137 128 128 139 128 152 C 128 139 119 128 104 128 C 119 128 128 117 128 104 Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}
`;

if (!code.includes('SpendPaceLogoMark')) {
  code = code.replace('// --- PURE NATIVE CARTOON AI EYES AVATAR ---', logoMarkComponent + '\n// --- PURE NATIVE CARTOON AI EYES AVATAR ---');
}

// 3. Change initial appState to 'splash'
code = code.replace(
  "const [appState, setAppState] = useState('main'); // Defaults to main for instant dashboard access",
  "const [appState, setAppState] = useState('splash'); // Splash -> Welcome -> Login -> AI Loading -> Main"
);

// 4. Add splash screen timer and keyboard listeners in App component
const splashAndKeyboardHook = `
  // Auto-transition from Splash to Welcome after 2 seconds
  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('welcome');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Keep chat scrolled to bottom when keyboard appears (ChatGPT-style)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => showSub.remove();
  }, []);
`;

if (!code.includes('Auto-transition from Splash to Welcome')) {
  code = code.replace(
    '// Submit Auth & start AI Loading screen',
    splashAndKeyboardHook + '\n  // Submit Auth & start AI Loading screen'
  );
}

// 5. Replace splash screen with SpendPaceLogoMark
const newSplashScreen = `  // ==========================================
  // VIEW: SPLASH SCREEN
  // ==========================================
  if (appState === 'splash') {
    return (
      <View style={[splashStyles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
        <View style={splashStyles.logoBox}>
          <SpendPaceLogoMark size={110} withGlow={true} />
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
  }`;

code = code.replace(
  /\/\/ ==========================================\s*\/\/ VIEW: SPLASH SCREEN\s*\/\/ ==========================================[\s\S]*?\/\/ ==========================================\s*\/\/ VIEW: WELCOME \/ ONBOARDING SCREEN/,
  newSplashScreen + '\n\n  // ==========================================\n  // VIEW: WELCOME / ONBOARDING SCREEN'
);

// 6. Update Welcome screen logo badge with SpendPaceLogoMark
code = code.replace(
  /<View style={welcomeStyles\.miniBadge}>\s*<Sparkles size={16} color="#FFFFFF" \/>\s*<\/View>/g,
  '<SpendPaceLogoMark size={28} withGlow={false} />'
);

// 7. Update Login screen logo with SpendPaceLogoMark
code = code.replace(
  /<View style={loginStyles\.logoBadge}>\s*<Sparkles size={28} color="#FFFFFF" \/>\s*<\/View>/g,
  '<SpendPaceLogoMark size={56} withGlow={true} />'
);

// 8. Update main header logo with SpendPaceLogoMark
code = code.replace(
  /<View style={styles\.brandIconBox}>\s*<Sparkles size={18} color="#FFFFFF" \/>\s*<\/View>/g,
  '<SpendPaceLogoMark size={34} withGlow={false} />'
);

// 9. Fix corrupted characters and regexes
code = code.split('\\d+').join('\\d+'); // keep safe
code = code.replace(/\/\\\\d\+\//g, '/\\d+/');
code = code.replace(/potential savings of ~.*11,200/g, 'potential savings of ~₹11,200');
code = code.replace(/and .*1899\/month/g, 'and ₹1,899/month');
code = code.replace(/{userProfile\.fullName} .* {daysRemaining}d left/g, '{userProfile.fullName} • {daysRemaining}d left');

// 10. Enhance KeyboardAvoidingView in copilot tab
code = code.replace(
  "<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>",
  "<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20} style={{ flex: 1 }}>"
);

// 11. Add Replay Onboarding button in Settings modal
const replayButtonCode = `
              <TouchableOpacity 
                style={[settingsStyles.syncBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder, marginTop: 6 }]}
                onPress={() => {
                  setIsSettingsOpen(false);
                  setAppState('splash');
                }}
              >
                <Sparkles size={14} color={theme.emerald} />
                <Text style={[settingsStyles.syncBtnText, { color: theme.text }]}>Replay Splash & AI Onboarding</Text>
              </TouchableOpacity>
`;

if (!code.includes('Replay Splash & AI Onboarding')) {
  code = code.replace(
    '<TouchableOpacity \n                style={[settingsStyles.logoutBtn',
    replayButtonCode + '\n              <TouchableOpacity \n                style={[settingsStyles.logoutBtn'
  );
}

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', code, 'utf8');
console.log('Successfully patched App.js! Total lines:', code.split('\n').length);

const parser = require('@babel/parser');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('BABEL CHECK: ALL SYNTAX 100% VALID! ZERO ERRORS!');
} catch (e) {
  console.error('Parse error:', e.message, 'at line', e.loc ? e.loc.line : '?');
}
