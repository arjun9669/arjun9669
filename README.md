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
                      <div className="bg-[#0d1117] rounded-md p-4 relative z-10">
                        <div className="flex flex-wrap items-center gap-2 text-gray-200">
                          <span className="text-cyan-400">➤</span> Profile: <span className="text-white font-mono">arjun9669</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-200">
                          <span className="text-cyan-400">➤</span> Experience: <span className="text-green-400 font-mono">2+ years</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-200">
                          <span className="text-cyan-400">➤</span> Repositories: <span className="text-purple-400 font-mono">25+</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-200">
                          <span className="text-cyan-400">➤</span> Commits: <span className="text-yellow-400 font-mono">500+</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-200">
                          <span className="text-cyan-400">➤</span> Stars: <span className="text-yellow-400 font-mono">50+</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 mt-4 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[75%] rounded-full"></div>
                        </div>
                      </div>
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
                      <div className="bg-[#0d1117] rounded-md p-4 relative z-10">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Current streak:</span>
                            <span className="text-cyan-400 font-mono">15 days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Longest streak:</span>
                            <span className="text-cyan-400 font-mono">45 days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Total contributions:</span>
                            <span className="text-cyan-400 font-mono">500+</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex gap-1">
                              {[...Array(30)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-4 w-4 rounded-sm ${
                                    i < 15 ? 
                                    `bg-cyan-${Math.min(900, 300 + i * 40)}` : 
                                    'bg-gray-800'
                                  }`}
                                ></div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>30 days ago</span>
                              <span>Today</span>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      <div className="bg-[#0d1117] rounded-md p-4 relative z-10">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">Python</span>
                              <span className="text-cyan-400">45%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[45%] rounded-full"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">SQL</span>
                              <span className="text-cyan-400">30%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 w-[30%] rounded-full"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">JavaScript/TypeScript</span>
                              <span className="text-cyan-400">15%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 w-[15%] rounded-full"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">Others</span>
                              <span className="text-cyan-400">10%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[10%] rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      <div className="bg-[#0d1117] rounded-md p-4 relative z-10">
                        <div className="grid grid-cols-12 gap-1">
                          {[...Array(84)].map((_, i) => {
                            // Create a pattern of contributions
                            let intensity = 0;
                            if (i % 7 === 3 || i % 7 === 4) intensity = 3;
                            else if (i % 7 === 2 || i % 7 === 5) intensity = 2;
                            else if (i % 7 === 1 || i % 7 === 6) intensity = 1;
                            
                            return (
                              <div 
                                key={i} 
                                className={`h-3 w-3 rounded-sm ${
                                  intensity === 0 ? 'bg-gray-800' : 
                                  intensity === 1 ? 'bg-cyan-900' : 
                                  intensity === 2 ? 'bg-cyan-700' : 
                                  'bg-cyan-500'
                                }`}
                              ></div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>May</span>
                          <span>Jun</span>
                          <span>Jul</span>
                          <span>Aug</span>
                          <span>Sep</span>
                          <span>Oct</span>
                          <span>Nov</span>
                        </div>
                      </div>
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
