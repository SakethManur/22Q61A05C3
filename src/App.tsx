import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Typography, Box, Select, MenuItem, FormControl, CircularProgress, Alert, Paper, Chip, Avatar, InputBase, alpha, Stack, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Button, useTheme, Modal, Fade as MuiFade, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SearchIcon from '@mui/icons-material/Search';
import type { StockData } from './types/stock';
import { stockApi } from './services/stockApi';
import { StockChart } from './components/StockChart';
import Grid from '@mui/material/Grid';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';

const companyNames: Record<string, string> = {
  AMD: 'Advanced Micro Devices, Inc.',
  GOOGL: 'Alphabet Inc. Class A',
  GOOG: 'Alphabet Inc. Class C',
  AMZN: 'Amazon.com, Inc.',
  AMGN: 'Amgen Inc.',
  AAPL: 'Apple Inc.',
  BRKB: 'Berkshire Hathaway Inc.',
  BKNG: 'Booking Holdings Inc.',
  AVGO: 'Broadcom Inc.',
  CSX: 'CSX Corporation',
  LLY: 'Eli Lilly and Company',
  MAR: 'Marriott International, Inc.',
  MRVL: 'Marvell Technology, Inc.',
  META: 'Meta Platforms, Inc.',
  MSFT: 'Microsoft Corporation',
  NVDA: 'Nvidia Corporation',
  PYPL: 'PayPal Holdings, Inc.',
  '2330TW': 'TSMC',
  TSLA: 'Tesla, Inc.',
  V: 'Visa Inc.'
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C70E4',
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#040406',
      secondary: '#ABA2B2',
    },
    success: { main: '#4caf50' },
    error: { main: '#e57373' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h4: { fontWeight: 700 },
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>('AAPL');
  const [search, setSearch] = useState('');
  const muiTheme = useTheme();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await stockApi.getStocks();
        if (Array.isArray(data) && data.length > 0) {
          setStockData(data);
          setError(null);
        } else {
          setError('No stock data available');
        }
      } catch (error) {
        setError('Error fetching stock data');
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Organize data by symbol for chart and watchlist
  const stocksBySymbol: { [symbol: string]: StockData[] } = {};
  stockData.forEach(data => {
    if (!stocksBySymbol[data.symbol]) {
      stocksBySymbol[data.symbol] = [];
    }
    stocksBySymbol[data.symbol].push(data);
  });

  // Compute latest data point for each symbol
  const latestStockData = Object.values(
    stockData.reduce((acc, curr) => {
      if (!acc[curr.symbol] || new Date(curr.timestamp) > new Date(acc[curr.symbol].timestamp)) {
        acc[curr.symbol] = curr;
      }
      return acc;
    }, {} as Record<string, StockData>)
  );

  // Filter stocks by search
  const filteredStockData = latestStockData.filter(stock =>
    stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
    (companyNames[stock.symbol] || '').toLowerCase().includes(search.toLowerCase())
  );

  // Get selected stock data for chart
  const selectedStockSeries = showAll ? stockData : (selectedSymbol ? stockData.filter(s => s.symbol === selectedSymbol) : stockData);
  const selectedStock = latestStockData.find(s => s.symbol === selectedSymbol);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#fff', pb: 4 }}>
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 3, mb: 2, borderRadius: 3, boxShadow: 3, background: '#fff' }}>
                {/* Header: Symbol, Price, Change */}
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: '#7C70E4', color: '#fff', width: 48, height: 48, fontWeight: 700, fontSize: 24 }}>{selectedSymbol && !showAll ? selectedSymbol[0] : 'Σ'}</Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{showAll ? 'All Stocks' : selectedSymbol}</Typography>
                    <Typography variant="body2" color="text.secondary">{showAll ? 'All companies' : (companyNames[selectedSymbol || ''] || selectedSymbol)}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  {!showAll && selectedStock && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#040406' }}>{selectedStock.price.toFixed(2)}</Typography>
                      <Chip
                        icon={selectedStock.change > 0 ? <TrendingUpIcon sx={{ color: muiTheme.palette.success.main }} /> : selectedStock.change < 0 ? <TrendingDownIcon sx={{ color: muiTheme.palette.error.main }} /> : undefined}
                        label={`${selectedStock.change > 0 ? '+' : ''}${selectedStock.change.toFixed(2)}`}
                        color={selectedStock.change > 0 ? 'success' : selectedStock.change < 0 ? 'error' : 'default'}
                        sx={{ fontWeight: 'bold', fontSize: 18, height: 36, px: 2 }}
                      />
                    </Stack>
                  )}
                </Stack>
                {/* Controls: Timeframe, Search, Heatmap Button, Show All Toggle */}
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedTimeFrame}
                      onChange={e => setSelectedTimeFrame(Number(e.target.value))}
                    >
                      <MenuItem value={1}>1m</MenuItem>
                      <MenuItem value={5}>5m</MenuItem>
                      <MenuItem value={15}>15m</MenuItem>
                      <MenuItem value={30}>30m</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ position: 'relative', borderRadius: 2, background: alpha('#7C70E4', 0.08), width: 240 }}>
                    <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 2 }}>
                      <SearchIcon color="primary" />
                    </Box>
                    <InputBase
                      placeholder="Search stocks..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      sx={{ pl: 6, width: '100%', fontSize: 16, fontWeight: 500, color: '#040406', height: 40 }}
                      inputProps={{ 'aria-label': 'search stocks' }}
                    />
                  </Box>
                  <Button variant="contained" color="primary" sx={{ ml: 2, fontWeight: 700 }} onClick={() => setShowHeatmap(true)}>
                    Correlation Heatmap
                  </Button>
                  <ToggleButtonGroup
                    value={showAll ? 'all' : 'single'}
                    exclusive
                    onChange={(_, val) => {
                      if (val === 'all') { setShowAll(true); setSelectedSymbol(null); }
                      if (val === 'single') { setShowAll(false); }
                    }}
                    sx={{ ml: 2 }}
                  >
                    <ToggleButton value="all" selected={showAll} sx={{ fontWeight: 700 }}>Show All</ToggleButton>
                    <ToggleButton value="single" selected={!showAll} sx={{ fontWeight: 700 }}>Single</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                {/* Chart */}
                <Box sx={{ width: '100%', height: 420 }}>
                  <StockChart
                    data={selectedStockSeries}
                    selectedTimeFrame={selectedTimeFrame}
                    showAll={showAll}
                  />
                </Box>
              </Paper>
              {/* Heatmap Modal */}
              <Modal open={showHeatmap} onClose={() => setShowHeatmap(false)} closeAfterTransition>
                <MuiFade in={showHeatmap}>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', boxShadow: 24, p: 4, borderRadius: 3, minWidth: 320, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
                    <CorrelationHeatmap
                      data={showAll ? stocksBySymbol : (selectedSymbol ? { [selectedSymbol]: stocksBySymbol[selectedSymbol] } : stocksBySymbol)}
                      timeFrame={selectedTimeFrame}
                    />
                    <Button onClick={() => setShowHeatmap(false)} sx={{ mt: 2 }} fullWidth variant="outlined">Close</Button>
                  </Box>
                </MuiFade>
              </Modal>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3, background: '#fafafa', minHeight: 500 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Watchlist</Typography>
                <List dense>
                  {filteredStockData.map(stock => (
                    <ListItemButton
                      key={stock.symbol}
                      selected={selectedSymbol === stock.symbol && !showAll}
                      onClick={() => { setSelectedSymbol(stock.symbol); setShowAll(false); }}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        background: selectedSymbol === stock.symbol && !showAll ? alpha('#7C70E4', 0.12) : 'transparent',
                        '&:hover': { background: alpha('#7C70E4', 0.18) },
                        transition: 'background 0.2s',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#7C70E4', color: '#fff', fontWeight: 700 }}>{stock.symbol[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700 }}>{stock.symbol}</Typography>}
                        secondary={companyNames[stock.symbol] || stock.symbol}
                      />
                      <Box textAlign="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: stock.change > 0 ? muiTheme.palette.success.main : stock.change < 0 ? muiTheme.palette.error.main : '#040406' }}>
                          {stock.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: stock.change > 0 ? muiTheme.palette.success.main : stock.change < 0 ? muiTheme.palette.error.main : '#040406' }}>
                          {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
