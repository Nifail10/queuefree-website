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

  // ── SVG: smart_toy icon (inline, no external lib) ───────
  var SMART_TOY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Z"/></svg>';

  // ── SVG: send icon ──────────────────────────────────────
  var SEND_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // ── SVG: close icon ─────────────────────────────────────
  var CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';

  // ── BUILD UI ─────────────────────────────────────────────
  function buildUI() {
    var root = document.getElementById('qf-chatbot-root');
    if (!root) return;

    root.innerHTML = [
      // ── Trigger area (label + circular button) ──
      '<div class="chatbot-trigger-wrap" id="chatbot-trigger-wrap">',
        // "Can I help?" label
        '<div class="chatbot-help-label" id="chatbot-help-label">',
          '<span class="chatbot-help-label__text">Can I help?</span>',
          '<div class="chatbot-help-label__dot"></div>',
        '</div>',
        // Circular launcher
        '<button class="chatbot-trigger" id="chatbot-trigger" aria-label="Open chat">',
          '<div class="chatbot-trigger__ripple"></div>',
          '<span class="chatbot-trigger__icon">', SMART_TOY_SVG, '</span>',
        '</button>',
      '</div>',

      // ── Chat window ──
      '<div class="chatbot-window chatbot-hidden" id="chatbot-window">',

        // Header: #46626e bg, smart_toy avatar in primary-container circle
        '<div class="chatbot-header">',
          '<div class="chatbot-header__left">',
            '<div class="chatbot-header__avatar">', SMART_TOY_SVG, '</div>',
            '<span class="chatbot-header__title">QueueFree Assistant</span>',
          '</div>',
          '<button class="chatbot-header__close" id="chatbot-close" aria-label="Close chat">', CLOSE_SVG, '</button>',
        '</div>',

        // Messages
        '<div class="chatbot-messages" id="chatbot-messages"></div>',

        // Quick replies
        '<div class="chatbot-quick-replies" id="chatbot-quick-replies"></div>',

        // Input area
        '<div class="chatbot-input-area">',
          '<input class="chatbot-input" id="chatbot-input" type="text" placeholder="Type your message..." autocomplete="off" />',
          '<button class="chatbot-send-btn" id="chatbot-send" aria-label="Send message">', SEND_SVG, '</button>',
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
    els.helpLabel = document.getElementById('chatbot-help-label');
  }

  // ── HELPERS ───────────────────────────────────────────────

  // Bot avatar HTML (smart_toy icon in surface-container-high circle)
  var BOT_AVATAR_HTML = '<div class="chatbot-bot-avatar"><span class="chatbot-bot-avatar__icon">' + SMART_TOY_SVG + '</span></div>';

  function scrollBottom() {
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function hideHelpLabel() {
    if (els.helpLabel) {
      els.helpLabel.classList.add('chatbot-label-hidden');
    }
  }

  function addMsg(text, sender, link) {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-wrap chatbot-msg-wrap--' + sender;

    var div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--' + sender;
    div.textContent = text;

    if (link) {
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = ' ' + link.label;
      div.appendChild(a);
    }

    wrap.appendChild(div);

    if (sender === 'bot') {
      var time = document.createElement('span');
      time.className = 'chatbot-msg-time';
      time.textContent = 'ASSISTANT \u00b7 JUST NOW';
      wrap.appendChild(time);
    }

    els.messages.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function showTyping() {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-wrap chatbot-msg-wrap--bot';
    wrap.id = 'chatbot-typing';

    var div = document.createElement('div');
    div.className = 'chatbot-typing';
    div.innerHTML = '<span></span><span></span><span></span>';

    wrap.appendChild(div);
    els.messages.appendChild(wrap);
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
    els.trigger.style.display = 'none';
    hideHelpLabel();
    if (!els.messages.children.length) {
      addMsg('Hi, I\'m the QueueFree assistant. How can I help you?', 'bot');
      renderQuickReplies(['What is QueueFree?', 'I am a doctor', 'I am a student', 'Contact / Pilot']);
    }
    setTimeout(function () { els.input.focus(); }, 100);
  }

  function closeChat() {
    isOpen = false;
    els.window.classList.add('chatbot-hidden');
    els.trigger.style.display = 'flex';
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

    // Auto-hide "Can I help?" label after 7 seconds
    setTimeout(function () {
      hideHelpLabel();
    }, 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.QFChat = { open: openChat, close: closeChat };

}());
