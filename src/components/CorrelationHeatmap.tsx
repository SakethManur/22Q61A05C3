import { useMemo } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import type { StockData } from '../types/stock';

interface CorrelationHeatmapProps {
    data: { [symbol: string]: StockData[] };
    timeFrame: number;
}

export const CorrelationHeatmap = ({ data, timeFrame }: CorrelationHeatmapProps) => {
    const correlationMatrix = useMemo(() => {
        const symbols = Object.keys(data);
        const matrix: { [key: string]: { [key: string]: number } } = {};

        // Calculate correlation for each pair of stocks
        symbols.forEach(symbol1 => {
            matrix[symbol1] = {};
            symbols.forEach(symbol2 => {
                if (symbol1 === symbol2) {
                    matrix[symbol1][symbol2] = 1; // Perfect correlation with self
                    return;
                }

                const now = new Date();
                const threshold = new Date(now.getTime() - timeFrame * 60 * 1000);

                const stock1Data = data[symbol1]
                    .filter(item => new Date(item.timestamp) >= threshold)
                    .map(item => item.price);
                const stock2Data = data[symbol2]
                    .filter(item => new Date(item.timestamp) >= threshold)
                    .map(item => item.price);

                // Calculate correlation coefficient
                const correlation = calculateCorrelation(stock1Data, stock2Data);
                matrix[symbol1][symbol2] = correlation;
            });
        });

        return matrix;
    }, [data, timeFrame]);

    const getColorForCorrelation = (value: number): string => {
        // Color gradient from red (negative correlation) to white (no correlation) to green (positive correlation)
        if (value > 0) {
            return `rgba(0, 255, 0, ${value})`;
        } else {
            return `rgba(255, 0, 0, ${Math.abs(value)})`;
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, my: 2 }}>
            <Typography variant="h6" gutterBottom>
                Correlation Heatmap
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.keys(correlationMatrix).map(symbol1 => (
                    <Box key={symbol1} sx={{ display: 'flex', gap: 1 }}>
                        {Object.keys(correlationMatrix[symbol1]).map(symbol2 => (
                            <Box
                                key={`${symbol1}-${symbol2}`}
                                sx={{
                                    width: 60,
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: getColorForCorrelation(correlationMatrix[symbol1][symbol2]),
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    fontSize: '0.75rem',
                                    color: 'black'
                                }}
                            >
                                {correlationMatrix[symbol1][symbol2].toFixed(2)}
                            </Box>
                        ))}
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

// Helper function to calculate correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;

    for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;
        numerator += xDiff * yDiff;
        xVariance += xDiff * xDiff;
        yVariance += yDiff * yDiff;
    }

    if (xVariance === 0 || yVariance === 0) return 0;
    return numerator / Math.sqrt(xVariance * yVariance);
}
