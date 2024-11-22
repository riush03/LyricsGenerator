import AudioLyricsGenerator from "@/components/AudioTranscriber";
import AudioAnalyzer from "@/components/AudiAnalyzer";
import Navbar from "@/components/Navbar";

export default function LyricsGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <AudioLyricsGenerator/>
      </main>
    </div>
  );
}