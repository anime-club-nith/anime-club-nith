import { Github, Instagram, GitPullRequest, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0c0d12] border-t border-slate-200/60 dark:border-slate-800/60 py-12 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Brand Identity */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo-dark.png"
                alt="Anime Club NITH"
                className="h-7 w-auto dark:hidden"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <img
                src="/logo-light.png"
                alt="Anime Club NITH"
                className="h-7 w-auto hidden dark:block"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-base font-bold text-black dark:text-white">
                Anime Club <span className="text-pink-500">NITH</span>
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left leading-relaxed">
              The official anime appreciation society of NIT Hamirpur. Connect, discuss, and celebrate anime culture.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/animeclub_nith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-500/10 text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
                title="@animeclub_nith"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://github.com/anime-club-nith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-500/10 text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center transition-all duration-200"
                aria-label="GitHub"
                title="anime-club-nith on GitHub"
              >
                <Github size={17} />
              </a>
              <a
                href="mailto:animeclubnith@gmail.com"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-500/10 text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center transition-all duration-200"
                aria-label="Email"
                title="animeclubnith@gmail.com"
              >
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <a
              href="https://github.com/anime-club-nith"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-md shadow-pink-500/25 cursor-pointer"
            >
              <GitPullRequest size={15} />
              <span>Contribute on GitHub</span>
            </a>

            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <Link to="/blogs" className="hover:text-pink-500 transition-colors">Blogs</Link>
              <Link to="/download" className="hover:text-pink-500 transition-colors">Get the App</Link>
              <Link to="/join-room" className="hover:text-pink-500 transition-colors">Community</Link>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Anime Club NITH · All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}