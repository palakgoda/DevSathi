'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  // Reveal animation logic converted to React useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased overflow-x-hidden selection:bg-secondary-container selection:text-tertiary-container light">
      {/* Embedded Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
        
        .glass-panel {
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(192, 201, 194, 0.4);
            box-shadow: 0 4px 24px rgba(30, 77, 59, 0.08);
        }
        
        .glass-panel-dark {
            background-color: rgba(8, 28, 21, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(192, 201, 194, 0.1);
        }

        .ambient-shadow {
            box-shadow: 0 12px 32px -4px rgba(30, 77, 59, 0.12), 0 4px 16px -4px rgba(30, 77, 59, 0.08);
        }

        .inner-glow {
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .bg-grid-pattern {
            background-image: 
                linear-gradient(to right, rgba(113, 121, 116, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(113, 121, 116, 0.05) 1px, transparent 1px);
            background-size: 24px 24px;
        }

        .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
      `}} />

      {/* TopNavBar */}
      <header className="bg-surface/60 dark:bg-surface/60 backdrop-blur-xl docked full-width top-0 sticky z-50 shadow-sm dark:shadow-none border-b border-outline-variant/20">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed hidden md:block">
            DevSarthi
          </div>
          <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed md:hidden">
            DevSarthi
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-primary dark:text-primary-fixed font-semibold border-b-2 border-primary pb-1" href="#">Home</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#features">Features</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#how-it-works">How it Works</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#">Workspace</a>
          </nav>
          <Link href="/login" className="bg-primary text-on-primary px-6 py-2 rounded font-title-md text-title-md hover:opacity-80 transition-opacity duration-300 active:scale-95 transition-transform inner-glow shadow-sm hidden md:block">
            Login
          </Link>
          <button className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined" data-icon="menu">menu</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-margin-mobile md:px-margin-desktop overflow-hidden bg-grid-pattern">
        {/* Abstract background blur blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="max-w-container-max mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant mb-8">
            <span className="material-symbols-outlined text-[16px] text-secondary" data-icon="school">school</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">Built for Mumbai University</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-6 max-w-4xl tracking-tight leading-tight">
            Learn Smarter. Code Deeper. <br /> <span className="text-secondary">Think for Yourself.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            The AI learning workspace that doesn't just give you answers. DevSarthi uses Socratic dialogue and your actual syllabus materials to help you understand the 'why' behind the code.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-24">
            <Link href="/login" className="bg-primary text-on-primary px-8 py-4 rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-colors duration-300 inner-glow shadow-md flex items-center gap-2">
              Enter Workspace
              <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
            </Link>
            <button className="px-8 py-4 rounded-lg font-title-md text-title-md text-primary border border-outline hover:bg-surface-container transition-colors duration-300 flex items-center gap-2">
              Watch Demo
              <span className="material-symbols-outlined" data-icon="play_circle">play_circle</span>
            </button>
          </div>

          {/* 3-Panel Workspace Preview */}
          <div className="w-full max-w-6xl mx-auto relative perspective-1000 mt-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-primary/20 to-teal-500/20 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-[#FDF9EF] rounded-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] border border-[#c0c9c2] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-700 p-4 gap-4">

              {/* Left: Sources Panel */}
              <div className="w-full md:w-64 bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] flex flex-col overflow-hidden min-h-[250px] md:min-h-0 shadow-sm">
                <div className="p-4 border-b border-[#c0c9c2]/40 bg-white/40 flex justify-between items-center">
                  <h2 className="font-title-md text-[#013626] font-bold text-sm tracking-wide">Workspace</h2>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-[16px] text-gray-500 cursor-pointer hover:text-[#013626]" data-icon="note_add">note_add</span>
                    <span className="material-symbols-outlined text-[16px] text-gray-500 cursor-pointer hover:text-[#013626]" data-icon="create_new_folder">create_new_folder</span>
                  </div>
                </div>
                <div className="p-2 flex-1 space-y-1">
                  <div className="bg-white border border-[#013626] shadow-sm rounded-lg p-2.5 cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#013626]" data-icon="code">code</span>
                    <h4 className="text-xs font-semibold text-[#013626] truncate">main.py</h4>
                  </div>
                  <div className="bg-transparent hover:bg-white/60 border border-transparent hover:border-[#c0c9c2]/50 rounded-lg p-2.5 cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-500" data-icon="picture_as_pdf">picture_as_pdf</span>
                    <h4 className="text-xs font-semibold text-gray-800 truncate">Array_Traversals.pdf</h4>
                  </div>
                  <div className="bg-transparent hover:bg-white/60 border border-transparent hover:border-[#c0c9c2]/50 rounded-lg p-2.5 cursor-pointer flex items-center gap-2 opacity-80">
                    <span className="material-symbols-outlined text-[16px] text-blue-500" data-icon="description">description</span>
                    <h4 className="text-xs font-semibold text-gray-800 truncate">Lab_Notes.txt</h4>
                  </div>
                </div>
              </div>

              {/* Center: Code Editor */}
              <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0">
                <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-[#1a1a1a] shadow-lg flex flex-col relative overflow-hidden">
                  <div className="h-10 border-b border-[#2a2a2a] bg-[#121212] flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/50"></div>
                      </div>
                      <span className="font-mono text-xs text-gray-300 ml-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400" data-icon="code">code</span> main.py
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-[#013626] text-white rounded text-[11px] font-medium flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]" data-icon="play_arrow">play_arrow</span> Run
                    </button>
                  </div>
                  <div className="p-4 font-mono text-[13px] text-gray-300 overflow-y-auto h-full relative leading-relaxed">
                    <div className="text-gray-500 mb-2"># Array iteration challenge</div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">1</span><span className="text-[#c678dd]">def</span> <span className="text-[#61afef]">process_data</span><span className="text-gray-300">(</span><span className="text-[#e06c75]">arr</span><span className="text-gray-300">):</span></div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">2</span>    total = <span className="text-[#d19a66]">0</span></div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">3</span>    <span className="text-[#c678dd]">for</span> i <span className="text-[#c678dd]">in</span> <span className="text-[#56b6c2]">range</span>(<span className="text-[#56b6c2]">len</span>(arr) + <span className="text-[#d19a66]">1</span>):</div>
                    <div className="flex relative bg-red-900/20 -mx-4 px-4 border-l-2 border-red-500"><span className="w-8 text-red-400 select-none">4</span><span className="text-gray-300">        total += arr[i]  <span className="text-gray-500"># Calculating sum</span></span></div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">5</span>    <span className="text-[#c678dd]">return</span> total</div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">6</span></div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">7</span>data = [<span className="text-[#d19a66]">10</span>, <span className="text-[#d19a66]">20</span>, <span className="text-[#d19a66]">30</span>, <span className="text-[#d19a66]">40</span>]</div>
                    <div className="flex"><span className="w-8 text-gray-600 select-none">8</span><span className="text-[#56b6c2]">print</span>(process_data(data))</div>
  
                    {/* Error Toast in Editor */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-red-500" data-icon="error">error</span>
                      <span className="font-mono text-xs text-gray-300">IndexError on line 4</span>
                      <div className="w-[1px] h-3 bg-gray-600 mx-1"></div>
                      <span className="text-emerald-400 text-xs font-sans font-medium flex items-center gap-1 cursor-pointer">
                        Get Hint <span className="material-symbols-outlined text-[14px]" data-icon="arrow_forward">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI Chat Panel */}
              <div className="w-full md:w-80 bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] flex flex-col overflow-hidden min-h-[400px] md:min-h-0 shadow-sm relative">
                <div className="p-3 border-b border-[#c0c9c2]/40 bg-[#f7f3e9] flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-[#c0c9c2]/60">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#013626] text-[#FDF9EF] shadow-sm">
                      <span className="material-symbols-outlined text-[14px]" data-icon="psychology">psychology</span>
                      Tutor
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#013626] bg-[#e6eee9] px-2 py-0.5 rounded-full border border-[#013626]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Context Active
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FDF9EF]/50 pb-16">
                  {/* User Message */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">You</span>
                    <div className="bg-[#013626] text-[#FDF9EF] p-3 rounded-2xl rounded-tr-sm text-xs leading-relaxed max-w-[90%] shadow-sm">
                      I'm getting an IndexError on line 4. Why?
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">DevSarthi</span>
                    <div className="bg-white border border-[#c0c9c2]/50 text-gray-800 p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed max-w-[90%] shadow-sm">
                      <p className="mb-2">Let's look at the loop condition in line 3:</p>
                      <code className="block bg-[#f7f3e9] text-[#013626] p-2 rounded text-[11px] font-mono mb-2 border border-[#c0c9c2]/30">for i in range(len(arr) + 1):</code>
                      <p className="mb-2">What happens when `i` reaches the value of `len(arr)`?</p>
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-600 shrink-0 mt-0.5" data-icon="lightbulb">lightbulb</span>
                        <span>Hint: Array indices are zero-based. Check your syllabus notes on "Array Traversals".</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Chat Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#c0c9c2]/50 bg-white">
                  <div className="flex items-center gap-2 bg-[#FDF9EF]/80 border border-[#c0c9c2] rounded-xl p-1.5">
                    <input className="w-full bg-transparent border-none focus:ring-0 text-xs px-2 py-1 text-gray-800 placeholder-gray-400" placeholder="Ask DevSarthi..." type="text" />
                    <button className="p-1.5 bg-[#013626] text-white rounded-lg hover:bg-[#001f14] transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[14px]" data-icon="send">send</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Generic AI vs DevSarthi (Differentiation) */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">More Than an AI That Gives You Answers</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">True engineering understanding doesn't come from copy-pasting solutions.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Generic AI Card */}
            <div className="glass-panel p-8 rounded-xl border border-outline-variant/30 flex flex-col bg-surface opacity-80 filter grayscale-[20%]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-outline" data-icon="code_blocks">code_blocks</span>
                <h3 className="font-title-md text-title-md text-on-surface-variant">Generic Code Assistants</h3>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[16px]" data-icon="person">person</span></div>
                  <div className="bg-surface-variant p-3 rounded-lg rounded-tl-none"><p className="text-[14px]">Fix this IndexError for me.</p></div>
                </div>
                <div className="flex gap-3 justify-end opacity-70">
                  <div className="bg-surface-variant p-3 rounded-lg rounded-tr-none text-right">
                    <p className="text-[14px] mb-2">Here is the fixed code:</p>
                    <code className="text-[12px] bg-white p-1 rounded block">for i in range(len(arr)):</code>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[16px]" data-icon="smart_toy">smart_toy</span></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[18px]" data-icon="cancel">cancel</span>
                <span className="font-body-md font-semibold text-[14px]">Result: Problem solved, zero learning.</span>
              </div>
            </div>

            {/* DevSarthi Card */}
            <div className="glass-panel p-8 rounded-xl border border-primary/30 flex flex-col bg-surface shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container blur-3xl opacity-10 rounded-full"></div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <span className="material-symbols-outlined text-primary" data-icon="school">school</span>
                <h3 className="font-title-md text-title-md text-primary font-bold">DevSarthi Approach</h3>
              </div>
              <div className="space-y-4 flex-1 relative z-10">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant"><span className="material-symbols-outlined text-[16px]" data-icon="person">person</span></div>
                  <div className="bg-surface-container-high p-3 rounded-lg rounded-tl-none border border-outline-variant/20"><p className="text-[14px]">Fix this IndexError for me.</p></div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary-container p-3 rounded-lg rounded-tr-none border border-primary/20 text-on-primary-container max-w-[85%] shadow-sm">
                    <p className="text-[14px] mb-2">I won't give you the answer directly, but let's figure it out together. Look at your syllabus notes on 'Array Traversals' attached. What is the maximum valid index for an array of size N?</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary shadow-sm"><span className="material-symbols-outlined text-[16px]" data-icon="psychology">psychology</span></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-primary/20 flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span>
                <span className="font-body-md font-semibold text-[14px]">Result: Deep comprehension achieved.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (Timeline) Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="how-it-works">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary">How it Works</h2>
          </div>
          <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/40 before:to-transparent">

            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-low bg-surface-container-highest text-on-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 font-bold font-title-md">01</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-outline-variant/20 bg-surface shadow-sm group-hover:border-primary/40 transition-colors">
                <h3 className="font-title-md text-primary mb-2">PASTE</h3>
                <p className="font-body-md text-on-surface-variant">Paste your buggy code or challenging assignment problem directly into the DevSarthi editor.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-low bg-surface-container-highest text-on-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 font-bold font-title-md">02</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-outline-variant/20 bg-surface shadow-sm group-hover:border-primary/40 transition-colors">
                <h3 className="font-title-md text-primary mb-2">UPLOAD</h3>
                <p className="font-body-md text-on-surface-variant">Upload your specific syllabus PDFs, lab manuals, or class notes securely to your local workspace.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-low bg-primary-container text-on-primary-container shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 font-bold font-title-md">03</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-primary/20 bg-primary/5 shadow-sm group-hover:border-primary/40 transition-colors">
                <h3 className="font-title-md text-primary mb-2">CONTEXT</h3>
                <p className="font-body-md text-on-surface-variant">DevSarthi cross-references your code with your uploaded materials to build a private knowledge graph.</p>
              </div>
            </div>
            {/* Step 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-low bg-surface-container-highest text-on-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 font-bold font-title-md">04</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-outline-variant/20 bg-surface shadow-sm group-hover:border-primary/40 transition-colors">
                <h3 className="font-title-md text-primary mb-2">DIALOGUE</h3>
                <p className="font-body-md text-on-surface-variant">Engage in Socratic questioning with the AI, which guides you to find the root cause using your own notes.</p>
              </div>
            </div>
            {/* Step 5 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group reveal" style={{ transitionDelay: '0.5s' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-low bg-secondary text-on-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 font-bold font-title-md">05</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-secondary/30 bg-secondary-container/10 shadow-sm group-hover:border-secondary/60 transition-colors">
                <h3 className="font-title-md text-secondary mb-2">MASTER</h3>
                <p className="font-body-md text-on-surface-variant">Truly understand the underlying concept, fix the bug yourself, and feel confident for your practical exams.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Source-Based Learning (Bento Grid) */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface" id="features">
        <div className="max-w-container-max mx-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Learn From Your Own Material</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Don't rely on generic web searches. Ground your AI in the exact syllabus, PDFs, and notes prescribed by your professors.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">

            {/* Upload Panel (Spans 2 columns on desktop) */}
            <div className="md:col-span-2 bg-surface-container rounded-2xl p-8 border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-surface-container-high rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary mb-6 shadow-sm border border-outline-variant/10">
                  <span className="material-symbols-outlined" data-icon="cloud_upload">cloud_upload</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-2">1. Secure Local Upload</h3>
                <p className="font-body-md text-on-surface-variant max-w-sm">Drag and drop PDFs, code files, or text. Everything stays local. No data is sent to external servers.</p>
              </div>
              <div className="mt-4 flex gap-2 relative z-10">
                <div className="px-3 py-1.5 bg-surface rounded text-[12px] font-label-caps text-on-surface-variant border border-outline-variant/30 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="picture_as_pdf">picture_as_pdf</span> .PDF</div>
                <div className="px-3 py-1.5 bg-surface rounded text-[12px] font-label-caps text-on-surface-variant border border-outline-variant/30 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="terminal">terminal</span> .PY, .C, .JAVA</div>
              </div>
            </div>

            {/* Understand Panel */}
            <div className="bg-primary text-on-primary rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden inner-glow shadow-md reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tertiary/40 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary-fixed mb-6">
                  <span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
                </div>
                <h3 className="font-title-md text-title-md mb-2">2. Context Creation</h3>
                <p className="font-body-md text-on-primary/80">DevSarthi builds a private knowledge graph from your materials.</p>
              </div>
            </div>

            {/* Ask Panel */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/20 flex flex-col justify-between reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-secondary mb-6">
                <span className="material-symbols-outlined" data-icon="forum">forum</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md text-on-surface mb-2">3. Socratic Query</h3>
                <p className="font-body-md text-on-surface-variant">Ask questions. Get guided back to specific pages in your own notes.</p>
              </div>
            </div>

            {/* Master Panel (Spans 2 columns) */}
            <div className="md:col-span-2 bg-inverse-surface text-inverse-on-surface rounded-2xl p-8 flex items-center justify-between overflow-hidden relative shadow-lg reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="absolute left-0 top-0 w-full h-full bg-grid-pattern opacity-10"></div>
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 bg-surface-tint/30 rounded-xl flex items-center justify-center text-secondary-fixed mb-6 border border-surface-tint">
                  <span className="material-symbols-outlined" data-icon="workspace_premium">workspace_premium</span>
                </div>
                <h3 className="font-title-md text-title-md mb-2">4. Master the Syllabus</h3>
                <p className="font-body-md text-inverse-on-surface/70">Bridge the gap between practical coding errors and academic theory. Ace vivas and practical exams with deep understanding.</p>
              </div>
              <div className="hidden md:block relative z-10">
                {/* Decorative abstract representation of mastering */}
                <div className="w-32 h-32 rounded-full border-4 border-secondary-fixed/20 flex items-center justify-center relative">
                  <div className="absolute w-24 h-24 rounded-full border-4 border-secondary-fixed/40 border-t-secondary-fixed animate-spin" style={{ animationDuration: '3s' }}></div>
                  <span className="material-symbols-outlined text-[40px] text-secondary-fixed" data-icon="lightbulb">lightbulb</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Academic Support */}
      <section className="py-12 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant/20 reveal">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 reveal" style={{ transitionDelay: '0.1s' }}>
            <span className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-widest font-semibold">Trusted Architecture</span>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" data-icon="key_off">key_off</span>
                <span className="font-body-md text-[13px] font-semibold text-on-surface">No API Keys</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary" data-icon="dns">dns</span>
                <span className="font-body-md text-[13px] font-semibold text-on-surface">100% Local</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 reveal" style={{ transitionDelay: '0.2s' }}>
            <span className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-widest font-semibold">Optimized For</span>
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-[12px] border border-primary/20">Computer Engg (CS)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-[12px] border border-primary/20">Info Tech (IT)</span>
              <span className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-[12px] border border-primary/20">AI &amp; DS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="w-full py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6 max-w-container-max mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-serif text-xl font-bold text-primary tracking-tight">
              DevSarthi
            </div>
            <p className="font-body-md text-[13px] text-on-surface-variant text-center md:text-left">
              © {new Date().getFullYear()} DevSarthi. Built for Mumbai University.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <a className="font-body-md text-[13px] text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-md text-[13px] text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-md text-[13px] text-on-surface-variant hover:text-primary transition-colors" href="#">MU Syllabus</a>
            <a className="font-body-md text-[13px] text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}