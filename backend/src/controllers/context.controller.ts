import { Request, Response } from 'express';
import VectorDBService from '../services/vectordb.service';
import AIService from '../services/ai.service';

export const addContextController=async(req:Request, res:Response)=>{
  try {
    const {context}=req.body;
    if (!context || typeof context!=='string'){
      return res.status(400).json({ message: 'Invalid "context" field in request bod.'});
    }
    const aiService = AIService.getInstance();
    const vectorDBService = VectorDBService.getInstance();
    // create embedding from the context text
    const embedding = await aiService.createEmbedding(context);
    // add the original text and its embedding to the vector DB
    await vectorDBService.addContext(context, embedding);

    res.status(200).json({ message:'Context added successfully'});
  }catch (error){
    console.error('Error in addContextController:',error);
    res.status(500).json({ message: 'Failed to add context'});
  }
};