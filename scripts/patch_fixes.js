const fs = require('fs');

let code = fs.readFileSync('d:/Shortfundly/spendpace-expo/App.js', 'utf8');

// 1. Add STATUSBAR_HEIGHT definition after THEMES
const statusbarDef = `
// --- UNIVERSAL SAFE AREA METRICS FOR NOTIFICATION BAR & NOTCH ---
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
`;

if (!code.includes('const STATUSBAR_HEIGHT =')) {
  code = code.replace(
    '// Format Currency Utility for INR',
    statusbarDef + '\n// Format Currency Utility for INR'
  );
}

// 2. Fix StatusBar across views to be non-translucent and prevent overlap
code = code.replace(
  /<StatusBar barStyle={theme\.statusBarStyle} backgroundColor={theme\.bg} \/>/g,
  '<StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} translucent={false} />'
);

code = code.replace(
  /<StatusBar barStyle={theme\.statusBarStyle} backgroundColor={theme\.headerBg} \/>/g,
  '<StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.headerBg} translucent={false} />'
);

// 3. Update Welcome Screen to fit in a single screen without scrolling
const newWelcomeView = `  // ==========================================
  // VIEW: WELCOME / ONBOARDING SCREEN (FITTED SINGLE SCREEN, ZERO SCROLLING)
  // ==========================================
  if (appState === 'welcome') {
    return (
      <View style={[welcomeStyles.container, { backgroundColor: theme.bg, paddingTop: Platform.OS === 'android' ? 8 : 4 }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} translucent={false} />
        
        {/* Top Header Row */}
        <View style={welcomeStyles.topRow}>
          <View style={welcomeStyles.brandRow}>
            <SpendPaceLogoMark size={28} withGlow={false} />
            <Text style={[welcomeStyles.miniTitle, { color: theme.text }]}>SpendPace</Text>
          </View>
          <TouchableOpacity 
            style={[welcomeStyles.themeBtn, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
            activeOpacity={0.8}
          >
            {isDarkMode ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#64748B" />}
          </TouchableOpacity>
        </View>

        {/* Center Hero Block (Flex: 1, Perfectly Balanced) */}
        <View style={welcomeStyles.heroCenterBlock}>
          <View style={welcomeStyles.avatarGlowCircle}>
            <CartoonAIEyesNative size="lg" />
          </View>

          <Text style={[welcomeStyles.heroHeading, { color: theme.text }]}>
            Master Your Daily{\\n}
            <Text style={{ color: theme.emerald }}>Cashflow Velocity</Text>
          </Text>

          <Text style={[welcomeStyles.heroSubtext, { color: theme.textSecondary }]}>
            Autonomous micro-budgeting with one daily safe allowance, swipe gestures, and instant AI guidance.
          </Text>

          {/* Compact 3-Pill Feature Strip */}
          <View style={welcomeStyles.pillRow}>
            <View style={[welcomeStyles.featurePill, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
              <Compass size={13} color={theme.emerald} />
              <Text style={[welcomeStyles.pillText, { color: theme.text }]}>Safe Pace</Text>
            </View>
            <View style={[welcomeStyles.featurePill, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
              <Zap size={13} color={theme.blue} />
              <Text style={[welcomeStyles.pillText, { color: theme.text }]}>Swipe Pulse</Text>
            </View>
            <View style={[welcomeStyles.featurePill, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}>
              <Bot size={13} color={theme.purple} />
              <Text style={[welcomeStyles.pillText, { color: theme.text }]}>Pace AI</Text>
            </View>
          </View>
        </View>

        {/* Bottom Pinned Action Group */}
        <View style={welcomeStyles.bottomGroup}>
          <TouchableOpacity 
            style={[welcomeStyles.primaryCta, { backgroundColor: theme.emerald }]}
            onPress={() => { setAuthMode('login'); setAppState('login'); }}
            activeOpacity={0.88}
          >
            <Text style={welcomeStyles.primaryCtaText}>Sign In to Your Vault</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[welcomeStyles.secondaryCta, { backgroundColor: theme.cardSubtle, borderColor: theme.cardBorder }]}
            onPress={() => { setAuthMode('register'); setAppState('login'); }}
            activeOpacity={0.88}
          >
            <Text style={[welcomeStyles.secondaryCtaText, { color: theme.text }]}>Create Encrypted Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={welcomeStyles.guestBtn}
            onPress={() => setAppState('main')}
            activeOpacity={0.7}
          >
            <Text style={[welcomeStyles.guestBtnText, { color: theme.emerald }]}>
              Explore Live Dashboard as Guest &rarr;
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }`;

// Replace welcome view block
code = code.replace(
  /\/\/ ==========================================\s*\/\/ VIEW: WELCOME \/ ONBOARDING SCREEN[\s\S]*?\/\/ ==========================================\s*\/\/ VIEW: LOGIN \/ REGISTER SCREEN/,
  newWelcomeView + '\n\n  // ==========================================\n  // VIEW: LOGIN / REGISTER SCREEN'
);

// 4. Update handleSendChat to have 2.5s AbortController and instant robust AI engine
const newHandleSendChat = `  // Pace AI Copilot Send Chat (Fast 2.5s network timeout + instant autonomous engine)
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const userMsg = { id: Date.now().toString(), role: 'user', text: userText, time: 'Just now' };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiTalking(true);

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 40);

    let gotServerReply = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(\`\${backendUrl}/api/ai/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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
      // Offline fallback triggers immediately
    }

    if (!gotServerReply) {
      setTimeout(() => {
        let aiReply = "Your safe daily spend velocity remains well within optimal bounds.";
        const lower = userText.toLowerCase();

        if (lower.startsWith('hi') || lower.startsWith('hello') || lower.startsWith('hey') || lower.includes('who are you')) {
          aiReply = \`Hello \${userProfile.fullName.split(' ')[0]}! I'm Pace, your autonomous spend copilot. Today's safe velocity is \${formatINR(safeDaily)}/day with \${daysRemaining} days left in your cycle. Ask me anything or fast-log: "Spent 450 for fuel"!\`;
        } else if (lower.includes('safe') || lower.includes('daily') || lower.includes('pace') || lower.includes('today') || lower.includes('limit') || lower.includes('allowance')) {
          aiReply = \`Today's Safe-to-Spend velocity is \${formatINR(safeDaily)}/day. You have spent \${formatINR(spentToday)} so far today, leaving \${formatINR(Math.max(0, safeDaily - spentToday))} for discretionary expenses. \${daysRemaining} days remaining in this cycle.\`;
        } else if (lower.includes('spent') || lower.includes('spend') || lower.includes('pay') || lower.includes('paid') || lower.includes('bought') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('coffee') || lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('tea') || lower.includes('chai')) {
          const match = lower.match(/\\d+/);
          const amount = match ? parseInt(match[0], 10) : 250;
          setSpentToday((prev) => prev + amount);
          const isFuel = lower.includes('fuel') || lower.includes('petrol');
          const isGrocery = lower.includes('grocery') || lower.includes('groceries') || lower.includes('supermarket');
          const newTx = {
            id: Date.now().toString(),
            name: isFuel ? 'Petrol Top-up' : isGrocery ? 'Groceries' : 'Food & Dining',
            category: isFuel ? 'Fuel & Commute' : isGrocery ? 'Groceries' : 'Dining & Food',
            amount,
            date: 'Just now',
            source: 'AI_CHAT',
            icon: isFuel ? Fuel : isGrocery ? ShoppingBag : Utensils,
          };
          setTransactions((prev) => [newTx, ...prev]);
          const newSafe = Math.max(0, safeDaily - Math.round(amount / (daysRemaining || 1)));
          aiReply = \`Logged \${formatINR(amount)} instantly to your ledger! Deducted from today's safe allowance. Your updated safe daily limit is \${formatINR(newSafe)}/day across the remaining \${daysRemaining} days.\`;
        } else if (lower.includes('earn') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('gig') || lower.includes('delivery') || lower.includes('freelance') || lower.includes('credited')) {
          const match = lower.match(/\\d+/);
          const amount = match ? parseInt(match[0], 10) : 1000;
          setPartTimeIncome((prev) => prev + amount);
          const dailyBoost = Math.round(amount / (daysRemaining || 1));
          aiReply = \`Great shift! Added +\${formatINR(amount)} to your gig inflow. This boosts your daily safe pace by +\${formatINR(dailyBoost)}/day for the rest of this cycle!\`;
        } else if (lower.includes('leak') || lower.includes('save') || lower.includes('cut') || lower.includes('audit') || lower.includes('subscription')) {
          aiReply = \`Pace AI diagnostics audited your ledger: Potential savings of ~\${formatINR(11200)}/month identified by trimming weekend dining surges, plus ~\${formatINR(1899)}/month on 2 inactive subscriptions.\`;
        } else {
          aiReply = \`Understood! I've noted that in your financial telemetry. Your daily safe limit is \${formatINR(safeDaily)}/day. Try asking "Safe pace today?" or fast-logging "Spent 350 on lunch" to adjust your ledger in real time.\`;
        }

        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: aiReply, time: 'Just now' }]);
        setIsAiTalking(false);
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 60);
      }, 300);
    } else {
      setIsAiTalking(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 60);
    }
  };`;

// Replace handleSendChat
code = code.replace(
  /\/\/ Pace AI Copilot Send Chat[\s\S]*?\/\/ Save Modal Transaction/,
  newHandleSendChat + '\n\n  // Save Modal Transaction'
);

// 5. Update Copilot Chat View: full screen, ChatGPT upward scrolling, back button, flush input bar
const newCopilotView = `      {/* --- DEDICATED PACE AI CHAT (CHATGPT/GEMINI UPWARD SCROLLING & KEYBOARD FLUSH) --- */}
      {activeTab === 'copilot' ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          <View style={[chatStyles.container, { backgroundColor: theme.bg }]}>
            {/* Top Dedicated Chat Header */}
            <View style={[chatStyles.headerStatusCard, { backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }]}>
              <View style={chatStyles.headerStatusLeft}>
                <TouchableOpacity 
                  style={[chatStyles.backToDashBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={() => setActiveTab('radar')}
                  activeOpacity={0.75}
                >
                  <ArrowRight size={16} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
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
                  <RotateCcw size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat Messages (Flex-End: Upward Scrolling like ChatGPT/Gemini) */}
            <ScrollView
              ref={chatScrollRef}
              style={chatStyles.messageList}
              contentContainerStyle={chatStyles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
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

            {/* Fast Prompt Chips */}
            <View style={[chatStyles.promptBar, { backgroundColor: theme.bg, borderTopColor: theme.cardBorder }]}>
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

            {/* Input Bar (Flush Above Keyboard) */}
            <View style={[chatStyles.inputBar, { backgroundColor: theme.headerBg, borderTopColor: theme.cardBorder }]}>
              <TextInput
                style={[chatStyles.inputField, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                placeholder="Ask Pace or fast-log: 'Spent 350 for dinner'..."
                placeholderTextColor={theme.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChat}
                returnKeyType="send"
              />
              <TouchableOpacity style={[chatStyles.sendBtn, { backgroundColor: theme.emerald }]} onPress={handleSendChat} activeOpacity={0.8}>
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (`;

code = code.replace(
  /{\/\* --- DEDICATED PACE AI TAB VS DASHBOARD SCROLLVIEW --- \*\/}[\s\S]*?\/\/ DASHBOARD SCROLLVIEW \(RADAR, BENTO, DIAGNOSTICS\)\s*<ScrollView style={styles\.contentContainer} showsVerticalScrollIndicator={false}>/,
  newCopilotView + '\n        // DASHBOARD SCROLLVIEW (RADAR, BENTO, DIAGNOSTICS)\n        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>'
);

// 6. Only show bottom navigation dock when NOT on copilot tab!
code = code.replace(
  '      {/* --- REFINED ELEVATED FLOATING BOTTOM DOCK --- */}\n      <View style={[styles.bottomNavContainer',
  '      {/* --- REFINED ELEVATED FLOATING BOTTOM DOCK --- */}\n      {activeTab !== \'copilot\' && (\n        <View style={[styles.bottomNavContainer'
);

code = code.replace(
  '          </TouchableOpacity>\n        </View>\n      </View>\n\n      {/* --- MODAL 1: ADD TRANSACTION --- */}',
  '          </TouchableOpacity>\n        </View>\n      </View>\n      )}\n\n      {/* --- MODAL 1: ADD TRANSACTION --- */}'
);

// 7. Update welcomeStyles and chatStyles in StyleSheet
const updatedWelcomeStyles = `const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  heroCenterBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  avatarGlowCircle: {
    marginBottom: 16,
  },
  heroHeading: {
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 33,
  },
  heroSubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomGroup: {
    gap: 10,
    paddingTop: 8,
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
    fontSize: 14,
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
    fontSize: 13,
    fontWeight: '700',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});`;

// Replace welcomeStyles block
code = code.replace(
  /const welcomeStyles = StyleSheet\.create\({[\s\S]*?const loginStyles = StyleSheet\.create\({/,
  updatedWelcomeStyles + '\n\nconst loginStyles = StyleSheet.create({'
);

// 8. Update chatStyles for flex-end upward scrolling and flush input bar
const updatedChatStyles = `const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToDashBtn: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
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
    flexGrow: 1,
    justifyContent: 'flex-end', // ChatGPT-style: older messages push upwards!
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
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
    paddingVertical: 7,
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    borderTopWidth: 1,
    marginBottom: 0, // Flush directly on top of keyboard!
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
});`;

// Replace chatStyles
code = code.replace(
  /const chatStyles = StyleSheet\.create\({[\s\S]*?const modalStyles = StyleSheet\.create\({/,
  updatedChatStyles + '\n\nconst modalStyles = StyleSheet.create({'
);

fs.writeFileSync('d:/Shortfundly/spendpace-expo/App.js', code, 'utf8');
console.log('App.js patched successfully! Total lines:', code.split('\n').length);

const parser = require('@babel/parser');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('BABEL CHECK: ALL SYNTAX 100% VALID! ZERO ERRORS!');
} catch (e) {
  console.error('Parse error:', e.message, 'at line', e.loc ? e.loc.line : '?');
}
