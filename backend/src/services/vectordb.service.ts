import { ChromaClient } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'outreach_context';

class VectorDBService {
  private static instance: VectorDBService;
  private client: ChromaClient;
  private collection: any;

  private constructor() {
    this.client = new ChromaClient({ path: process.env.CHROMA_URL });
  }
  public static getInstance(): VectorDBService {
    if (!VectorDBService.instance) {
      VectorDBService.instance = new VectorDBService();
    }
    return VectorDBService.instance;
  }
  
  public async initialize(): Promise<void> {
    try {
      // wth the package installed, we no longer need the workaround.
      // library will handle the default embedding function correctly.
      this.collection = await this.client.getOrCreateCollection({ name: COLLECTION_NAME });
      console.log(`vector DB collection "${COLLECTION_NAME}" is ready.`);
    } catch (error) {
       console.error('could not connect to Vector DB. Please ensure the ChromaDB container is running correctly and the API versions match.');
       throw error;
    }
  }

  public async addContext(text: string, embedding: number[]): Promise<void> {
    if (!this.collection) await this.initialize();
    
    await this.collection.add({
      ids: [uuidv4()],
      embeddings: [embedding],
      documents: [text],
    });
    console.log(`Added new context to Vector DB.`);
  }

  public async queryContext(embedding: number[], numResults = 1): Promise<string[]> {
    if (!this.collection) await this.initialize();

    const results = await this.collection.query({
      nResults: numResults,
      queryEmbeddings: [embedding],
    });
    
    if (results && results.documents && results.documents.length > 0) {
      return results.documents[0] as string[];
    }
    return [];
  }
}

export default VectorDBService;