import { Event } from './types';

export const EVENTS: Event[] = [
  // COMPULSORY
  { id: 'gate-pass', name: 'Gate Pass (Compulsory for Entry & Participation)', day: 0, isSoloOnly: true, soloFee: 100 },

  // DAY 1 (02-Apr-26)
  { id: 'rangoli', name: 'Rangoli', day: 1, isTeamOnly: true, teamFee: 250, minTeamSize: 5, maxTeamSize: 5 },
  { id: 'how-far', name: 'How Far You Can Go', day: 1, isTeamOnly: true, teamFee: 250, minTeamSize: 5, maxTeamSize: 5 },
  { id: 'tug-of-war', name: 'Tug of War', day: 1, isTeamOnly: true, teamFee: 350, minTeamSize: 5, maxTeamSize: 5 },
  { id: 'treasure-hunt', name: 'Treasure Hunt', day: 1, isTeamOnly: true, teamFee: 250, minTeamSize: 5, maxTeamSize: 5 },
  { id: 'slow-bike', name: 'Slow Bike Race', day: 1, isSoloOnly: true, soloFee: 100 },
  { id: 'bridge-making', name: 'Bridge Making', day: 1, isSoloOnly: true, soloFee: 70 },
  { id: 'touch-guess', name: 'Touch & Guess Smell and Tell', day: 1, isSoloOnly: true, soloFee: 50 },
  { id: 'code-rush', name: 'Code Rush', day: 1, isSoloOnly: true, soloFee: 100 },
  { 
    id: 'robo-event', 
    name: 'Robo Event', 
    day: 1, 
    isTeamOnly: true, 
    teamFee: 150,
    minTeamSize: 3,
    maxTeamSize: 3,
    subEvents: [
      { id: 'robo-race', name: 'Robo Race' },
      { id: 'robo-war', name: 'Robo War' }
    ]
  },
  
  // DAY 2 (03-Apr-26)
  { id: 'box-cricket', name: 'Box Cricket', day: 2, isTeamOnly: true, teamFee: 350, minTeamSize: 5, maxTeamSize: 5 },
  { 
    id: 'artistic-league', 
    name: 'Artistic League', 
    day: 2, 
    isBoth: true, 
    soloFee: 100, 
    teamFee: 150,
    subEvents: [
      { id: 'wall-painting', name: 'Wall Painting', isTeamOnly: true, minTeamSize: 3, maxTeamSize: 3 },
      { id: 'face-painting', name: 'Face Painting', isSoloOnly: true }
    ]
  },
  { id: 'tech-quiz', name: 'Tech Quiz', day: 2, isTeamOnly: true, teamFee: 200, minTeamSize: 4, maxTeamSize: 4 },
  { id: 'cooking', name: 'No Fire Cooking Competition', day: 2, isTeamOnly: true, teamFee: 50, perMemberFee: true, minTeamSize: 1, maxTeamSize: 3 },
  { 
    id: 'online-gaming', 
    name: 'Online Gaming', 
    day: 2, 
    isSoloOnly: true, 
    soloFee: 100,
    subEvents: [
      { id: 'bgmi', name: 'BGMI' },
      { id: 'free-fire', name: 'Free Fire' },
      { id: 'ludo', name: 'Online Ludo' }
    ]
  },
  { id: 'dancing', name: 'Dancing', day: 2, isBoth: true, soloFee: 100, teamFee: 70, perMemberFee: true, minTeamSize: 3 },
  { id: 'singing', name: 'Singing', day: 2, isBoth: true, soloFee: 100, teamFee: 70, perMemberFee: true, maxTeamSize: 3 },
  { id: 'poetry', name: 'Poetry', day: 2, isSoloOnly: true, soloFee: 100 },
  { id: 'scene-it', name: 'Scene It Own It', day: 2, isTeamOnly: true, teamFee: 200, minTeamSize: 5, maxTeamSize: 5 },
  
  // DAY 3 (04-Apr-26)
  { id: 'short-film', name: 'Short Film Making', day: 3, isTeamOnly: true, teamFee: 150 },
  { id: 'music-picker', name: 'Music Item Picker', day: 3, isTeamOnly: true, teamFee: 350, minTeamSize: 5, maxTeamSize: 5 },
  { id: 'fashion-show', name: 'Fashion Show', day: 3, isSoloOnly: true, soloFee: 100 },
];
