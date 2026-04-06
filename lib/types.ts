export interface QuoteRecord {
  id: string;
  text: string;
  speaker: string;
  imageDataUrl: string | null;
  createdAt: number;
  updatedAt?: number;
}
