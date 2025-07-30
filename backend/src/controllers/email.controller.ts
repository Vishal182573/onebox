import { Request, Response } from 'express';
import ElasticsearchService from '../services/elasticsearch.service';
import { SearchOptions } from '../types/email.type';
import VectorDBService from '../services/vectordb.service';
import AIService from '../services/ai.service';

export const searchEmailsController=async(req: Request, res:Response)=>{
  try {
    const esService = ElasticsearchService.getInstance();

    const options:SearchOptions={
      search: req.query.search as string | undefined,
      accountId: req.query.accountId as string | undefined,
      classification: req.query.classification as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10):1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10):20,
    };

    const result = await esService.searchEmails(options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in searchEmailsController:', error);
    res.status(500).json({ message: 'Failed to search emails.' });
  }
};

export const getCountController=async (req:Request, res:Response)=>{
  try {
    const esService = ElasticsearchService.getInstance();
    const count = await esService.getDocCount();
    res.status(200).json({ 
      message: 'Successfully connected to Elasticsearch.',
      index: 'emails',
      documentCount: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect to Elasticsearch or get count.' });
  }
};

export const suggestReplyController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    const esService = ElasticsearchService.getInstance();
    const aiService = AIService.getInstance();
    const vectorDBService = VectorDBService.getInstance();

    // fetch the original email
    const email = await esService.getEmailById(id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    // create an embedding from the email content
    const queryText = `Subject: ${email.subject}\nBody: ${email.body.plain}`;
    const queryEmbedding = await aiService.createEmbedding(queryText);

    // retrieve the most relevant context from the vector DB
    const contextResults = await vectorDBService.queryContext(queryEmbedding, 1);
    const context = contextResults.length > 0 ? contextResults[0] : 'No specific context found.';
    
    // generate the reply using the email and the retrieved context
    const suggestedReply = await aiService.suggestReply(email, context);

    res.status(200).json({ reply:suggestedReply});

  } catch (error) {
    console.error('Error in suggestReplyController:', error);
    res.status(500).json({ message: 'Failed to suggest a reply.' });
  }
};