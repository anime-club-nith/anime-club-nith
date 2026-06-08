import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { Download, Tablet, QrCode, Cpu, ShieldCheck } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-pink-100/35 text-black dark:text-white font-sans flex flex-col selection:bg-pink-500/30 transition-colors">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-4 border-black dark:border-white bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black uppercase text-xs shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1] mb-6">
            <Tablet size={14} />
            <span>Mobile Application</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black dark:text-white mb-6">
            Get the <span className="text-pink-500">Mobile App</span>
          </h1>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Take the Anime Club NITH community with you! Chat in real-time, get push notifications, and publish reviews directly from your phone.
          </p>
        </div>

        {/* Download Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Card 1: Android APK */}
          <div className="border-4 border-black dark:border-white bg-white dark:bg-[#161822] p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                <Download size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Android App (APK)</h3>
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-6 leading-relaxed">
                Download and install the native Android APK package directly to your phone. Experience high-performance real-time messaging, fast loading times, and active push notifications for new room messages.
              </p>
              
              {/* Instructions / Info Box */}
              <div className="border-2 border-black dark:border-white bg-pink-50 dark:bg-[#2b1724] p-4 font-semibold text-sm mb-6 flex gap-3 shadow-[3px_3px_0px_#000]">
                <ShieldCheck className="flex-shrink-0 text-pink-600 dark:text-pink-400" size={20} />
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-black text-black dark:text-white uppercase text-xs block mb-1">Installation Guide:</span>
                  Open the downloaded <code>.apk</code> file on your Android device and allow **"Install from Unknown Sources"** in your browser or files app settings.
                </p>
              </div>
            </div>
            
            <a
              href="https://github.com/anime-club-nith/anime-club-nith/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-pink-500 hover:bg-pink-400 border-4 border-black dark:border-white font-black uppercase text-center text-sm shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#E56DB1] active:translate-x-[2px] active:translate-y-[2px] transition flex items-center justify-center gap-2 cursor-pointer text-black dark:text-white"
            >
              <span>Download Latest APK</span>
              <Download size={16} />
            </a>
          </div>

          {/* Card 2: Developer Mode (Expo Go) */}
          <div className="border-4 border-black dark:border-white bg-white dark:bg-[#161822] p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#E56DB1] flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 border-4 border-black dark:border-white bg-pink-500 text-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E56DB1]">
                <QrCode size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-3">Expo Go (Dev / iOS)</h3>
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-6 leading-relaxed">
                Want to test the app on iOS or run the development build? Run the client using the Expo Go app.
              </p>

              {/* Steps */}
              <div className="space-y-4 font-semibold text-sm mb-6 text-gray-700 dark:text-gray-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 border-2 border-black bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <p>Download **Expo Go** from the App Store (iOS) or Play Store (Android).</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 border-2 border-black bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <p>Clone our code repository, go to <code>mobile/</code> and run: <br /><code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 border border-black block mt-1 font-mono text-black dark:text-pink-400">npm install && npm start</code></p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 border-2 border-black bg-pink-100 dark:bg-[#2b1724] text-black dark:text-white font-black rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <p>Scan the terminal's QR code using your phone's camera (iOS) or the Expo Go scanner (Android).</p>
                </div>
              </div>
            </div>

            {/* Mock QR Code Visual */}
            <div className="p-4 border-2 border-black dark:border-white bg-pink-50/50 dark:bg-[#0c0d12]/50 flex items-center justify-center gap-4 shadow-[4px_4px_0px_#000]">
              <div className="p-1 border-2 border-black bg-white">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="black">
                  <path d="M0 0h6v6H0zm2 2v2h2V2zm0 6h4v1H5V9H2v3H0V8zm8-8h6v6H8zm2 2v2h2V2zm-2 6h3v1h1V8h2v1H9v3H8zm8-8h6v6h-6zm2 2v2h2V2zm-2 6h2v1h-2zm4 0h2v1h-2zm-4 4h1v1h-1zm2 0h2v1h-2zm2 0h2v2h-1v-1h-1zM0 18h6v6H0zm2 2v2h2V2zm0-6h1v1H2zm1 1h1v1H3zm2-1h1v2H5zm3 2h1v1H8zm1 1h1v1H9zm-1 2h2v1H8zm4-4h2v1h-2zm1 2h1v2h-1z" />
                </svg>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 flex items-center gap-1">
                  <Cpu size={12} /> Live Developer Sandbox
                </span>
                <span className="text-xs text-gray-500 font-semibold mt-0.5">Start the app locally to activate the live QR scan.</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
