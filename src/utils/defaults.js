import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_GOAL = 1000;

export const DEFAULT_ACTIVITIES = [
  {
    id: uuidv4(),
    name: 'Juggles',
    touchesPerRep: 2,
    notes: 'Alternating feet',
    color: '#818cf8',
  },
  {
    id: uuidv4(),
    name: 'Wall Passes',
    touchesPerRep: 1,
    notes: 'Inside of foot, both sides',
    color: '#34d399',
  },
  {
    id: uuidv4(),
    name: 'Toe Taps',
    touchesPerRep: 2,
    notes: 'On top of ball',
    color: '#f472b6',
  },
  {
    id: uuidv4(),
    name: 'Dribbling (Cones)',
    touchesPerRep: 4,
    notes: 'Per cone run',
    color: '#fb923c',
  },
  {
    id: uuidv4(),
    name: 'Passing (Partner)',
    touchesPerRep: 1,
    notes: 'Each pass = 1 touch',
    color: '#38bdf8',
  },
  {
    id: uuidv4(),
    name: 'Shooting',
    touchesPerRep: 1,
    notes: 'Each shot on goal',
    color: '#facc15',
  },
];
