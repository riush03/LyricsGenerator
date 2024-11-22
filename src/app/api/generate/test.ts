import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: 'f16887be5126430283747da67aeb6c0b'
})

// You can use a local filepath:
// const audioFile = "./example.mp3"

// Or use a publicly-accessible URL:
const audioFile =
  'https://assembly.ai/sports_injuries.mp3'

const run = async () => {
  const transcript = await client.transcripts.transcribe({ audio: audioFile })

  const prompt = 'Provide a brief summary of the transcript.'

  const { response } = await client.lemur.task({
    transcript_ids: [transcript.id],
    prompt,
    final_model: 'anthropic/claude-3-5-sonnet'
  })

  console.log(response)
}

run()