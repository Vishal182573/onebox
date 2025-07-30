import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import ElasticsearchService from './services/elasticsearch.service';
import cors from 'cors';
import SyncService from './services/sync.service';
import emailRouter from './routes/email.routes'; 
import contextRouter from './routes/context.routes';
import VectorDBService from './services/vectordb.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api', emailRouter); 
app.use('/api', contextRouter);

// simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server is running!');
});



// self invoking async function to initialize services
(async () => {
  try {
    // initialize elasticsearch
    const esService = ElasticsearchService.getInstance();
    await esService.createIndexIfNotExists();
    
    // initialize vectorDB
    const vectorDBService = VectorDBService.getInstance();
    await vectorDBService.initialize(); 

    // initialize the main sync service
    const syncService = new SyncService();

    // for the assignment, running it on every startup is okay to ensure data exists.
    await syncService.runInitialSync();

    // after the initial sync, start the real-time listeners
    syncService.startAllListeners();

    // start the Express server for API endpoints
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
})();