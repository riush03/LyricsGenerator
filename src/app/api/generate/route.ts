import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API!
});

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
        return NextResponse.json({ message: "Audio file is required." }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const transcript = await client.transcripts.transcribe({
            audio: buffer,
            speaker_labels: true,
        });

        const lemurResponse = await client.lemur.task({
            transcript_ids: [transcript.id],
            prompt: `Perform a comprehensive multi-part analysis of this audio transcript: 
            1. Sentiment Analysis: Identify the emotional tone of the audio 
            2. Genre Identification: Determine the music genre 
            3. Collaboration Check: Assess if multiple artists are involved 
            4. Creative Lyrics Generation: Write an original set of lyrics inspired by the audio's essence and emotional context

            Provide detailed, creative responses for each subtask.`,
            final_model: 'anthropic/claude-3-5-sonnet'
        });

        const analysis = lemurResponse.response.split('\n').reduce((acc: any, line) => {
            const [key, value] = line.split(':').map(s => s.trim());
            switch(key) {
                case '1. Sentiment Analysis':
                    acc.sentiment = value;
                    break;
                case '2. Genre Identification':
                    acc.genre = value;
                    break;
                case '3. Collaboration Check':
                    acc.collaboration = value;
                    break;
                case '4. Creative Lyrics Generation':
                    acc.lyrics = line.replace('4. Creative Lyrics Generation:', '').trim();
                    break;
            }
            return acc;
        }, {});

        const response = {
            transcription: {
                text: transcript.text,
                utterances: transcript.utterances?.map((utterance) => ({
                    speaker: utterance.speaker,
                    text: utterance.text,
                }))
            },
            analysis: analysis
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
        console.error("Error processing audio:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}