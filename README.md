
const GitHubStats = () => {
  return (
    <section className="py-16" id="github-stats">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-purple-400 gamer-text-shadow">📊 GitHub Stats</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="stats-card bg-gray-800 bg-opacity-70 p-4 rounded-lg border border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <img 
              src="https://github-readme-stats.vercel.app/api?username=arjun9669&show_icons=true&theme=radical&hide_border=true" 
              alt="GitHub Stats" 
              className="rounded-md"
            />
          </div>
          
          <div className="stats-card bg-gray-800 bg-opacity-70 p-4 rounded-lg border border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <img 
              src="https://github-readme-streak-stats.herokuapp.com/?user=arjun9669&theme=radical&hide_border=true" 
              alt="GitHub Streak Stats" 
              className="rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-gray-300">
            My contributions reflect my commitment to building meaningful data projects.
            Check out my repositories for detailed project walkthroughs.
          </p>
        </div>
      </div>

      <style>
        {`
          .gamer-text-shadow {
            text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
          }
        `}
      </style>
    </section>
  );
};

export default GitHubStats;
