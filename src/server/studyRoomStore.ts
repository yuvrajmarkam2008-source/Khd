import { WebSocket } from 'ws';
import { StudyRoom, TopicStat, RoomActivity, SubjectId } from '../types';

interface ConnectedPeer {
  socket: WebSocket;
  roomCode: string;
  pseudonym: string;
  avatar: string;
}

// In-memory server-authoritative store
const rooms = new Map<string, StudyRoom>();
const peersByRoom = new Map<string, Set<ConnectedPeer>>();
const peerBySocket = new Map<WebSocket, ConnectedPeer>();

// Pre-seed active community rooms
function initializeDefaultRooms() {
  const defaultRooms: StudyRoom[] = [
    {
      code: 'BOARD-2026',
      name: 'Class 12 Boards Master Sprint',
      subject: 'all',
      createdByPseudonym: 'Kumhud Scholar',
      createdAt: Date.now() - 3600 * 1000 * 24,
      participantsCount: 8,
      topicsStats: [
        { topic: 'Integration by Parts & Substitution', count: 38, subject: 'maths', lastAskedAt: Date.now() - 120000 },
        { topic: 'Electromagnetic Induction & Faraday Laws', count: 29, subject: 'physics', lastAskedAt: Date.now() - 350000 },
        { topic: 'Organic Chemistry SN1 vs SN2 Mechanisms', count: 24, subject: 'chemistry', lastAskedAt: Date.now() - 500000 },
        { topic: 'Quadratic Equations & Complex Roots', count: 21, subject: 'maths', lastAskedAt: Date.now() - 800000 },
        { topic: 'Mendelian Genetics & Dihybrid Crosses', count: 18, subject: 'biology', lastAskedAt: Date.now() - 1200000 },
        { topic: 'Recursion & Binary Search Trees', count: 14, subject: 'computerscience', lastAskedAt: Date.now() - 1800000 },
      ],
      recentActivities: [
        {
          id: 'act_1',
          type: 'question',
          text: 'A peer asked a doubt about Integration by Parts',
          subject: 'maths',
          avatar: '📐',
          timestamp: Date.now() - 120000,
        },
        {
          id: 'act_2',
          type: 'reaction',
          text: 'Someone cheered the room with ⚡ Study Focus!',
          avatar: '⚡',
          timestamp: Date.now() - 240000,
        },
        {
          id: 'act_3',
          type: 'question',
          text: 'A peer asked a doubt about Faraday Laws',
          subject: 'physics',
          avatar: '⚡',
          timestamp: Date.now() - 350000,
        },
        {
          id: 'act_4',
          type: 'streak',
          text: 'Room reached a collective 25-minute study focus sprint! 🔥',
          avatar: '🔥',
          timestamp: Date.now() - 600000,
        },
      ],
      activeSprintSecondsRemaining: 740,
    },
    {
      code: 'JEE-MATHS',
      name: 'JEE & Board Mathematics Hub',
      subject: 'maths',
      createdByPseudonym: 'Calculus Falcon',
      createdAt: Date.now() - 3600 * 1000 * 12,
      participantsCount: 5,
      topicsStats: [
        { topic: 'Definite Integrals & Kings Property', count: 42, subject: 'maths', lastAskedAt: Date.now() - 180000 },
        { topic: 'Matrices & Cramers Rule', count: 31, subject: 'maths', lastAskedAt: Date.now() - 400000 },
        { topic: 'Differential Equations Order & Degree', count: 25, subject: 'maths', lastAskedAt: Date.now() - 700000 },
        { topic: 'Vectors & 3D Geometry Planes', count: 19, subject: 'maths', lastAskedAt: Date.now() - 1100000 },
      ],
      recentActivities: [
        {
          id: 'act_m1',
          type: 'question',
          text: 'A peer asked a doubt about Kings Property in Definite Integrals',
          subject: 'maths',
          avatar: '📐',
          timestamp: Date.now() - 180000,
        },
        {
          id: 'act_m2',
          type: 'join',
          text: 'Cosmic Euler joined the lobby',
          avatar: '🚀',
          timestamp: Date.now() - 900000,
        },
      ],
      activeSprintSecondsRemaining: 1120,
    },
    {
      code: 'SCIENCE-LAB',
      name: 'Physics & Chemistry Collective',
      subject: 'physics',
      createdByPseudonym: 'Curious Phoenix',
      createdAt: Date.now() - 3600 * 1000 * 8,
      participantsCount: 4,
      topicsStats: [
        { topic: 'Ray Optics & Lens Makers Formula', count: 26, subject: 'physics', lastAskedAt: Date.now() - 220000 },
        { topic: 'Thermodynamics & Gibbs Free Energy', count: 22, subject: 'chemistry', lastAskedAt: Date.now() - 450000 },
        { topic: 'Current Electricity & Kirchhoff Rules', count: 19, subject: 'physics', lastAskedAt: Date.now() - 850000 },
      ],
      recentActivities: [
        {
          id: 'act_p1',
          type: 'question',
          text: 'A peer asked a doubt about Lens Makers Formula',
          subject: 'physics',
          avatar: '⚛️',
          timestamp: Date.now() - 220000,
        },
      ],
      activeSprintSecondsRemaining: 480,
    },
  ];

  for (const r of defaultRooms) {
    rooms.set(r.code, r);
    peersByRoom.set(r.code, new Set());
  }
}

initializeDefaultRooms();

// Broadcast event to all connected peers in a room
export function broadcastToRoom(roomCode: string, payload: any) {
  const peers = peersByRoom.get(roomCode);
  if (!peers) return;

  const dataStr = JSON.stringify(payload);
  peers.forEach((peer) => {
    if (peer.socket.readyState === WebSocket.OPEN) {
      try {
        peer.socket.send(dataStr);
      } catch (err) {
        console.error('Error broadcasting to peer:', err);
      }
    }
  });
}

// Get all rooms overview
export function getAllRooms(): StudyRoom[] {
  return Array.from(rooms.values()).map((r) => {
    const peers = peersByRoom.get(r.code);
    return {
      ...r,
      participantsCount: Math.max(r.participantsCount, peers ? peers.size : 0),
    };
  });
}

// Get specific room
export function getRoom(code: string): StudyRoom | undefined {
  const r = rooms.get(code.toUpperCase());
  if (!r) return undefined;
  const peers = peersByRoom.get(r.code);
  return {
    ...r,
    participantsCount: Math.max(r.participantsCount, peers ? peers.size : 0),
  };
}

// Create new room
export function createRoom(name: string, subject: SubjectId | 'all', createdByPseudonym: string): StudyRoom {
  const code = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
  const newRoom: StudyRoom = {
    code,
    name: name.trim() || 'Collaborative Study Room',
    subject,
    createdByPseudonym: createdByPseudonym || 'Study Pioneer',
    createdAt: Date.now(),
    participantsCount: 1,
    topicsStats: [],
    recentActivities: [
      {
        id: `act_${Date.now()}`,
        type: 'join',
        text: `${createdByPseudonym} created the study room`,
        avatar: '🎉',
        timestamp: Date.now(),
      },
    ],
    activeSprintSecondsRemaining: 1500, // 25 min default sprint
  };

  rooms.set(code, newRoom);
  peersByRoom.set(code, new Set());
  return newRoom;
}

// Record anonymous topic ask in room
export function recordTopicInRoom(roomCode: string, topic: string, subject: SubjectId): StudyRoom | undefined {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return undefined;

  const cleanTopic = topic.trim();
  if (!cleanTopic) return room;

  // Find existing topic or insert
  const existing = room.topicsStats.find(
    (t) => t.topic.toLowerCase() === cleanTopic.toLowerCase()
  );

  if (existing) {
    existing.count += 1;
    existing.lastAskedAt = Date.now();
  } else {
    room.topicsStats.unshift({
      topic: cleanTopic,
      count: 1,
      subject,
      lastAskedAt: Date.now(),
    });
  }

  // Sort by count descending
  room.topicsStats.sort((a, b) => b.count - a.count);

  // Add activity log
  const newAct: RoomActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'question',
    text: `A student asked a doubt about "${cleanTopic.slice(0, 60)}"`,
    subject,
    avatar: '❓',
    timestamp: Date.now(),
  };

  room.recentActivities.unshift(newAct);
  if (room.recentActivities.length > 25) {
    room.recentActivities = room.recentActivities.slice(0, 25);
  }

  broadcastToRoom(room.code, {
    type: 'room_update',
    room: getRoom(room.code),
    newActivity: newAct,
  });

  return room;
}

// Add peer reaction
export function recordReactionInRoom(roomCode: string, emoji: string, pseudonym?: string): StudyRoom | undefined {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return undefined;

  const newAct: RoomActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'reaction',
    text: `${pseudonym || 'A peer'} shared encouragement ${emoji}`,
    avatar: emoji,
    timestamp: Date.now(),
  };

  room.recentActivities.unshift(newAct);
  if (room.recentActivities.length > 25) {
    room.recentActivities = room.recentActivities.slice(0, 25);
  }

  broadcastToRoom(room.code, {
    type: 'new_reaction',
    emoji,
    pseudonym: pseudonym || 'Peer',
    newActivity: newAct,
    room: getRoom(room.code),
  });

  return room;
}

// WebSocket connection lifecycle
export function handlePeerJoin(
  socket: WebSocket,
  roomCode: string,
  pseudonym: string,
  avatar: string,
  subject: SubjectId
) {
  const code = roomCode.toUpperCase();
  let room = rooms.get(code);

  if (!room) {
    // If room doesn't exist, create it with this code
    room = {
      code,
      name: `Study Hub ${code}`,
      subject: 'all',
      createdByPseudonym: pseudonym,
      createdAt: Date.now(),
      participantsCount: 1,
      topicsStats: [],
      recentActivities: [],
      activeSprintSecondsRemaining: 1500,
    };
    rooms.set(code, room);
    peersByRoom.set(code, new Set());
  }

  const peer: ConnectedPeer = {
    socket,
    roomCode: code,
    pseudonym,
    avatar,
  };

  let roomPeers = peersByRoom.get(code);
  if (!roomPeers) {
    roomPeers = new Set();
    peersByRoom.set(code, roomPeers);
  }

  roomPeers.add(peer);
  peerBySocket.set(socket, peer);

  room.participantsCount = roomPeers.size;

  const joinAct: RoomActivity = {
    id: `act_${Date.now()}`,
    type: 'join',
    text: `${avatar} ${pseudonym} joined the study room`,
    avatar,
    timestamp: Date.now(),
  };

  room.recentActivities.unshift(joinAct);
  if (room.recentActivities.length > 25) {
    room.recentActivities = room.recentActivities.slice(0, 25);
  }

  // Send initial state to the joined peer
  socket.send(
    JSON.stringify({
      type: 'joined_success',
      room: getRoom(code),
    })
  );

  // Broadcast to other peers in room
  broadcastToRoom(code, {
    type: 'peer_joined',
    pseudonym,
    avatar,
    room: getRoom(code),
    newActivity: joinAct,
  });
}

export function handlePeerLeave(socket: WebSocket) {
  const peer = peerBySocket.get(socket);
  if (!peer) return;

  peerBySocket.delete(socket);
  const roomPeers = peersByRoom.get(peer.roomCode);
  if (roomPeers) {
    roomPeers.delete(peer);
  }

  const room = rooms.get(peer.roomCode);
  if (room && roomPeers) {
    room.participantsCount = Math.max(1, roomPeers.size);
    broadcastToRoom(peer.roomCode, {
      type: 'peer_left',
      pseudonym: peer.pseudonym,
      room: getRoom(peer.roomCode),
    });
  }
}
