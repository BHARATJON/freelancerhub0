const socketIo = require('socket.io');

const interviewRooms = new Map(); // Map to store interviewId -> { companySocketId, freelancerSocketId }

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-interview', ({ interviewId, userRole }) => {
      socket.join(interviewId);
      console.log(`User ${socket.id} (${userRole}) joined interview room: ${interviewId}`);

      if (!interviewRooms.has(interviewId)) {
        interviewRooms.set(interviewId, {});
      }
      const room = interviewRooms.get(interviewId);

      if (userRole === 'company') {
        room.companySocketId = socket.id;
      } else if (userRole === 'freelancer') {
        room.freelancerSocketId = socket.id;
      }

      // Store the interviewId on the socket for easy lookup on disconnect
      socket.interviewId = interviewId;
      socket.userRole = userRole;

      // Notify the other participant if both are present
      if (room.companySocketId && room.freelancerSocketId) {
        io.to(room.companySocketId).emit('ready-to-call', { otherPeerId: room.freelancerSocketId });
        io.to(room.freelancerSocketId).emit('ready-to-call', { otherPeerId: room.companySocketId });
        console.log(`Both participants ready in room ${interviewId}`);
      } else {
        // Notify the other participant that someone joined
        const otherParticipantId = userRole === 'company' ? room.freelancerSocketId : room.companySocketId;
        if (otherParticipantId) {
          io.to(otherParticipantId).emit('participant-joined', { participantId: socket.id, userRole });
          console.log(`Notified ${otherParticipantId} that ${socket.id} joined.`);
        }
      }
    });

    socket.on('start-interview', (interviewId) => {
      io.to(interviewId).emit('interview-started');
      console.log(`Interview ${interviewId} started.`);
    });

    socket.on('interview-ended', (interviewId) => {
      io.to(interviewId).emit('interview-ended');
      console.log(`Interview ${interviewId} ended.`);
      // Clean up the room
      interviewRooms.delete(interviewId);
    });

    // WebRTC signaling
    socket.on('offer', ({ sdp, targetId }) => {
      console.log(`Offer from ${socket.id} to ${targetId}`);
      io.to(targetId).emit('offer', { sdp, senderId: socket.id });
    });

    socket.on('answer', ({ sdp, targetId }) => {
      console.log(`Answer from ${socket.id} to ${targetId}`);
      io.to(targetId).emit('answer', { sdp, senderId: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, targetId }) => {
      console.log(`ICE Candidate from ${socket.id} to ${targetId}`);
      io.to(targetId).emit('ice-candidate', { candidate, senderId: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const interviewId = socket.interviewId;
      const userRole = socket.userRole;

      if (interviewId && interviewRooms.has(interviewId)) {
        const room = interviewRooms.get(interviewId);
        let otherParticipantId = null;

        if (userRole === 'company' && room.companySocketId === socket.id) {
          delete room.companySocketId;
          otherParticipantId = room.freelancerSocketId;
        } else if (userRole === 'freelancer' && room.freelancerSocketId === socket.id) {
          delete room.freelancerSocketId;
          otherParticipantId = room.companySocketId;
        }

        if (otherParticipantId) {
          io.to(otherParticipantId).emit('participant-left', { participantId: socket.id, userRole });
          console.log(`Notified ${otherParticipantId} that ${socket.id} (${userRole}) left.`);
        }

        // If no one left in the room, clean it up
        if (!room.companySocketId && !room.freelancerSocketId) {
          interviewRooms.delete(interviewId);
          console.log(`Interview room ${interviewId} cleaned up.`);
        }
      }
    });
  });

  return io;
};

module.exports = initSocket;