import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useState, useEffect, useRef } from 'react';

const SIGNAL_SERVER = 'http://localhost:5000'; // adjust if needed
let socket;

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [error, setError] = useState('');
  const localVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef();
  const localStream = useRef();
  const otherPeerId = useRef(null);

  useEffect(() => {
    // 1. Connect socket
    socket = io(SIGNAL_SERVER);
    socket.emit('join-interview', { interviewId, userRole: user.role });

    socket.on('ready-to-call', ({ otherPeerId: peerId }) => {
      otherPeerId.current = peerId;
      console.log('Ready to call, other peer ID:', otherPeerId.current);
      // If company, initiate call immediately
      if (user.role === 'company') {
        startCall();
      }
    });

    socket.on('participant-joined', ({ participantId, userRole }) => {
      console.log(`${userRole} joined: ${participantId}`);
      setRemoteJoined(true);
    });

    socket.on('participant-left', ({ participantId, userRole }) => {
      console.log(`${userRole} left: ${participantId}`);
      setRemoteJoined(false);
      // Optionally, end the call if the other participant leaves
      endCall();
    });

    socket.on('interview-started', () => setStarted(true));
    socket.on('interview-ended', () => { setEnded(true); cleanup(); });

    // WebRTC signaling
    socket.on('offer', async ({ sdp, senderId }) => {
      console.log('Received offer from', senderId);
      otherPeerId.current = senderId;
      await ensureMedia();
      createPeerConnection();
      addLocalTracks();
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit('answer', { targetId: otherPeerId.current, sdp: answer });
      setStarted(true); // Mark as started when offer is received and answered
    });

    socket.on('answer', async ({ sdp, senderId }) => {
      console.log('Received answer from', senderId);
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on('ice-candidate', async ({ candidate, senderId }) => {
      console.log('Received ICE candidate from', senderId);
      if (candidate && pc.current) {
        try {
          await pc.current.addIceCandidate(candidate);
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      }
    });

    return cleanup;
    // eslint-disable-next-line
  }, [interviewId, user.role]);

  async function ensureMedia() {
    if (!localStream.current) {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo.current) localVideo.current.srcObject = localStream.current;
      } catch (e) {
        setError('Could not access camera/mic. Please ensure permissions are granted.');
        console.error('Error accessing media devices:', e);
      }
    }
  }

  function createPeerConnection() {
    if (pc.current) return;
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.current.onicecandidate = (e) => {
      if (e.candidate && otherPeerId.current) {
        console.log('Sending ICE candidate to', otherPeerId.current);
        socket.emit('ice-candidate', { targetId: otherPeerId.current, candidate: e.candidate });
      }
    };

    pc.current.ontrack = (e) => {
      console.log('Received remote stream');
      if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0];
    };
  }

  // Helper to add local tracks only once
  function addLocalTracks() {
    if (!pc.current || !localStream.current) return;
    const senders = pc.current.getSenders();
    localStream.current.getTracks().forEach(track => {
      if (!senders.find(sender => sender.track === track)) {
        pc.current.addTrack(track, localStream.current);
      }
    });
  }

  async function startCall() {
    if (!otherPeerId.current) {
      setError('Waiting for other participant to join...');
      return;
    }
    await ensureMedia();
    createPeerConnection();
    addLocalTracks();
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.emit('offer', { targetId: otherPeerId.current, sdp: offer });
    setStarted(true);
    socket.emit('start-interview', interviewId);
  }

  function endCall() {
    socket.emit('interview-ended', interviewId);
    setEnded(true);
    cleanup();
  }

  function cleanup() {
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    otherPeerId.current = null;
  }

  if (ended) return <div className="min-h-screen flex items-center justify-center">Interview ended.</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Interview Room</h1>
      {!started ? (
        <>
          {user.role === 'company' ? (
            <button onClick={startCall} className="bg-green-600 px-6 py-3 rounded-lg text-lg font-medium" disabled={!remoteJoined}>Start Interview</button>
          ) : (
            <div>
              <p>Waiting for company to start the interview...</p>
              {remoteJoined && <p>Company is present.</p>}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex space-x-8 mb-4">
            <video ref={localVideo} autoPlay muted className="w-64 h-48 bg-black rounded-lg border-2 border-green-500" />
            <video ref={remoteVideo} autoPlay className="w-64 h-48 bg-black rounded-lg border-2 border-blue-500" />
          </div>
          <button onClick={endCall} className="bg-red-600 px-6 py-3 rounded-lg text-lg font-medium">End Interview</button>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;