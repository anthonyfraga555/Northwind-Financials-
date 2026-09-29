import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function App() {
  const { data = [] } = useQuery(['revenue'], () =>
    axios.get('/api/revenue/daily').then((r) => r.data)
  );

  return (
    <main>
      <h1>Merchant revenue</h1>
      <p>Updated {format(new Date(), 'PPpp')}</p>
      <LineChart width={720} height={320} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" />
      </LineChart>
    </main>
  );
}
