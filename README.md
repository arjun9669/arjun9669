
import { MessageSquare } from "lucide-react";

const GitHubStats = () => {
  return (
    <section className="py-16" id="github-stats">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-cyan-400 gamer-text-shadow">📊 Achievement Stats</h2>
        
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          {/* Chat box container */}
          <div className="chat-window bg-gray-900 w-full rounded-lg border border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.5)] p-6 overflow-hidden">
            {/* Chat header */}
            <div className="chat-header flex items-center gap-2 border-b border-gray-700 pb-3 mb-4">
              <MessageSquare className="text-cyan-400" />
              <h3 className="text-xl font-bold text-white">GitHub Statistics Terminal</h3>
            </div>
            
            {/* Chat messages */}
            <div className="chat-messages space-y-6">
              {/* System message */}
              <div className="chat-message system">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-cyan-400">SYS</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[80%]">
                    <p className="text-gray-400 text-sm mb-1">System <span className="text-xs opacity-50">10:42</span></p>
                    <p className="text-white">Initializing developer stats retrieval... Connection established.</p>
                  </div>
                </div>
              </div>
              
              {/* Stats message - GitHub Stats */}
              <div className="chat-message stats">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center text-xs text-cyan-400">STAT</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full">
                    <p className="text-gray-400 text-sm mb-2">Statistics <span className="text-xs opacity-50">10:43</span></p>
                    <img 
                      src="https://github-readme-stats.vercel.app/api?username=arjun9669&show_icons=true&theme=dark&hide_border=true&title_color=00FFFF&icon_color=00FFFF&text_color=c9d1d9&bg_color=0d1117" 
                      alt="GitHub Stats" 
                      className="rounded-md w-full max-w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Stats message - Streak Stats */}
              <div className="chat-message streak">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center text-xs text-cyan-400">STRK</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[90%] w-full">
                    <p className="text-gray-400 text-sm mb-2">Contribution Streak <span className="text-xs opacity-50">10:44</span></p>
                    <img 
                      src="https://github-readme-streak-stats.herokuapp.com/?user=arjun9669&theme=black-ice&hide_border=true&stroke=00FFFF&background=0D1117&ring=00FFFF&fire=00FFFF&currStreakLabel=00FFFF" 
                      alt="GitHub Streak Stats" 
                      className="rounded-md w-full max-w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Final system message */}
              <div className="chat-message system">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-cyan-400">SYS</div>
                  <div className="message-bubble bg-gray-800 p-3 rounded-lg max-w-[80%]">
                    <p className="text-gray-400 text-sm mb-1">System <span className="text-xs opacity-50">10:45</span></p>
                    <p className="text-white">Stats analysis complete. Developer shows exceptional activity patterns.</p>
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
              My coding contributions reflect my commitment to building epic data projects.
              Check out my repositories for detailed quest walkthroughs.
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
        `}
      </style>
    </section>
  );
};

export default GitHubStats;
