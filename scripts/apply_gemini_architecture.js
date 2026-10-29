const fs = require('fs');

let code = fs.readFileSync('d:/Shortfundly/spendpace-expo/App.js', 'utf8');

// 1. Add react-native-safe-area-context imports and ArrowLeft / ArrowUp icons
if (!code.includes('react-native-safe-area-context')) {
  code = code.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';"
  );
}

if (!code.includes('ArrowLeft,') && !code.includes('ArrowLeft\n')) {
  code = code.replace(
    'ArrowRight,',
    'ArrowRight,\n  ArrowLeft,\n  ArrowUp,'
  );
}

// 2. Refactor export default function App() to be a wrapper around SpendPaceApp with SafeAreaProvider
if (!code.includes('function SpendPaceApp()')) {
  code = code.replace(
    'export default function App() {',
    'export default function App() {\n  return (\n    <SafeAreaProvider>\n      <SpendPaceApp />\n    </SafeAreaProvider>\n  );\n}\n\nfunction SpendPaceApp() {'
  );
}

// 3. Add useSafeAreaInsets hook, keyboard state, and reset auth defaults for fresh account
const hooksSetup = `
  const insets = useSafeAreaInsets();
  const topSafety = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
`;

if (!code.includes('const topSafety =')) {
  code = code.replace(
    "const [appState, setAppState] = useState('splash'); // Splash -> Welcome -> Login -> AI Loading -> Main",
    hooksSetup + "\n  const [appState, setAppState] = useState('welcome'); // Starts on Welcome for new account"
  );
}

// 4. Reset auth credentials state to empty for fresh account creation
code = code.replace(
  "const [authEmail, setAuthEmail] = useState('alex@spendpace.com');",
  "const [authEmail, setAuthEmail] = useState('');"
);
code = code.replace(
  "const [authPassword, setAuthPassword] = useState('PaceSecure2026!');",
  "const [authPassword, setAuthPassword] = useState('');"
);
code = code.replace(
  "const [authFullName, setAuthFullName] = useState('Alex Vance');",
  "const [authFullName, setAuthFullName] = useState('');"
);
code = code.replace(
  "const [authMode, setAuthMode] = useState('login');",
  "const [authMode, setAuthMode] = useState('register');"
);

// 5. Update root views to use topSafety for bulletproof status bar safety
code = code.replace(
  /<SafeAreaView style=\[(\w+Styles|styles)\.container, { backgroundColor: theme\.bg/g,
  '<View style={[$1.container, { backgroundColor: theme.bg, paddingTop: topSafety'
);
code = code.replace(
  /<SafeAreaView style=\[styles\.safeContainer, { backgroundColor: theme\.bg/g,
  '<View style={[styles.safeContainer, { backgroundColor: theme.bg, paddingTop: topSafety'
);

code = code.replace(
  /<\/SafeAreaView>/g,
  '</View>'
);

// 6. Replace copilot view with Gemini mobile chat architecture
const geminiChatView = `      {/* --- DEDICATED PACE AI CHAT (GEMINI MOBILE CHAT ARCHITECTURE) --- */}
      {activeTab === 'copilot' ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          <View style={[geminiChatStyles.container, { backgroundColor: theme.bg }]}>
            {/* Top Gemini-Style Header */}
            <View style={[geminiChatStyles.headerBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }]}>
              <View style={geminiChatStyles.headerLeft}>
                <TouchableOpacity 
                  style={[geminiChatStyles.backBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={() => setActiveTab('radar')}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={18} color={theme.text} />
                </TouchableOpacity>

                <View style={geminiChatStyles.geminiBrandWrap}>
                  <View style={geminiChatStyles.sparkBadge}>
                    <Sparkles size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={[geminiChatStyles.geminiTitle, { color: theme.text }]}>Pace AI</Text>
                    <View style={geminiChatStyles.statusRow}>
                      <View style={geminiChatStyles.liveDot} />
                      <Text style={[geminiChatStyles.geminiSubtitle, { color: theme.emerald }]}>Gemini Intelligence • Active</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={geminiChatStyles.headerRight}>
                <TouchableOpacity 
                  style={[geminiChatStyles.iconActionBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={() => {
                    setMessages([]);
                  }}
                  activeOpacity={0.75}
                >
                  <RotateCcw size={15} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Middle Message Stream OR Gemini Empty State Canvas */}
            {messages.length === 0 ? (
              <ScrollView 
                contentContainerStyle={geminiChatStyles.emptyCanvasContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={geminiChatStyles.emptyHero}>
                  <View style={geminiChatStyles.avatarRing}>
                    <CartoonAIEyesNative size="lg" />
                  </View>
                  <Text style={[geminiChatStyles.emptyGreeting, { color: theme.text }]}>
                    Hello, <Text style={{ color: theme.emerald }}>{userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'there'}</Text>
                  </Text>
                  <Text style={[geminiChatStyles.emptySubtext, { color: theme.textSecondary }]}>
                    How can I assist your financial velocity today?
                  </Text>
                </View>

                {/* Gemini 4-Card Suggestion Grid */}
                <View style={geminiChatStyles.suggestionsGrid}>
                  {[
                    { label: 'Safe pace today?', desc: 'Check safe-to-spend limit', icon: Compass, color: theme.emerald },
                    { label: 'Spent ₹450 on fuel', desc: 'Auto-log to fuel ledger', icon: Fuel, color: theme.blue },
                    { label: 'Earned ₹1,200 on gig', desc: 'Add delivery inflow', icon: Bike, color: theme.amber },
                    { label: 'Audit spend leaks', desc: 'Scan weekend dining surges', icon: AlertTriangle, color: theme.rose },
                  ].map((card, i) => {
                    const IconC = card.icon;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[geminiChatStyles.geminiCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                        onPress={() => {
                          setChatInput(card.label);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={[geminiChatStyles.cardIconBox, { backgroundColor: card.color + '15' }]}>
                          <IconC size={16} color={card.color} />
                        </View>
                        <Text style={[geminiChatStyles.cardLabel, { color: theme.text }]}>{card.label}</Text>
                        <Text style={[geminiChatStyles.cardDesc, { color: theme.textSecondary }]}>{card.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <ScrollView
                ref={chatScrollRef}
                style={geminiChatStyles.messageList}
                contentContainerStyle={geminiChatStyles.messageListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <View key={m.id} style={[geminiChatStyles.bubbleRow, isUser ? geminiChatStyles.userBubbleRow : geminiChatStyles.assistantBubbleRow]}>
                      {!isUser && (
                        <View style={[geminiChatStyles.assistantAvatarCircle, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                          <Sparkles size={14} color={theme.emerald} />
                        </View>
                      )}
                      <View style={[
                        geminiChatStyles.bubbleBox, 
                        isUser 
                          ? [geminiChatStyles.userBubble, { backgroundColor: theme.emerald }] 
                          : [geminiChatStyles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]
                      ]}>
                        <Text style={[geminiChatStyles.bubbleText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                          {m.text}
                        </Text>
                        {m.time && (
                          <Text style={[geminiChatStyles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                            {m.time}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}

                {isAiTalking && (
                  <View style={[geminiChatStyles.bubbleRow, geminiChatStyles.assistantBubbleRow]}>
                    <View style={[geminiChatStyles.assistantAvatarCircle, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
                      <Sparkles size={14} color={theme.emerald} />
                    </View>
                    <View style={[geminiChatStyles.bubbleBox, geminiChatStyles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color={theme.emerald} />
                        <Text style={[geminiChatStyles.bubbleText, { color: theme.textSecondary }]}>Pace is thinking...</Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Gemini Floating Pill Input Bar (STUCK FLUSH TO KEYBOARD) */}
            <View style={[
              geminiChatStyles.inputOuterWrap, 
              { 
                backgroundColor: theme.bg,
                paddingBottom: isKeyboardVisible ? 6 : Math.max(insets.bottom, 12),
              }
            ]}>
              <View style={[geminiChatStyles.geminiPill, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorderActive }]}>
                <TouchableOpacity 
                  style={geminiChatStyles.pillActionBtn}
                  onPress={() => setChatInput('What is my safe pace today?')}
                  activeOpacity={0.7}
                >
                  <Sparkles size={17} color={theme.emerald} />
                </TouchableOpacity>

                <TextInput
                  style={[geminiChatStyles.pillTextInput, { color: theme.text }]}
                  placeholder="Ask Pace or fast-log: 'Spent 350 for dinner'..."
                  placeholderTextColor={theme.textMuted}
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={handleSendChat}
                  returnKeyType="send"
                  multiline={true}
                />

                <TouchableOpacity 
                  style={[
                    geminiChatStyles.pillSendBtn, 
                    { backgroundColor: chatInput.trim() ? theme.emerald : theme.cardBorder }
                  ]} 
                  onPress={handleSendChat} 
                  activeOpacity={0.8}
                  disabled={!chatInput.trim()}
                >
                  <ArrowUp size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (`;

code = code.replace(
  /{\/\* --- DEDICATED PACE AI CHAT \(CHATGPT\/GEMINI UPWARD SCROLLING & KEYBOARD FLUSH\) --- \*\/}[\s\S]*?\/\/ DASHBOARD SCROLLVIEW \(RADAR, BENTO, DIAGNOSTICS\)\s*<ScrollView style={styles\.contentContainer} showsVerticalScrollIndicator={false}>/,
  geminiChatView + '\n        // DASHBOARD SCROLLVIEW (RADAR, BENTO, DIAGNOSTICS)\n        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>'
);

// 7. Add geminiChatStyles in StyleSheet
const geminiChatStylesDef = `
const geminiChatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geminiBrandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geminiTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  geminiSubtitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCanvasContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarRing: {
    marginBottom: 16,
  },
  emptyGreeting: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  suggestionsGrid: {
    gap: 10,
  },
  geminiCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
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
  assistantAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bubbleBox: {
    maxWidth: '82%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
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
    lineHeight: 20,
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputOuterWrap: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  geminiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 8,
  },
  pillActionBtn: {
    padding: 6,
  },
  pillTextInput: {
    flex: 1,
    fontSize: 13,
    maxHeight: 90,
  },
  pillSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
`;

if (!code.includes('const geminiChatStyles')) {
  code = code.replace(
    'const modalStyles = StyleSheet.create({',
    geminiChatStylesDef + '\nconst modalStyles = StyleSheet.create({'
  );
}

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', code, 'utf8');
console.log('App.js patched with Gemini Architecture & Universal Safe Area! Total lines:', code.split('\n').length);

const parser = require('@babel/parser');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('BABEL CHECK: ALL SYNTAX 100% VALID! ZERO ERRORS!');
} catch (e) {
  console.error('Parse error:', e.message, 'at line', e.loc ? e.loc.line : '?');
}
