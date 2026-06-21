'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

// Brand palette (mirrors app/globals.css) used to style the console banner.
const GOLD = '#ffd700';
const GREEN = '#00ff87';
const BLUE = '#00bfff';
const RED = '#ff3b3b';
const MUTED = '#9ca3af';

// FIFA World Cup 2026 opener (group stage kickoff).
const KICKOFF = new Date('2026-06-11T00:00:00Z');

const TROPHY = String.raw`
        ___________
       '._==_==_=_.'      FIFA WORLD CUP 2026
       .-\:      /-.      Predict & Win
      | (|:.     |) |
       '-|:.     |-'
         \::.    /
          '::. .'
            ) (
          _.' '._
         '-------'
`;

const HAMEED_LINKEDIN = 'https://www.linkedin.com/in/abdulhameed2001/';
const ARSHAD_PORTFOLIO = 'ssh arshadakl.in';

// The "who built this" credits. Printed automatically when the console opens and
// also returned by __FWC26__.about().
function printCredits() {
  const name = 'color:#ffffff;font-size:13px;font-weight:700;font-family:Arial,sans-serif;';
  const muted = `color:${MUTED};font-size:13px;font-family:Arial,sans-serif;`;
  const link = `color:${BLUE};font-size:13px;font-weight:600;font-family:monospace;`;

  console.log('%c👷 Built by', `color:${GOLD};font-size:14px;font-weight:800;font-family:Arial,sans-serif;`);
  console.log(
    `%cHameed %c— the master brain behind it all  →  %c${HAMEED_LINKEDIN}`,
    name, muted, link,
  );
  console.log(
    `%cArshad %c— you're a tech person, right? then SSH into the portfolio  →  %c${ARSHAD_PORTFOLIO}`,
    name, muted, link,
  );
}

// Module-level guard: print the banner exactly once per page load, even though
// React 19 strict mode mounts effects twice in development.
let printed = false;

function daysToKickoff(): number {
  return Math.max(0, Math.ceil((KICKOFF.getTime() - Date.now()) / 86_400_000));
}

function printSignature() {
  if (printed) return;
  printed = true;

  // 1. Real security warning (self-XSS / scam), styled big and red.
  console.log(
    '%c⚽ STOP!',
    `color:${RED};font-size:42px;font-weight:900;font-family:Arial,sans-serif;text-shadow:1px 1px 2px rgba(0,0,0,.4);`,
  );
  console.log(
    '%cThis is a browser developer console.\n' +
      'If someone told you to paste code here to "hack" a prediction, get free\n' +
      'entry, unlock the winner early, or jump the leaderboard — it is a SCAM.\n' +
      'It will not work. Close this tab and ignore them.',
    `color:${RED};font-size:14px;line-height:1.5;font-family:Arial,sans-serif;`,
  );

  // 2. On-brand banner + ASCII trophy.
  console.log(
    `%c${TROPHY}`,
    `color:${GOLD};font-size:12px;line-height:1.15;font-family:monospace;`,
  );

  // 3. Who built this — shown automatically on every console open.
  printCredits();

  // 4. The hacker-mindset wink.
  console.log(
    '%cLooking for the admin panel, the answer key, or who lifts the trophy?\n' +
      'Not in the client. The secret lives server-side. Nice try 😉',
    `color:${GREEN};font-size:13px;font-weight:600;font-family:Arial,sans-serif;`,
  );

  // 5. Pointer to the hidden dev toy.
  console.log(
    `%cCurious dev? Type %c__FWC26__.help()%c — there's a cheat code too 👀`,
    `color:${MUTED};font-size:12px;font-family:Arial,sans-serif;`,
    `color:${BLUE};font-size:12px;font-weight:700;font-family:monospace;`,
    `color:${MUTED};font-size:12px;font-family:Arial,sans-serif;`,
  );
}

const FUN_TEAMS = [
  'Argentina', 'Brazil', 'France', 'England', 'Spain',
  'Germany', 'Portugal', 'Netherlands', 'Morocco', 'USA',
];

function installGlobalToy() {
  const banner = (msg: string, color = GOLD) =>
    console.log(`%c${msg}`, `color:${color};font-size:13px;font-family:Arial,sans-serif;`);

  const toy = {
    help() {
      banner('__FWC26__ commands:', GREEN);
      console.log(
        '%c  .about()      %c— who built this & how\n' +
          '%c  .predict()    %c— a totally scientific™ winner pick\n' +
          '%c  .countdown()  %c— days until kickoff',
        `color:${BLUE};font-family:monospace;`, `color:${MUTED};`,
        `color:${BLUE};font-family:monospace;`, `color:${MUTED};`,
        `color:${BLUE};font-family:monospace;`, `color:${MUTED};`,
      );
      return '⚽';
    },
    about() {
      banner('FIFA World Cup 2026 · Predict & Win', GOLD);
      printCredits();
      return '🏆';
    },
    predict() {
      const pick = FUN_TEAMS[Math.floor(Math.random() * FUN_TEAMS.length)];
      banner(`My model says... ${pick}. Confidence: vibes. Trust your gut instead 😄`, GREEN);
      return pick;
    },
    countdown() {
      const d = daysToKickoff();
      banner(d > 0 ? `${d} day(s) until kickoff. ⚽` : 'It’s tournament time! ⚽🔥', GOLD);
      return d;
    },
  };

  Object.defineProperty(window, '__FWC26__', {
    value: Object.freeze(toy),
    writable: false,
    configurable: false,
    enumerable: false,
  });
}

// Lightweight, dependency-free emoji confetti. Only ever runs on the Konami
// trigger, cleans itself up, and never touches layout (fixed, pointer-events:none).
function confetti() {
  const emojis = ['⚽', '🏆', '🎉', '🥅', '🟢', '🟡'];
  const layer = document.createElement('div');
  layer.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(layer);

  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('span');
    piece.textContent = emojis[i % emojis.length];
    piece.style.cssText = `position:absolute;top:-40px;left:${Math.random() * 100}%;font-size:${
      18 + Math.random() * 18
    }px;will-change:transform,opacity;`;
    layer.appendChild(piece);

    piece
      .animate(
        [
          { transform: `translateY(-40px) rotate(0deg)`, opacity: 1 },
          {
            transform: `translateY(${window.innerHeight + 80}px) rotate(${
              (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)
            }deg)`,
            opacity: 1,
          },
        ],
        { duration: 2200 + Math.random() * 1200, delay: Math.random() * 400, easing: 'ease-in' },
      )
      .finished.catch(() => {});
  }

  setTimeout(() => layer.remove(), 4200);
}

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

/**
 * Renders nothing. On mount it prints the branded console signature, installs
 * the `window.__FWC26__` dev toy, and listens for the Konami code. Purely a
 * client-side easter egg — it never affects rendering, data, or SSR.
 */
export default function ConsoleSignature() {
  useEffect(() => {
    printSignature();
    installGlobalToy();

    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        confetti();
        toast.success('GOAL! ⚽ You found the cheat code.');
        console.log(
          '%c⚽ KONAMI UNLOCKED — you clearly know your way around. Respect. 🏆',
          `color:${GREEN};font-size:16px;font-weight:800;font-family:Arial,sans-serif;`,
        );
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
