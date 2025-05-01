
import { MessageSquare, Terminal, Code, Zap } from "lucide-react";

const GitHubStats = () => {
  return (
    <section className="py-16" id="github-stats">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-cyan-400 gamer-text-shadow">📊 Achievement Stats</h2>
        
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          {/* Enhanced chat window container with cyber glow effect */}
          <div className="chat-window bg-gray-900 w-full rounded-lg border border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.5)] p-6 overflow-hidden">
            {/* Chat header */}
            <div className="chat-header flex items-center gap-2 border-b border-gray-700 pb-3 mb-4">
              <Terminal className="text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Terminal@ArjunKumar:~$ <span className="text-cyan-400">stats --detailed</span></h3>
            </div>
            
            {/* Chat messages */}
            <div className="chat-messages space-y-6">
              {/* System message */}
              <div className="chat-message system">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-cyan-400 animate-pulse">SYS</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[80%]">
                    <p className="text-gray-400 text-sm mb-1">System <span className="text-xs opacity-50">10:42</span></p>
                    <p className="text-white typewriter-text">Initializing developer profile... <span className="text-green-400">2+ years of contributions verified</span>.</p>
                  </div>
                </div>
              </div>
              
              {/* Stats message - GitHub Stats with glowing border */}
              <div className="chat-message stats">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center text-xs text-cyan-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full border border-cyan-900/50 glow-cyan">
                    <p className="text-gray-400 text-sm mb-2">Statistics <span className="text-xs opacity-50">10:43</span></p>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse rounded-md"></div>
                      <img 
                        src="https://github-readme-stats.vercel.app/api?username=arjun9669&show_icons=true&theme=dark&hide_border=true&title_color=00FFFF&icon_color=00FFFF&text_color=c9d1d9&bg_color=0d1117" 
                        alt="GitHub Stats" 
                        className="rounded-md w-full max-w-full relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats message - Streak Stats with animated background */}
              <div className="chat-message streak">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center text-xs text-cyan-400">
                    <Code className="h-4 w-4" />
                  </div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full border border-cyan-900/50 glow-cyan">
                    <p className="text-gray-400 text-sm mb-2">Contribution Streak <span className="text-xs opacity-50">10:44</span></p>
                    <div className="stats-container relative overflow-hidden">
                      <div className="stats-grid absolute inset-0 z-0"></div>
                      <img 
                        src="https://github-readme-streak-stats.herokuapp.com/?user=arjun9669&theme=black-ice&hide_border=true&stroke=00FFFF&background=0D1117&ring=00FFFF&fire=00FFFF&currStreakLabel=00FFFF" 
                        alt="GitHub Streak Stats" 
                        className="rounded-md w-full max-w-full relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Language stats with gradient overlay */}
              <div className="chat-message languages">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center text-xs text-cyan-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full border border-cyan-900/50 glow-cyan">
                    <p className="text-gray-400 text-sm mb-2">Language Analysis <span className="text-xs opacity-50">10:45</span></p>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-green-500/10 rounded-md"></div>
                      <img 
                        src="https://github-readme-stats.vercel.app/api/top-langs/?username=arjun9669&layout=compact&theme=dark&hide_border=true&title_color=00FFFF&text_color=00FFFF&bg_color=0d1117" 
                        alt="Top Languages" 
                        className="rounded-md w-full max-w-full relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Final system message */}
              <div className="chat-message system">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-cyan-400">SYS</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[80%]">
                    <p className="text-gray-400 text-sm mb-1">System <span className="text-xs opacity-50">10:46</span></p>
                    <p className="text-white">Analysis complete: <span className="text-green-400">2+ years of professional development activity confirmed</span>. Skill proficiency level: <span className="text-cyan-400">Advanced</span>.</p>
                  </div>
                </div>
              </div>

              {/* Contribution graph */}
              <div className="chat-message graph mt-8">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-900 flex items-center justify-center text-xs text-cyan-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full border border-purple-900/50 glow-purple">
                    <p className="text-gray-400 text-sm mb-2">Activity Graph <span className="text-xs opacity-50">10:47</span></p>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 animate-pulse rounded-md"></div>
                      <img 
                        src="https://github-readme-activity-graph.vercel.app/graph?username=arjun9669&bg_color=0d1117&color=00FFFF&line=00FFFF&point=FFFFFF&area=true&hide_border=true" 
                        alt="Activity Graph" 
                        className="rounded-md w-full max-w-full relative z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User message - typing indicator */}
              <div className="chat-message user">
                <div className="flex items-start gap-3 justify-end">
                  <div className="message-bubble bg-cyan-900/40 p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <span className="typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">YOU</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-cyan-300 gamer-text">
              My 2+ years of coding contributions reflect my commitment to building impactful data projects.
              Check out my repositories for detailed examples of my work.
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          .gamer-text-shadow {
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4);
          }
          
          .gamer-text {
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.6);
          }
          
          .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #00FFFF;
            animation: typing-animation 1.4s infinite ease-in-out;
            opacity: 0.7;
          }
          
          .dot:nth-child(1) {
            animation-delay: 0s;
          }
          
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          
          @keyframes typing-animation {
            0%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
          
          .glow-cyan {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          }
          
          .glow-purple {
            box-shadow: 0 0 10px rgba(149, 76, 233, 0.3);
          }
          
          .typewriter-text {
            overflow: hidden;
            border-right: .15em solid cyan;
            white-space: nowrap;
            animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite;
            animation-fill-mode: forwards;
            max-width: fit-content;
          }
          
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          
          @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: cyan; }
          }
          
          .stats-grid {
            background-image: 
              linear-gradient(rgba(6, 37, 61, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 37, 61, 0.3) 1px, transparent 1px);
            background-size: 20px 20px;
            z-index: 0;
            animation: grid-move 15s linear infinite;
          }
          
          @keyframes grid-move {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(20px);
            }
          }
        `}
      </style>
    </section>
  );
};

export default GitHubStats;
