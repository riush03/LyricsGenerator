"use client"

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  AudioLines, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  History,
  Music
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Utterance {
  speaker: string;
  text: string;
}

interface HistoryItem {
  id: number;
  fileName: string;
  utterances?: Utterance[];
  timestamp: string;
  lyrics?: string;
}

interface TranscriptionData {
  text: string;
  utterances?: Utterance[];
  analysis?: {
    sentiment?: string;
    genre?: string;
    collaboration?: string;
    lyrics?: string;
  };
}

const AudioLyricsGenerator: React.FC = () => {
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("transcription");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('audioLyricsHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleTranscription = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data: TranscriptionData = await response.json();
      setTranscription(data);

      // Create and save history item
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        fileName: selectedFile.name,
        utterances: data.utterances,
        timestamp: new Date().toISOString(),
        lyrics: data.analysis?.lyrics
      };

      const updatedHistory = [...history, newHistoryItem];
      setHistory(updatedHistory);
      localStorage.setItem('audioLyricsHistory', JSON.stringify(updatedHistory));

      // Automatically switch to lyrics tab if lyrics are generated
      if (data.analysis?.lyrics) {
        setActiveTab('lyrics');
      }

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AudioLines className="w-6 h-6 text-blue-600" />
            Audio Transcription & Lyrics
          </CardTitle>
          <CardDescription>
            Upload an audio file to transcribe and generate lyrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileSelect}
              className="hidden" 
              id="audio-upload"
            />
            <label 
              htmlFor="audio-upload" 
              className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition"
            >
              <Upload className="w-5 h-5" />
              {selectedFile ? selectedFile.name : 'Choose Audio File'}
            </label>
            <Button 
              onClick={handleTranscription} 
              disabled={!selectedFile || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <AudioLines className="w-4 h-4" />
                  Transcribe & Generate
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {error}
            </div>
          )}

          {(transcription || history.length > 0) && (
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full mt-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcription">Transcription</TabsTrigger>
                <TabsTrigger value="lyrics">
                  <Music className="w-4 h-4 mr-2" /> Lyrics
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="w-4 h-4 mr-2" /> History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transcription">
                {transcription && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Transcription Results
                      </h3>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-gray-700">{transcription.text}</p>
                    </div>

                    {transcription.utterances && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-600 mb-2">
                          Speaker Breakdown
                        </h4>
                        {transcription.utterances.map((utterance, index) => (
                          <div 
                            key={index} 
                            className="bg-white p-3 rounded-md shadow-sm mb-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span className="font-semibold text-gray-700">
                                Speaker {utterance.speaker}
                              </span>
                            </div>
                            <p className="text-gray-600">{utterance.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="lyrics">
                {transcription?.analysis?.lyrics && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Generated Lyrics
                      </h3>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {transcription.analysis.lyrics}
                      </p>
                    </div>
                    {transcription.analysis && (
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-600">Sentiment</h4>
                          <p className="text-gray-700">{transcription.analysis.sentiment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-600">Genre</h4>
                          <p className="text-gray-700">{transcription.analysis.genre}</p>
                        </div>
                        <div className="col-span-2">
                          <h4 className="font-semibold text-gray-600">Collaboration</h4>
                          <p className="text-gray-700">{transcription.analysis.collaboration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history">
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Transcription History
                    </h3>
                  </div>
                  {history.length === 0 ? (
                    <p className="text-gray-600 text-center">No history available</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-white p-3 rounded-md shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">
                              {item.fileName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            {item.utterances && (
                              <div className="text-sm text-gray-600">
                                {item.utterances.length} speaker(s)
                              </div>
                            )}
                            {item.lyrics && (
                              <div className="text-sm text-blue-600">
                                Lyrics Generated
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioLyricsGenerator;