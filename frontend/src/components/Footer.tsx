import { Github, Instagram, GitPullRequest, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-4 border-black dark:border-white bg-white dark:bg-[#0c0d12] py-12 px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Brand Identity */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-dark.svg"
              alt="Anime Club NITH"
              className="h-8 w-auto dark:hidden"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <img
              src="/logo-light.svg"
              alt="Anime Club NITH"
              className="h-8 w-auto hidden dark:block"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-lg font-black text-black dark:text-white uppercase tracking-tighter">
              Anime Club <span className="text-pink-500">NITH</span>
            </span>
          </div>

          {/* Official Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/animeclub_nith"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border-4 border-black dark:border-white bg-white dark:bg-[#161822] text-black dark:text-white hover:bg-pink-100 dark:hover:bg-[#2b1724] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              aria-label="Instagram"
              title="@animeclub_nith"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://github.com/anime-club-nith"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border-4 border-black dark:border-white bg-white dark:bg-[#161822] text-black dark:text-white hover:bg-pink-100 dark:hover:bg-[#2b1724] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              aria-label="GitHub"
              title="anime-club-nith on GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="mailto:animeclubnith@gmail.com"
              className="p-2 border-4 border-black dark:border-white bg-white dark:bg-[#161822] text-black dark:text-white hover:bg-pink-100 dark:hover:bg-[#2b1724] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              aria-label="Email"
              title="animeclubnith@gmail.com"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Contribution & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <a
            href="https://github.com/anime-club-nith"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 border-4 border-black dark:border-white bg-pink-500 hover:bg-pink-400 text-black dark:text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#E56DB1] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer font-black uppercase text-xs"
          >
            <GitPullRequest size={16} className="text-black dark:text-white" />
            <span>Contribute on GitHub</span>
          </a>

          <p className="text-xs font-black uppercase text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Anime Club NITH. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}