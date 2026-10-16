/* Hand-drawn line icons (64×64, stroke = currentColor) for the family / category strip */
window.RZ_ICONS = (() => {
  const I = {
    // ---------- mice (top view) ----------
    viper: '<path d="M32 5C22 5 18.5 13 18.5 25v17c0 10 5.5 17 13.5 17s13.5-7 13.5-17V25C45.5 13 42 5 32 5Z"/><path d="M32 5v19"/><rect x="29.5" y="11" width="5" height="9" rx="2.5"/><path d="M18.8 25.5c4.5 1.6 9 2.2 13.2 2.2s8.7-.6 13.2-2.2"/>',
    cobra: '<path d="M32 9c-8.5 0-12.5 7-12.5 17v15c0 9.5 5 15 12.5 15s12.5-5.5 12.5-15V26C44.5 16 40.5 9 32 9Z"/><path d="M32 9v17"/><rect x="29.5" y="14" width="5" height="8" rx="2.5"/><path d="M23 52c5.5 4 12.5 4 18 0"/>',
    orochi: '<rect x="20" y="11" width="24" height="44" rx="12"/><path d="M32 11v16"/><rect x="29.5" y="16" width="5" height="7" rx="2.5"/><path d="M20 27c4 1.5 8 2 12 2s8-.5 12-2"/>',
    deathadder: '<path d="M29 5c-8.5 0-12 7-12 18 0 6 2 10 2 16 0 11 5 20 13.5 20S47 52 47 41c0-7.5-2.5-11.5-2.5-18C44.5 12 38 5 29 5Z"/><path d="M29.5 5c.6 6 .9 12 .8 18"/><rect x="27.8" y="11" width="5" height="8.5" rx="2.5"/><path d="M17.4 25c4.6 2 9.4 2.8 13.6 2.6 5-.2 9.4-1.2 13.5-3"/><path d="M17.8 31.5v5M18.3 39v4.5"/>',
    basilisk: '<path d="M30 5c-8.5 0-12 7-12 18 0 6 1.5 9.5-.5 14.5-1.6 4-5 6-5 11 0 6 5 10.5 13 10.5h7c8.5 0 14.5-7 14.5-18 0-7.5-2.5-11.5-2.5-18C44.5 12 39 5 30 5Z"/><path d="M30.4 5c.6 6 .8 12 .7 18"/><rect x="28.8" y="11" width="5" height="8.5" rx="2.5"/><path d="M18.2 25c4.4 2 9 2.8 13.4 2.6 4.8-.2 9.2-1.2 13-3"/><path d="M14.5 45.5c3 1.6 6 2 9 1.5"/><path d="M19 31v4"/>',
    naga: '<path d="M29 5c-8.5 0-12 7-12 18 0 6 2 10 2 16 0 11 5 20 13.5 20S47 52 47 41c0-7.5-2.5-11.5-2.5-18C44.5 12 38 5 29 5Z"/><path d="M29.5 5c.6 6 .9 12 .8 18"/><rect x="27.8" y="11" width="5" height="8.5" rx="2.5"/><path d="M17.4 25c4.6 2 9.4 2.8 13.6 2.6 5-.2 9.4-1.2 13.5-3"/><circle cx="23" cy="33" r="1.6"/><circle cx="27.5" cy="33" r="1.6"/><circle cx="23" cy="38" r="1.6"/><circle cx="27.5" cy="38" r="1.6"/><circle cx="23" cy="43" r="1.6"/><circle cx="27.5" cy="43" r="1.6"/>',
    proclick: '<path d="M19 57c-4.5 0-6.5-3.5-5-9l6-25C22.5 12 28.5 6 36.5 7.5 46 9.5 50.5 21 50.5 33.5 50.5 47 46 57 37.5 57Z"/><path d="M36.5 7.5c2.3 7 2.6 15.5.8 23.5"/><path d="M19.5 25c5.5 2.5 11.5 3.5 17.5 3.3"/><path d="M17.5 36.5l-1 4M16.2 43.5l-.8 3.5"/>',
    // ---------- headsets ----------
    blackshark: '<path d="M14 38v-6c0-11 8-19 18-19s18 8 18 19v6"/><rect x="9" y="33" width="11" height="18" rx="5"/><rect x="44" y="33" width="11" height="18" rx="5"/><path d="M14.5 51c0 5 3.5 8 9 8h4"/><circle cx="29.5" cy="59" r="2"/>',
    kraken: '<path d="M14 40v-6c0-11 8-19 18-19s18 8 18 19v6"/><path d="M16.5 22.5 14 8l11 8.2M47.5 22.5 50 8l-11 8.2"/><rect x="8.5" y="35" width="12" height="19" rx="6"/><rect x="43.5" y="35" width="12" height="19" rx="6"/>',
    barracuda: '<path d="M14 36v-5c0-11 8-18 18-18s18 7 18 18v5"/><ellipse cx="15" cy="44" rx="6.5" ry="10"/><ellipse cx="49" cy="44" rx="6.5" ry="10"/><path d="M21 23c3-3 7-4.5 11-4.5s8 1.5 11 4.5"/>',
    kaira: '<path d="M14 37v-6c0-11 8-18.5 18-18.5S50 20 50 31v6"/><path d="M19 28c2.5-6 7-9 13-9s10.5 3 13 9"/><rect x="8.5" y="32" width="12" height="19" rx="6"/><rect x="43.5" y="32" width="12" height="19" rx="6"/><path d="M12 50.5c0 4 2.5 6 6 6"/>',
    // ---------- keyboards ----------
    blackwidow: '<rect x="3" y="19" width="58" height="22" rx="2.5"/><path d="M7 24.5h34M7 29.5h34M7 34.5h34M45.5 23v15M49 24.5h8M49 29.5h8M49 34.5h8"/><circle cx="55" cy="15" r="2"/><path d="M10 45h44c2 0 3 1.5 3 3s-1 3-3 3H10c-2 0-3-1.5-3-3s1-3 3-3Z"/>',
    huntsman: '<rect x="7" y="20" width="50" height="22" rx="2.5"/><path d="M11 25.5h31M11 30.5h31M11 35.5h31M46.5 24v15"/><path d="M50 32.5h2M50 37h2M53.5 37h0M48 37h0"/><circle cx="51" cy="25.5" r="1.4"/>',
    ornata: '<rect x="3" y="21" width="58" height="17" rx="2"/><path d="M7 26h34M7 30h34M7 34h34M45.5 24.5v11M49 26h8M49 30h8M49 34h8"/><path d="M9 41h46l-2.5 8h-41Z"/>',
    deathstalker: '<rect x="3" y="24" width="58" height="13" rx="1.5"/><path d="M7 28.5h35M7 32.5h35M46 27v7M49.5 28.5h8M49.5 32.5h8"/>',
    joro: '<rect x="12" y="21" width="40" height="21" rx="2.5"/><path d="M16 26.5h32M16 31.5h32M16 36.5h22M42 36.5h2.5M47 36.5h1"/>',
    protype: '<rect x="5" y="21" width="54" height="20" rx="6"/><path d="M10 27h30M10 31.5h30M10 36h30M45 27h9M45 31.5h9M45 36h9"/>',
    tartarus: '<rect x="18" y="7" width="27" height="23" rx="3.5"/><path d="M22 13h19M22 18.5h19M22 24h19"/><path d="M20 30c-1.5 10 0 26 12 26s14-14 12-26"/><circle cx="13" cy="30" r="3.5"/><path d="M16.5 30H18"/>',
    // ---------- controllers ----------
    wolverine: '<path d="M20 19h24c8 0 12.5 6 14.5 16.5 1.8 9.5-1.5 16.5-7 16.5-4 0-6-4.2-9-7.5H21.5c-3 3.3-5 7.5-9 7.5-5.5 0-8.8-7-7-16.5C7.5 25 12 19 20 19Z"/><circle cx="20" cy="29" r="4"/><circle cx="39" cy="37" r="3.5"/><path d="M25 35v6M22 38h6"/><circle cx="45" cy="25.5" r="1.4"/><circle cx="49.5" cy="29.5" r="1.4"/><circle cx="40.5" cy="29.5" r="1.4"/><circle cx="45" cy="33.5" r="1.4"/>',
    raiju: '<path d="M20 19h24c8 0 12.5 6 14.5 16.5 1.8 9.5-1.5 16.5-7 16.5-4 0-6-4.2-9-7.5H21.5c-3 3.3-5 7.5-9 7.5-5.5 0-8.8-7-7-16.5C7.5 25 12 19 20 19Z"/><rect x="26" y="21.5" width="12" height="8" rx="1.5"/><circle cx="24.5" cy="37" r="3.5"/><circle cx="39.5" cy="37" r="3.5"/><path d="M15 26v6M12 29h6"/><circle cx="49" cy="25.5" r="1.4"/><circle cx="53" cy="29" r="1.4"/><circle cx="45" cy="29" r="1.4"/><circle cx="49" cy="32.5" r="1.4"/>',
    kishi: '<rect x="20" y="17" width="24" height="30" rx="2.5"/><path d="M20 19h-5c-5.5 0-9 5-9 13s3.5 13 9 13h5M44 19h5c5.5 0 9 5 9 13s-3.5 13-9 13h-5"/><circle cx="13" cy="27" r="3"/><path d="M13 35v5M10.5 37.5h5"/><circle cx="51" cy="27" r="1.3"/><circle cx="54" cy="30" r="1.3"/><circle cx="48" cy="30" r="1.3"/><circle cx="51" cy="33" r="1.3"/><circle cx="51" cy="40" r="2.5"/>',
    junglecat: '<rect x="18" y="20" width="28" height="24" rx="2"/><rect x="5" y="20" width="10" height="24" rx="4"/><rect x="49" y="20" width="10" height="24" rx="4"/><circle cx="10" cy="27" r="2.5"/><path d="M10 34v5M7.5 36.5h5"/><circle cx="54" cy="26" r="1.2"/><circle cx="56.5" cy="29" r="1.2"/><circle cx="51.5" cy="29" r="1.2"/><circle cx="54" cy="32" r="1.2"/>',
    kitsune: '<rect x="5" y="17" width="54" height="30" rx="5"/><circle cx="13" cy="34" r="2.6"/><circle cx="19" cy="30" r="2.6"/><circle cx="25" cy="31" r="2.6"/><circle cx="25" cy="40" r="3.2"/><circle cx="36" cy="27" r="2.8"/><circle cx="42.5" cy="25" r="2.8"/><circle cx="49" cy="25" r="2.8"/><circle cx="36" cy="35" r="2.8"/><circle cx="42.5" cy="33" r="2.8"/><circle cx="49" cy="33" r="2.8"/>',
    // ---------- streaming ----------
    seiren: '<rect x="24" y="5" width="16" height="30" rx="8"/><path d="M27.5 13h9M27.5 18h9M27.5 23h9"/><path d="M19 22c0 10 5.5 16.5 13 16.5S45 32 45 22"/><path d="M32 38.5V52M21 58h22M24 58c0-4 3.5-6 8-6s8 2 8 6"/>',
    kiyo: '<circle cx="32" cy="27" r="17"/><circle cx="32" cy="27" r="11"/><circle cx="32" cy="27" r="5"/><path d="M26 44l-3 10h18l-3-10"/>',
    light: '<path d="M6 44c10 0 12-20 26-20s16 20 26 20"/><path d="M6 36c10 0 12-20 26-20s16 20 26 20"/><circle cx="12" cy="39" r="1.3"/><circle cx="21" cy="30" r="1.3"/><circle cx="32" cy="20" r="1.3"/><circle cx="43" cy="30" r="1.3"/><circle cx="52" cy="39" r="1.3"/>',
    capture: '<rect x="8" y="21" width="48" height="23" rx="4"/><path d="M14 44v3h8v-3M42 44v3h8v-3"/><path d="M14 30h14"/><circle cx="48" cy="30" r="2"/>',
    mixer: '<rect x="8" y="10" width="48" height="44" rx="4"/><path d="M18 18v28M28 18v28M38 18v28M47 18v28"/><rect x="15" y="34" width="6" height="5" rx="1"/><rect x="25" y="23" width="6" height="5" rx="1"/><rect x="35" y="38" width="6" height="5" rx="1"/><rect x="44" y="27" width="6" height="5" rx="1"/>',
    // ---------- other categories ----------
    accessories: '<rect x="12" y="20" width="14" height="16" rx="2.5"/><path d="M16 20v-8M22 20v-8M19 36v20"/><rect x="38" y="16" width="14" height="20" rx="2.5"/><rect x="41.5" y="19.5" width="7" height="5" rx="1"/><path d="M45 36v20"/>',
    mousepad: '<rect x="5" y="13" width="54" height="38" rx="4"/><path d="M42 26c-4 0-6 2.5-6 6.5v6c0 4 2.5 6.5 6 6.5s6-2.5 6-6.5v-6c0-4-2-6.5-6-6.5Z"/><path d="M42 26v6"/>',
    chair: '<path d="M23 6h18c3 0 4.5 2.5 4.5 6v24h-27V12c0-3.5 1.5-6 4.5-6Z"/><path d="M26 6v8h12V6M14 34v6M50 34v6"/><path d="M13 39h38v5H13Z"/><path d="M32 44v8M18 58l14-6 14 6"/><circle cx="18" cy="59" r="1.5"/><circle cx="46" cy="59" r="1.5"/>',
    earbuds: '<rect x="12" y="24" width="40" height="28" rx="11"/><path d="M12.5 33h39"/><path d="M24 16c-4 0-6.5 2.5-6.5 5.5S20 27 23 27"/><path d="M40 16c4 0 6.5 2.5 6.5 5.5S44 27 41 27"/><circle cx="32" cy="42" r="1.5"/>',
    bag: '<path d="M19 20c0-7 5.5-12 13-12s13 5 13 12v34c0 2.5-1.5 4-4 4H23c-2.5 0-4-1.5-4-4Z"/><path d="M27 8.5c0-3 2-4.5 5-4.5s5 1.5 5 4.5"/><rect x="24" y="36" width="16" height="13" rx="2.5"/><path d="M24 41h16"/>',
    speakers: '<rect x="3" y="27" width="58" height="12" rx="6"/><path d="M12 33h0M18 33h0M24 33h0M30 33h0M36 33h0M42 33h0M48 33h0M54 33h0"/><path d="M14 39v4M50 39v4"/>',
    generic: '<rect x="12" y="14" width="40" height="36" rx="4"/><path d="M12 24h40"/>',
  };
  const FAM = {
    Viper: 'viper', Cobra: 'cobra', Orochi: 'orochi', DeathAdder: 'deathadder', Basilisk: 'basilisk', Naga: 'naga', 'Pro Click': 'proclick',
    BlackShark: 'blackshark', Kraken: 'kraken', Barracuda: 'barracuda', Kaira: 'kaira',
    BlackWidow: 'blackwidow', Huntsman: 'huntsman', Ornata: 'ornata', DeathStalker: 'deathstalker', Joro: 'joro', 'Pro Type': 'protype', Tartarus: 'tartarus',
    Wolverine: 'wolverine', Raiju: 'raiju', Kishi: 'kishi', 'Junglecat Dual-sided': 'junglecat', Junglecat: 'junglecat', Kitsune: 'kitsune',
    Seiren: 'seiren', Kiyo: 'kiyo', Chroma: 'light', 'Light Strip': 'light', Ripsaw: 'capture', 'Audio Mixer': 'mixer',
  };
  const CAT = { Mouse: 'deathadder', Headset: 'blackshark', Keyboard: 'blackwidow', Controller: 'wolverine', Streaming: 'seiren', Accessories: 'accessories', Mousepad: 'mousepad', Chair: 'chair', Earbuds: 'earbuds', Bag: 'bag', Speakers: 'speakers' };
  const svg = name => `<svg class="ico" viewBox="0 0 64 64" aria-hidden="true">${I[name] || I.generic}</svg>`;
  return { all: I, family: (k, cat) => svg(FAM[k] || CAT[cat] || 'generic'), category: k => svg(CAT[k] || 'generic'), svg };
})();
