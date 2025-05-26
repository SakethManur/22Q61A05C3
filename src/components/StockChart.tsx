import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import type { StockData } from '../types/stock';

interface StockChartProps {
    data: StockData[];
    selectedTimeFrame: number;
    showAll?: boolean;
}

export const StockChart = ({ data, selectedTimeFrame, showAll }: StockChartProps) => {
    const [chartData, setChartData] = useState<StockData[]>([]);

    useEffect(() => {
        // Filter data based on selected time frame
        const now = new Date();
        const threshold = new Date(now.getTime() - selectedTimeFrame * 60 * 1000);
        const filteredData = data.filter(item => new Date(item.timestamp) >= threshold);
        setChartData(filteredData);
    }, [data, selectedTimeFrame]);

    // If showAll, group by symbol and align timestamps
    let multiLineData: any[] = [];
    if (showAll && chartData.length > 0) {
        // Get all unique timestamps
        const timestamps = Array.from(new Set(chartData.map(d => d.timestamp))).sort();
        const symbols = Array.from(new Set(chartData.map(d => d.symbol)));
        multiLineData = timestamps.map(ts => {
            const entry: any = { timestamp: ts };
            symbols.forEach(symbol => {
                const found = chartData.find(d => d.symbol === symbol && d.timestamp === ts);
                entry[symbol] = found ? found.price : null;
            });
            return entry;
        });
    }

    return (
        <Paper elevation={3} sx={{ p: 2, my: 2, width: '100%', height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Stock Price Chart
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
                {showAll ? (
                    multiLineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={multiLineData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                    minTickGap={20}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {Object.keys(multiLineData[0] || {}).filter(k => k !== 'timestamp').map((symbol, idx) => (
                                    <Line
                                        key={symbol}
                                        type="monotone"
                                        dataKey={symbol}
                                        stroke={['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0', '#FF6F91', '#6A4C93'][idx % 10]}
                                        dot={false}
                                        name={symbol}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8 }}>
                            No data available for the selected time frame.
                        </Typography>
                    )
                ) : (
                    chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                    minTickGap={20}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(label) => new Date(label).toLocaleString()}
                                    formatter={(
                                        value: number,
                                        name: string
                                    ) => {
                                        if (name === 'price') {
                                            return [`$${value.toFixed(2)}`, 'Price'];
                                        } else if (name === 'change') {
                                            return [`${value > 0 ? '+' : ''}${value.toFixed(2)}`, 'Change'];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="change"
                                    stroke="#82ca9d"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8 }}>
                            No data available for the selected time frame.
                        </Typography>
                    )
                )}
            </Box>
        </Paper>
    );
};
