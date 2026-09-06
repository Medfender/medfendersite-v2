import Head from "next/head";
import SpiralGalaxyBackground from "../../../components/SpiralGalaxy";

export default function SetupGuidePage() {
  return (
    <>
      <Head>
        <title>Installation & Setup Guides — Medfender</title>
        <meta name="description" content="Everything you need to load your Medfender tones into your DSP ecosystem." />
      </Head>
      <main className="relative min-h-screen text-neutral-100 selection:bg-cyan-500/30">
        <SpiralGalaxyBackground />
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Header — Boutique Support Desk                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <header className="max-w-4xl mx-auto px-6 pt-24 pb-12">
          <h1 className="text-5xl font-black text-white tracking-tight leading-[1.05]">
            Installation & Setup Guides
          </h1>
          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
            Everything you need to load your Medfender tones into your DSP ecosystem.
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Content — Dual Platform Sections                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 pb-28 space-y-28">

          {/* ─── ToneX Section ────────────────────────────────────────── */}
          <article>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#00d8f6] shrink-0" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">ToneX</h2>
            </div>

            <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Load Presets into ToneX</h3>
            <p className="text-zinc-400 mb-8 max-w-2xl leading-relaxed">These captures are fully compatible with the IK Multimedia ToneX ecosystem. Follow the steps below to import your new boutique tones.</p>

            {/* Hardware photo placeholder */}
            <div className="w-full aspect-video bg-transparent border border-zinc-800 rounded-none flex items-center justify-center mb-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
              <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">[Insert High-Res Hardware Photo Here]</span>
            </div>

            {/* Step-by-step numbered cards */}
            <div className="space-y-4">
              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">01</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Extract the downloaded ZIP file</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Locate the .zip archive included with your purchase email. Extract it to a folder on your desktop so the .tonex preset files are visible.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">02</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Open ToneX Librarian</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Launch the ToneX Librarian application on your computer. Ensure your hardware pedal is connected via USB for a direct sync path.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">03</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Drag and drop into your library</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Select all .tonex files from the extracted folder and drag them directly into the ToneX Librarian library window. Confirm the import completes successfully.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">04</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Sync to your hardware pedal</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Press the sync button inside ToneX Librarian to transfer the new presets to your physical ToneX pedal. Power-cycle the pedal after sync completes.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ─── Divider ───────────────────────────────────────────────────── */}
          <div className="w-full h-px bg-zinc-800" />

          {/* ─── HX / Helix Section ────────────────────────────────────────── */}
          <article>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,216,246,0.6)] shrink-0" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">HX Stomp / Helix</h2>
            </div>

            <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Load Presets on Line 6 Hardware</h3>
            <p className="text-zinc-400 mb-8 max-w-2xl leading-relaxed">These .hlx files are designed for the full Line 6 DSP architecture. Follow the steps below to load them safely into an empty user preset slot.</p>

            {/* Hardware photo placeholder */}
            <div className="w-full aspect-video bg-transparent border border-zinc-800 rounded-none flex items-center justify-center mb-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
              <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">[Insert High-Res Hardware Photo Here]</span>
            </div>

            {/* Step-by-step numbered cards */}
            <div className="space-y-4">
              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">01</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Extract the downloaded ZIP file</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Unzip the archive to reveal the .hlx preset files and any included custom Impulse Response (.ir) assets.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">02</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Open HX Edit and select an empty user preset slot</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Launch HX Edit, navigate to an empty user preset, and click to select it. Save your existing preset if needed before importing.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">03</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Import the .hlx preset</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">Click the Import button in HX Edit and navigate to the extracted .hlx file. Confirm the import and verify the preset loads without errors.</p>
                  </div>
                </div>
              </div>

              <div className="bg-transparent border-l-2 border-cyan-500 p-6 shadow-[0_0_20px_rgba(0,216,246,0.05)]">
                <div className="flex gap-4">
                  <span className="text-cyan-400 font-black text-xl shrink-0 w-7">04</span>
                  <div>
                    <h4 className="text-white font-bold tracking-tight mb-1">Load included custom Medfender IRs if required</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">If the preset uses a custom Impulse Response block, load the included .ir files into the same slot number referenced in the preset documentation.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
