import { Booking } from '../models';

export const bookings: Booking[] = [
  {
    id: 'b1',
    itemId: 'i1',
    itemTitle: 'Akumulatorski vrtalnik',
    fromDate: '2026-01-10',
    toDate: '2026-01-12',
    status: 'Pending',
    role: 'renter',
  },
  {
    id: 'b2',
    itemId: 'i2',
    itemTitle: 'Nogometna žoga',
    fromDate: '2025-12-20',
    toDate: '2025-12-22',
    status: 'Completed',
    role: 'owner',
  },
];

export default bookings;
