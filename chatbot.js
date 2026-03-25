(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────
  var RESPONSES = {
    what: {
      text: 'QueueFree is real-time hospital queue infrastructure — giving patients live visibility of their token, position, and estimated wait time.',
      replies: ['I am a doctor', 'I am a student', 'Contact / Pilot']
    },
    doctor: {
      text: 'QueueFree helps your OPD manage queues in real time. Share your feedback and help shape what we build.',
      link: { label: 'Take the Doctor Survey →', href: '/doctor-survey.html' },
      replies: ['What is QueueFree?', 'Contact / Pilot']
    },
    student: {
      text: 'We offer internships across research, product, operations, and software. Applications are open.',
      link: { label: 'Apply on the Careers page →', href: '/careers.html' },
      replies: ['What is QueueFree?', 'Contact / Pilot']
    },
    contact: {
      text: 'Interested in a pilot or have a question? Reach us directly — we respond within 2 business days.',
      link: { label: 'Go to Contact page →', href: '/contact.html' },
      replies: ['What is QueueFree?', 'I am a doctor', 'I am a student']
    }
  };

  var QUICK_REPLIES = [
    { label: 'What is QueueFree?', key: 'what' },
    { label: 'I am a doctor', key: 'doctor' },
    { label: 'I am a student', key: 'student' },
    { label: 'Contact / Pilot', key: 'contact' }
  ];

  // ── BUILD UI ─────────────────────────────────────────────
  function buildUI() {
    var root = document.getElementById('qf-chatbot-root');
    if (!root) return;

    root.innerHTML = [
      // Trigger button
      '<button class="chatbot-trigger" id="chatbot-trigger" aria-label="Open chat">',
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
          '<path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
        '</svg>',
      '</button>',

      // Chat window
      '<div class="chatbot-window chatbot-hidden" id="chatbot-window">',

        // Header
        '<div class="chatbot-header">',
          '<span class="chatbot-header__title">QueueFree Assistant</span>',
          '<button class="chatbot-header__close" id="chatbot-close" aria-label="Close chat">✕</button>',
        '</div>',

        // Messages
        '<div class="chatbot-messages" id="chatbot-messages"></div>',

        // Quick replies
        '<div class="chatbot-quick-replies" id="chatbot-quick-replies"></div>',

        // Input
        '<div class="chatbot-input-area">',
          '<input class="chatbot-input" id="chatbot-input" type="text" placeholder="Type a message…" autocomplete="off" />',
          '<button class="chatbot-send-btn" id="chatbot-send" aria-label="Send message">',
            '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
              '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>',
            '</svg>',
          '</button>',
        '</div>',

      '</div>'
    ].join('');
  }

  // ── DOM REFS ─────────────────────────────────────────────
  var els = {};
  function cacheEls() {
    els.trigger   = document.getElementById('chatbot-trigger');
    els.window    = document.getElementById('chatbot-window');
    els.close     = document.getElementById('chatbot-close');
    els.messages  = document.getElementById('chatbot-messages');
    els.qr        = document.getElementById('chatbot-quick-replies');
    els.input     = document.getElementById('chatbot-input');
    els.send      = document.getElementById('chatbot-send');
  }

  // ── HELPERS ───────────────────────────────────────────────
  function scrollBottom() {
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function addMsg(text, sender, link) {
    var div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--' + sender;
    div.textContent = text;
    if (link) {
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = ' ' + link.label;
      div.appendChild(a);
    }
    els.messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'chatbot-typing';
    div.id = 'chatbot-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    els.messages.appendChild(div);
    scrollBottom();
  }

  function removeTyping() {
    var t = document.getElementById('chatbot-typing');
    if (t) t.remove();
  }

  function renderQuickReplies(replies) {
    els.qr.innerHTML = '';
    if (!replies || !replies.length) return;
    replies.forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'chatbot-qr-btn';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        handleQuickReply(label);
      });
      els.qr.appendChild(btn);
    });
  }

  // ── RESPONSE LOGIC ────────────────────────────────────────
  function handleQuickReply(label) {
    addMsg(label, 'user');
    els.qr.innerHTML = '';

    var key = null;
    if (label === 'What is QueueFree?') key = 'what';
    else if (label === 'I am a doctor')  key = 'doctor';
    else if (label === 'I am a student') key = 'student';
    else if (label === 'Contact / Pilot') key = 'contact';

    if (key && RESPONSES[key]) {
      var r = RESPONSES[key];
      setTimeout(function () {
        addMsg(r.text, 'bot', r.link || null);
        renderQuickReplies(r.replies || []);
      }, 320);
    }
  }

  function handleUserMessage() {
    var text = els.input.value.trim();
    if (!text) return;
    els.input.value = '';
    addMsg(text, 'user');
    els.qr.innerHTML = '';
    showTyping();

    fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      removeTyping();
      addMsg(data.reply || 'I am not sure about that. Try visiting our Contact page.', 'bot');
      renderQuickReplies(['What is QueueFree?', 'I am a doctor', 'I am a student', 'Contact / Pilot']);
    })
    .catch(function () {
      removeTyping();
      addMsg('Something went wrong. Please try again or visit our Contact page.', 'bot');
      renderQuickReplies(['What is QueueFree?', 'I am a doctor', 'I am a student', 'Contact / Pilot']);
    });
  }

  // ── OPEN / CLOSE ──────────────────────────────────────────
  var isOpen = false;

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    els.window.classList.remove('chatbot-hidden');
    if (!els.messages.children.length) {
      addMsg('Hi, I\'m the QueueFree assistant. How can I help you?', 'bot');
      renderQuickReplies(['What is QueueFree?', 'I am a doctor', 'I am a student', 'Contact / Pilot']);
    }
    setTimeout(function () { els.input.focus(); }, 100);
  }

  function closeChat() {
    isOpen = false;
    els.window.classList.add('chatbot-hidden');
  }

  // ── EVENTS ────────────────────────────────────────────────
  function bindEvents() {
    els.trigger.addEventListener('click', openChat);
    els.close.addEventListener('click', closeChat);
    els.send.addEventListener('click', handleUserMessage);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleUserMessage();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeChat();
    });
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    buildUI();
    cacheEls();
    if (!els.trigger) return;
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.QFChat = { open: openChat, close: closeChat };

}());
