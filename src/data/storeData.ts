export interface ToneItem {
  id: string;
  name: string;
  gearTag: string;
  audioUrl: string;
  thumbnail?: string;
}

export type PackType = "TONEX" | "HX Stomp";

export interface ToneModel {
  id: string;
  name: string;
  audioUrl: string;
  gearTag?: string;
}

export interface PackData {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  type: PackType;
  price: number;
  lemonSqueezyVariantId: string;
  checkoutUrl: string;
  tones: ToneItem[];
  videoDemos: string[];
  includedGear: string[];
  toneModels: ToneModel[];
  artist?: string;
  license?: string;
  platforms?: string[];
}

export const packs: PackData[] = [
  {
    id: "srv-pack",
    slug: "srv-ultimate-amp-capture-pack",
    title: "SRV Ultimate Amp Capture",
    description: "Direct capture of classic Texas blues amp tones. Feel the glassy, touch-responsive cleans and the mid-pushed, tubey warmth of a legendary Stevie Ray Vaughan setup. Captured from a dimed Fender Super Reverb pushed by a vintage 808 overdrive for that unmistakable thick, biting attack.",
    badge: "TONEX",
    type: "TONEX",
    price: 7.99,
    lemonSqueezyVariantId: "9c678be0-e916-46fb-8340-112098cc6ed4",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/9c678be0-e916-46fb-8340-112098cc6ed4?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Fender Super Reverb (1974)", "Ibanez TS808 Overdrive", "Dallas-Arbiter Fuzz Face", "Fender Stratocaster"],
    tones: [
      { id: "srv-1", name: "SRV Cold Shot Crunch", gearTag: "Super Reverb + TS808", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "srv-2", name: "Sidi Bouganga Lead", gearTag: "Strat + TONEX", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "srv-3", name: "Clean Twin Reverb", gearTag: "Twin Reverb Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "srv-m1", name: "Cold Shot Crunch", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Fender Super Reverb · Ibanez TS808" },
      { id: "srv-m2", name: "Sidi Bouganga Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Fender Strat · TONEX Capture" },
      { id: "srv-m3", name: "Texas Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Fender Twin Reverb · Pure 96kHz" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "santana-pack",
    slug: "the-smooth-sustain-santana-signature",
    title: "The Smooth Sustain: Santana Signature Tone",
    description: "An exercise in endless, singing sustain. This pack perfectly recreates the thick, vocal-like midrange and creamy overdrive of a legendary late-70s cascading gain amplifier. Roll back your volume for warm Latin-rock rhythms, and push it to 10 for soaring, feedback-friendly leads that bloom under your fingers.",
    badge: "TONEX",
    type: "TONEX",
    price: 7.99,
    lemonSqueezyVariantId: "santana-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/santana-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Cascading Gain Amplifier", "Vintage Les Paul", "Analog Tape Echo", "Marshall 4x12"],
    tones: [
      { id: "s-1", name: "Smooth Sustain Lead", gearTag: "Cascading Amp + Les Paul", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "s-2", name: "Warm Latin Rhythm", gearTag: "Cascading Amp · Roll Back", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "s-3", name: "Feedback Bloom", gearTag: "Amp at 10 · Marshall", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "s-m1", name: "Smooth Sustain Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Cascading Gain Amp · Les Paul" },
      { id: "s-m2", name: "Warm Latin Rhythm", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Amp Roll Back · Vintage Echo" },
      { id: "s-m3", name: "Feedback Bloom", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Amp Ch. 2 · Marshall 4x12" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "prince-pack",
    slug: "purple-majesty-prince-funk-solo",
    title: "Purple Majesty: Prince Funk & Solo Rig",
    description: "The ultimate duality of tone. Channel shimmering, heavily chorused 80s funk rhythms with pristine solid-state clarity, then step on the virtual lead channel to unleash the searing, mid-heavy distortion that defined his legendary halftime Super Bowl solo. Crisp, eccentric, and dripping with attitude.",
    badge: "TONEX",
    type: "TONEX",
    price: 8.99,
    lemonSqueezyVariantId: "prince-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/prince-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Solid-State Funk Head", "Chorus Pedal", "Mid-Heavy Lead Amp", "Prince Signature Strat"],
    tones: [
      { id: "p-1", name: "Funk Rhythm Chorus", gearTag: "Solid-State + Chorus", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "p-2", name: "Super Bowl Solo Lead", gearTag: "Mid-Heavy Lead + Strat", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "p-3", name: "Eccentric Clean", gearTag: "Pristine Solid-State", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "p-m1", name: "Funk Rhythm Chorus", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Solid-State · Chorus Pedal" },
      { id: "p-m2", name: "Super Bowl Solo", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Mid-Heavy Lead · Signature Strat" },
      { id: "p-m3", name: "Eccentric Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Solid-State · Pristine" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "eagles-pack",
    slug: "hotel-california-1976-stadium-rock",
    title: "Hotel California: The 1976 Stadium Rock Sessions",
    description: "Step into a 70s LA studio. This pack delivers the iconic dual-guitar alchemy of the era—featuring the raw, tweed-style breakup for gritty rhythm work and the soaring, harmonically rich British stack captures required to recreate one of the most famous guitar solos in history.",
    badge: "TONEX",
    type: "TONEX",
    price: 7.99,
    lemonSqueezyVariantId: "eagles-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/eagles-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Tweed Deluxe (1957)", "British Stack (1960)", "Gibson Les Paul", "Vintage Tremolo"],
    tones: [
      { id: "e-1", name: "Tweed Breakup Rhythm", gearTag: "Tweed Deluxe + Les Paul", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "e-2", name: "British Stack Solo", gearTag: "British 4x12 + Harmonics", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "e-3", name: "Studio Clean Blend", gearTag: "Tweed + British Mix", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "e-m1", name: "Tweed Breakup Rhythm", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Tweed Deluxe · Les Paul" },
      { id: "e-m2", name: "British Stack Solo", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "British Stack · Harmonics" },
      { id: "e-m3", name: "Studio Clean Blend", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Tweed + British Mix" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "queen-pack",
    slug: "bohemian-rhapsody-red-special-ac30",
    title: "Bohemian Rhapsody: Queen Multi-Layered Amp",
    description: "A meticulous recreation of the 'Red Special' hitting a wall of cranked British AC30s through a germanium treble booster. Expect a uniquely phased, vocal midrange with layers of harmonic complexity. Perfect for building massive, orchestrated guitar choirs or cutting through a mix with biting British chime.",
    badge: "TONEX",
    type: "TONEX",
    price: 7.99,
    lemonSqueezyVariantId: "queen-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/queen-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Red Special Replica", "AC30 Top Boost (x4)", "Germanium Treble Booster", "Vox AC30"],
    tones: [
      { id: "q-1", name: "Red Special Cranked", gearTag: "Red Special + AC30 x4", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "q-2", name: "Germanium Boost Lead", gearTag: "Treble Booster + AC30", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "q-3", name: "Choral Choir Layer", gearTag: "Multi-AC30 + Booster", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "q-m1", name: "Red Special Cranked", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Red Special · AC30 x4" },
      { id: "q-m2", name: "Germanium Boost Lead", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Germanium Treble Booster · AC30" },
      { id: "q-m3", name: "Choral Choir Layer", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Multi-AC30 · Booster" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "synth-board-pack",
    slug: "the-synth-board-hx-stomp-exclusive",
    title: "The Synth Board (Exclusive for HX Stomp / XL / Helix)",
    description: "Transform your fretboard. Designed exclusively for the Line 6 ecosystem, this pack abandons traditional amps and leverages deep DSP routing to turn your guitar into a massive analog synthesizer. Featuring fat polyphonic pads, sweeping sub-bass filters, and retro monophonic lead synth tones—no MIDI pickup required.",
    badge: "HX Stomp",
    type: "HX Stomp",
    price: 9.99,
    lemonSqueezyVariantId: "synth-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/synth-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Line 6 HX Stomp XL", "Deep DSP Router", "Analog Synth Pad Model", "Sub-Bass Filter"],
    tones: [
      { id: "sb-1", name: "Polyphonic Pad", gearTag: "HX Stomp XL · DSP", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "sb-2", name: "Sub-Bass Filter Sweep", gearTag: "Sub-Bass · Filter", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "sb-3", name: "Retro Monophonic Lead", gearTag: "Synth Lead · Mono", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "sb-m1", name: "Polyphonic Pad", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "HX Stomp XL · DSP Routing" },
      { id: "sb-m2", name: "Sub-Bass Filter Sweep", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Sub-Bass Filter · HX" },
      { id: "sb-m3", name: "Retro Monophonic Lead", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Mono Synth · Line 6" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["HX Stomp XL", "Helix"],
  },
  {
    id: "fender-pack",
    slug: "the-american-standard-fender-deluxe",
    title: "The American Standard: Fender Deluxe Series",
    description: "The holy grail of clean pedal platforms. A curated collection capturing the transition from 50s tweed edge-of-breakup to the scooped, crystalline chime of 60s black-panel circuitry. Dripping with authentic spring reverb and tube tremolo, this is the benchmark for American clean tone.",
    badge: "TONEX",
    type: "TONEX",
    price: 6.99,
    lemonSqueezyVariantId: "fender-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/fender-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Fender Deluxe Reverb (1954)", "Fender Twin Reverb (1968)", "Spring Reverb Tank", "Tube Tremolo"],
    tones: [
      { id: "f-1", name: "Tweed Edge Breakup", gearTag: "Tweed Deluxe + Tremolo", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "f-2", name: "Black-Panel Crystal", gearTag: "Twin Reverb · Clean", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "f-3", name: "Spring Reverb Bloom", gearTag: "Spring Tank + Delay", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "f-m1", name: "Tweed Edge Breakup", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Fender Deluxe · Tremolo" },
      { id: "f-m2", name: "Black-Panel Crystal", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Fender Twin · Clean" },
      { id: "f-m3", name: "Spring Reverb Bloom", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Spring Tank · Delay" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "ods-pack",
    slug: "ods-boutique-the-100k-tone",
    title: "ODS Boutique: The $100k Tone",
    description: "The most elusive, touch-sensitive amplifier tone ever captured. Modeled after ultra-rare boutique builds, these captures feature a blooming, three-dimensional midrange and a smooth overdrive that transitions seamlessly from crystal clean to singing sustain based purely on your pick attack.",
    badge: "TONEX",
    type: "TONEX",
    price: 9.99,
    lemonSqueezyVariantId: "ods-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/ods-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Ultra-Rare Boutique Head", "Hand-Wired Transformer", "Vintage Preamp", "Custom Cabinet"],
    tones: [
      { id: "ods-1", name: "Blooming Midrange", gearTag: "Boutique Head + Preamp", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "ods-2", name: "Touch-Sensitive Overdrive", gearTag: "Boutique + Pick Attack", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "ods-3", name: "Crystal Clean", gearTag: "Boutique Clean Channel", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "ods-m1", name: "Blooming Midrange", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Boutique Head · Preamp" },
      { id: "ods-m2", name: "Touch-Sensitive Overdrive", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Boutique · Pick Attack" },
      { id: "ods-m3", name: "Crystal Clean", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Boutique Clean Ch." },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "mayer-pack",
    slug: "gravity-john-mayer-signature-cleans",
    title: "Gravity: John Mayer Signature Cleans",
    description: "That massive, scooped, high-headroom stratocaster tone. By blending captures of premium boutique silver-panel amps and legendary British jubilee heads, this pack delivers incredibly percussive, glassy cleans with a thick, supportive low-end that never gets muddy.",
    badge: "TONEX",
    type: "TONEX",
    price: 7.99,
    lemonSqueezyVariantId: "mayer-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/mayer-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Silver-Panel Amp", "Johnson Jubilee Head", "Stratocaster", "Premium Tube Preamp"],
    tones: [
      { id: "gr-1", name: "Percussive Glass Clean", gearTag: "Silver-Panel + Strat", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "gr-2", name: "Thick Low-End Clean", gearTag: "Jubilee Head + Preamp", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "gr-3", name: "Scooped Chime", gearTag: "Blend + EQ", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "gr-m1", name: "Percussive Glass Clean", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Silver-Panel · Strat" },
      { id: "gr-m2", name: "Thick Low-End Clean", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Jubilee Head · Preamp" },
      { id: "gr-m3", name: "Scooped Chime", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Blend · EQ" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "gilmour-pack",
    slug: "comfortably-numb-david-gilmour-hang",
    title: "Comfortably Numb: David Gilmour Hi-Headroom & Fuzz",
    description: "Stadium-filling ambiance and aggressive fuzz. This pack features the massive, unyielding clean headroom of British custom 100-watt heads, paired with meticulously dialed-in vintage muff-style fuzz, analog delay, and rotary speaker modulation for epic, atmospheric soloing.",
    badge: "TONEX",
    type: "TONEX",
    price: 8.99,
    lemonSqueezyVariantId: "gilmour-variant-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/gilmour-variant-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["British Custom 100W Head", "Vintage Muff Fuzz", "Analog Delay Unit", "Rotary Speaker"],
    tones: [
      { id: "gn-1", name: "Stadium Clean Headroom", gearTag: "100W Head + Clean", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "gn-2", name: "Vintage Muff Fuzz", gearTag: "Muff + Delay", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "gn-3", name: "Rotary Atmospheric Solo", gearTag: "Rotary + Delay", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "gn-m1", name: "Stadium Clean Headroom", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "British 100W · Clean" },
      { id: "gn-m2", name: "Vintage Muff Fuzz", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Muff · Delay" },
      { id: "gn-m3", name: "Rotary Atmospheric Solo", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Rotary · Delay" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "gnawa-deluxe",
    slug: "gnawa-blues-deluxe",
    title: "Gnawa Blues Deluxe",
    description: "A fusion of North African Gnawa rhythms and American blues architecture. Warm tube preamps, hand-built cab IRs, and a signature fusion clean that responds like live analog — built from real studio signal chains.",
    badge: "TONEX",
    type: "TONEX",
    price: 29,
    lemonSqueezyVariantId: "gnawa-deluxe-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/gnawa-deluxe-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Hand-Wired Tube Preamp", "Custom Cab IR (4x12)", "Fusion Clean Head", "Vintage Overdrive"],
    tones: [
      { id: "gd-001", name: "Gnawa Lead & Fusion Clean", gearTag: "Custom Cab + Fusion Head", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "gd-002", name: "Tube Crunch Rhythm Demo", gearTag: "Hand-Wired Preamp · Overdrive", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "gd-003", name: "Solo Boost & Reverb Cab", gearTag: "Cab IR + Boost · Reverb", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "gd-m1", name: "Gnawa Lead & Fusion Clean", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Custom Cab · Fusion Head" },
      { id: "gd-m2", name: "Tube Crunch Rhythm", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Hand-Wired Preamp · Overdrive" },
      { id: "gd-m3", name: "Solo Boost & Reverb Cab", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Cab IR · Reverb" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
  {
    id: "tube-studio",
    slug: "tube-crunch-studio",
    title: "Tube Crunch Studio",
    description: "Heavy crunch rhythm, clean twin roll, and stage reverb swell — captured from real tube heads at stage volume. Touch-sensitive, bloom-focused, engineered for live rigs.",
    badge: "TONEX",
    type: "TONEX",
    price: 24,
    lemonSqueezyVariantId: "tube-studio-id",
    checkoutUrl: "https://medfender.lemonsqueezy.com/checkout/buy/tube-studio-id?embed=1",
    videoDemos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    includedGear: ["Tube Crunch Head", "Clean Twin Reverb", "Stage Reverb Unit", "Vintage Cab (2x12)"],
    tones: [
      { id: "tc-001", name: "Heavy Crunch Rhythm Break", gearTag: "Tube Crunch Head · Cab", audioUrl: "/audio/demos/srv/cold-shot.mp3" },
      { id: "tc-002", name: "Clean Twin Roll", gearTag: "Clean Twin Reverb", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3" },
      { id: "tc-003", name: "Stage Reverb Swell", gearTag: "Reverb Unit + Cab", audioUrl: "/audio/demos/srv/clean-twin.mp3" },
    ],
    toneModels: [
      { id: "tc-m1", name: "Heavy Crunch Rhythm Break", audioUrl: "/audio/demos/srv/cold-shot.mp3", gearTag: "Tube Crunch Head · Cab" },
      { id: "tc-m2", name: "Clean Twin Roll", audioUrl: "/audio/demos/srv/sidi-bouganga-lead.mp3", gearTag: "Clean Twin Reverb" },
      { id: "tc-m3", name: "Stage Reverb Swell", audioUrl: "/audio/demos/srv/clean-twin.mp3", gearTag: "Reverb Unit · Cab" },
    ],
    artist: "Crafted by Medfender",
    license: "Universal License",
    platforms: ["ToneX", "HX Stomp XL", "Helix", "NAM", "Quad Cortex", "Kemper"],
  },
];

export const featuredTrack = {
  title: "Sidi Bouganga",
  artist: "MEDFENDER",
  gearTag: "Fender Strat - TONEX Capture - Line 6 HX Stomp",
  audioUrl: "/audio/featured-artists/Sidi%20Bouganga%20feat%20Younes%20Hadir.mp3",
};
