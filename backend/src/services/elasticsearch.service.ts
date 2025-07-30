import { Client } from '@elastic/elasticsearch';
import { Email, SearchOptions, SearchResult } from '../types/email.type';

const ELASTICSEARCH_INDEX = 'emails';
class ElasticsearchService {
  private static instance: ElasticsearchService;
  private client: Client;

  private constructor() {
    if (process.env.ELASTIC_CLOUD_ID && process.env.ELASTIC_API_KEY) {
      console.log("Connecting to Elastic Cloud...");
      this.client = new Client({
        cloud: {
          id: process.env.ELASTIC_CLOUD_ID,
        },
        auth: {
          apiKey: process.env.ELASTIC_API_KEY,
        },
      });
    } else {
      console.log("Connecting to local Elasticsearch instance...");
      this.client = new Client({
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      });
    }
  }
  public static getInstance(): ElasticsearchService {
    if (!ElasticsearchService.instance) {
      ElasticsearchService.instance = new ElasticsearchService();
    }
    return ElasticsearchService.instance;
  }

  public async createIndexIfNotExists(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: ELASTICSEARCH_INDEX });
    if (indexExists) {
      console.log(`Index "${ELASTICSEARCH_INDEX}" already exists.`);
      return;
    }
    console.log(`Creating index "${ELASTICSEARCH_INDEX}"...`);
    await this.client.indices.create({
      index: ELASTICSEARCH_INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            accountId: { type: 'keyword' },
            threadId: { type: 'keyword' },
            subject: { type: 'text' },
            from: { properties: { name: { type: 'text' }, email: { type: 'keyword' } } },
            to: { properties: { name: { type: 'text' }, email: { type: 'keyword' } } },
            date: { type: 'date' },
            body: { properties: { plain: { type: 'text' }, html: { type: 'text', index: false } } },
            classification: { type: 'keyword' },
          },
        },
      },
    });
    console.log(`Index "${ELASTICSEARCH_INDEX}" created.`);
  }

  public async indexEmail(email: Email): Promise<void> {
    await this.client.index({
      index: ELASTICSEARCH_INDEX,
      id: email.id,
      document: email,
      // this line forces Elasticsearch to make the document
      refresh: true,
    });
  }

  public async getEmailById(id: string): Promise<Email | null> {
    try {
      const response = await this.client.get({
        index: ELASTICSEARCH_INDEX,
        id: id,
      });
      return response._source as Email;
    } catch (error) {
      console.error(`Could not find email with ID: ${id}`, error);
      return null;
    }
  }

  public async getExistingEmailIds(accountId: string): Promise<Set<string>> {
    const ids = new Set<string>();
    try {
      const scrollSearch = this.client.helpers.scrollSearch({
        index: ELASTICSEARCH_INDEX,
        _source: false,
        q: `accountId.keyword:${accountId}`,
      });

      for await (const result of scrollSearch) {
        result.documents.forEach((doc: any) => {
          ids.add(doc._id);
        });
      }
    } catch (error) {
      if ((error as any).meta?.body?.error?.type !== 'index_not_found_exception') {
        console.error('Error fetching existing email IDs:', error);
      }
    }
    return ids;
  }

  public async searchEmails(options: SearchOptions): Promise<SearchResult> {
    const { search, accountId, classification, page = 1, limit = 20 } = options;
    const from = (page - 1) * limit;

    const boolQuery: any = { must: [], filter: [] };

    if (search) {
      boolQuery.must.push({
        multi_match: { query: search, fields: ['subject','body.plain'], fuzziness: 'AUTO' },
      });
    }
    if (accountId) {
      boolQuery.filter.push({ term: { 'accountId.keyword': accountId } });
    }
    if (classification) {
      boolQuery.filter.push({ term: { 'classification.keyword': classification } });
    }

    if (boolQuery.must.length === 0) {
      boolQuery.must.push({ match_all: {} });
    }

    const response = await this.client.search({
      index: ELASTICSEARCH_INDEX,
      from: from,
      size: limit,
      sort: [{ date: 'desc' }],
      body: {
        query: {
          bool: boolQuery,
        },
      },
    });
    const emails = response.hits.hits.map((hit: any) => hit._source);
    const total = (response.hits.total as any).value;

    return { total, emails };
  }
  public async getDocCount(): Promise<number> {
    try {
      const response = await this.client.count({
        index: ELASTICSEARCH_INDEX
      });
      return response.count;
    } catch (error) {
      if ((error as any).meta?.body?.error?.type === 'index_not_found_exception') {
        return 0;
      }
      console.error('Error getting document count:', error);
      return 0;
    }
  }
}

export default ElasticsearchService;