import { useEffect, useState } from 'react';
import { Rocket, GitPullRequest, Zap } from 'lucide-react';

interface Feature {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default function ProposedFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features');
        const data = await response.json();
        if (Array.isArray(data)) {
          setFeatures(data);
        } else if (data.features && Array.isArray(data.features)) {
          setFeatures(data.features);
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return (
    <div className="bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans py-24 px-6 relative overflow-hidden border-t-4 border-black dark:border-white transition-colors">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-4 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black uppercase text-xs shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] mb-6">
            <Rocket size={14} />
            <span>Roadmap v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black dark:text-white mb-6">
            Building the <span className="text-pink-500">Future of Anime Club</span>
          </h1>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We are constantly evolving. Here is a sneak peek at the major updates coming to the platform in the next release.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] h-64 animate-pulse flex flex-col justify-between shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1]">
                <div className="w-12 h-12 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))
          ) : (
            features.map((feature, index) => (
              <div 
                key={feature._id || index}
                className="p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_#000] dark:hover:shadow-[6px_6px_0px_#E56DB1] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black dark:text-white flex items-center justify-center shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">
                    <Zap size={24} />
                  </div>
                  <span className="px-3 py-1 border-2 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-[10px] font-black uppercase tracking-wide text-black dark:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#E56DB1]">
                    {feature.status || "Planned"}
                  </span>
                </div>
                
                <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Progress Line */}
                <div className="w-full h-2.5 border-2 border-black dark:border-white bg-white dark:bg-gray-800 overflow-hidden shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#E56DB1]">
                  <div className="h-full bg-pink-500 w-1/3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 border-4 border-black dark:border-white bg-white dark:bg-[#161822] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] max-w-xl transition-all">
            <GitPullRequest className="text-pink-500" size={32} />
            <h3 className="text-xl font-black uppercase text-black dark:text-white">Have a feature in mind?</h3>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm max-w-md">
              Anime Club NITH is open source. You can propose features or contribute directly to the codebase on GitHub.
            </p>
            <a 
              href="https://github.com/anime-club-nith" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 border-4 border-black dark:border-white px-6 py-3 font-black uppercase text-sm bg-pink-500 hover:bg-pink-400 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] active:translate-x-[2px] active:translate-y-[2px] transition text-black dark:text-white cursor-pointer"
            >
              Submit Proposal
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}