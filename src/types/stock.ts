export interface StockData {
    symbol: string;
    price: number;
    change: number; // Price change
    timestamp: string;
}

export interface CorrelationData {
    stock1: string;
    stock2: string;
    correlation: number;
}
