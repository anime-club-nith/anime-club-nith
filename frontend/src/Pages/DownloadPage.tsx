import { useEffect } from "react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { Download, Tablet, QrCode, Cpu, ShieldCheck } from "lucide-react";

export default function DownloadPage() {
  useEffect(() => {
    const link = document.createElement('a');
    link.href = '/app-release.apk';
    link.download = 'AnimeClubNITH.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/20 to-white dark:from-[#0c0d12] dark:via-[#0c0d12] dark:to-[#0c0d12] text-black dark:text-white font-sans flex flex-col selection:bg-pink-500/30 transition-colors">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-20 px-6 max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold border border-pink-200 dark:border-pink-500/20 mb-6">
            <Tablet size={13} />
            <span>Mobile Application</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black dark:text-white mb-5">
            Get the <span className="text-pink-500">Mobile App</span>
          </h1>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Take the Anime Club NITH community with you! Chat in real-time, get push notifications, and publish reviews directly from your phone.
          </p>
        </div>

        {/* Download Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Android APK */}
          <div className="card-modern p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center mb-6 shadow-md shadow-pink-500/30">
                <Download size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Android App (APK)</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-6 leading-relaxed">
                Download and install the native Android APK package directly to your phone. Experience high-performance real-time messaging, fast loading times, and active push notifications for new room messages.
              </p>
              
              {/* Instructions / Info Box */}
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-4 font-medium text-sm mb-6 flex gap-3">
                <ShieldCheck className="flex-shrink-0 text-pink-500 dark:text-pink-400" size={20} />
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-black dark:text-white uppercase text-xs block mb-1">Installation Guide:</span>
                  Open the downloaded <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-pink-600 dark:text-pink-400">.apk</code> file on your Android device and allow <strong>"Install from Unknown Sources"</strong> in your browser or files app settings.
                </p>
              </div>
            </div>
            
            <a
              href="/app-release.apk"
              download="AnimeClubNITH.apk"
              className="w-full btn-pink-modern flex items-center justify-center gap-2 text-sm"
            >
              <span>Download Latest APK</span>
              <Download size={16} />
            </a>
          </div>

          {/* Card 2: Developer Mode (Expo Go) */}
          <div className="card-modern p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center mb-6 shadow-md shadow-pink-500/30">
                <QrCode size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Expo Go (Dev / iOS)</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-6 leading-relaxed">
                Want to test the app on iOS or run the development build? Run the client using the Expo Go app.
              </p>

              {/* Steps */}
              <div className="space-y-4 font-medium text-sm mb-6 text-slate-600 dark:text-slate-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/20 flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <p>Download <strong>Expo Go</strong> from the App Store (iOS) or Play Store (Android).</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/20 flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <p>Clone our code repository, go to <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-pink-600 dark:text-pink-400">mobile/</code> and run: <br /><code className="text-xs bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg block mt-1 font-mono text-pink-600 dark:text-pink-400">npm install &amp;&amp; npm start</code></p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/20 flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <p>Scan the terminal's QR code using your phone's camera (iOS) or the Expo Go scanner (Android).</p>
                </div>
              </div>
            </div>

            {/* Mock QR Code Visual */}
            <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 p-4 flex items-center justify-center gap-4 shadow-sm">
              <div className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-black dark:text-white">
                  <path d="M0 0h6v6H0zm2 2v2h2V2zm0 6h4v1H5V9H2v3H0V8zm8-8h6v6H8zm2 2v2h2V2zm-2 6h3v1h1V8h2v1H9v3H8zm8-8h6v6h-6zm2 2v2h2V2zm-2 6h2v1h-2zm4 0h2v1h-2zm-4 4h1v1h-1zm2 0h2v1h-2zm2 0h2v2h-1v-1h-1zM0 18h6v6H0zm2 2v2h2V2zm0-6h1v1H2zm1 1h1v1H3zm2-1h1v2H5zm3 2h1v1H8zm1 1h1v1H9zm-1 2h2v1H8zm4-4h2v1h-2zm1 2h1v2h-1z" />
                </svg>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                  <Cpu size={11} /> Live Developer Sandbox
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Start the app locally to activate the live QR scan.</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
