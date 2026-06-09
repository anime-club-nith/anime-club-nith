import { useEffect, useState } from 'react';
import { Rocket, GitPullRequest, Zap } from 'lucide-react';

interface Feature {
  _id: string;
  title: string;
  description: string;
  status: string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    _id: "default-1",
    title: "Real-time Watch Parties",
    description: "Synchronized anime streaming with integrated voice and text chat rooms for club members.",
    status: "In Progress"
  },
  {
    _id: "default-2",
    title: "Manga Reader Integration",
    description: "Ad-free, high-speed built-in manga reader with chapter discussion threads.",
    status: "Planned"
  },
  {
    _id: "default-3",
    title: "Club Events & Merch",
    description: "Cosplay contest hosting, annual registrations, and official club merch shop.",
    status: "Planned"
  }
];

export default function ProposedFeatures() {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features');
        if (response.ok) {
          const data = await response.json();
          let loadedFeatures: Feature[] = [];
          if (Array.isArray(data)) {
            loadedFeatures = data;
          } else if (data && data.features && Array.isArray(data.features)) {
            loadedFeatures = data.features;
          }
          if (loadedFeatures.length > 0) {
            setFeatures(loadedFeatures);
          }
        }
      } catch (error) {
        console.error("Background fetch for features failed:", error);
      }
    };

    fetchFeatures();
  }, []);

  return (
    <div className="bg-white dark:bg-[#0c0d12] text-black dark:text-white font-sans py-24 px-6 relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20 mb-6">
            <Rocket size={13} />
            <span>Roadmap v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black dark:text-white mb-5">
            Building the <span className="text-pink-500">Future of Anime Club</span>
          </h1>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are constantly evolving. Here is a sneak peek at the major updates coming to the platform in the next release.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature._id || index}
              className="card-modern p-8 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-7">
                <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-md shadow-pink-500/30">
                  <Zap size={22} className="text-white" />
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold border border-pink-200 dark:border-pink-500/20 uppercase tracking-wide">
                  {feature.status || "Planned"}
                </span>
              </div>
              
              <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-pink-500 w-1/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 card-modern max-w-xl">
            <GitPullRequest className="text-pink-500" size={32} />
            <h3 className="text-xl font-black uppercase text-black dark:text-white">Have a feature in mind?</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm max-w-md">
              Anime Club NITH is open source. You can propose features or contribute directly to the codebase on GitHub.
            </p>
            <a 
              href="https://github.com/anime-club-nith" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-pink-modern mt-2"
            >
              Submit Proposal
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}