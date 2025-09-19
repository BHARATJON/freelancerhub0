import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import io from 'socket.io-client';
import { Paperclip, Download } from 'lucide-react';
import EditJobModal from '../components/EditJobModal';


const Chat = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  // Contract state for modal workflow
  const [contractForJob, setContractForJob] = useState(null);
  const [finalLoading, setFinalLoading] = useState(false);
  const [finalError, setFinalError] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPayQR, setShowPayQR] = useState(false);
  const [freelancerUpi, setFreelancerUpi] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);

  // Fetch freelancer UPI and contract amount for payment
  const fetchFreelancerUpiAndAmount = async () => {
    if (!contractForJob?.freelancer) return;
    setPayLoading(true);
    try {
      // Defensive: get freelancer id
      const freelancerId = typeof contractForJob.freelancer === 'object' && contractForJob.freelancer?._id
        ? contractForJob.freelancer._id
        : contractForJob.freelancer;
      const res = await api.get(`/profile/freelancer/${freelancerId}`);
      setFreelancerUpi(res.data.upi_id || '');
      setPayAmount(contractForJob.totalAmount || '');
      setShowPayQR(true);
    } catch (e) {
      setFreelancerUpi('');
      setShowPayQR(false);
    }
    setPayLoading(false);
  };
  // Mark job as completed (freelancer side)
  const handleReceivePayment = async () => {
    if (!contractForJob?.job?._id) return;
    setPayLoading(true);
    try {
      await api.put(`/jobs/${contractForJob.job._id}/complete`);
      window.location.reload();
    } catch (e) {
      // handle error
    }
    setPayLoading(false);
  };

  const fetchContractForJob = async () => {
    setFinalLoading(true);
    setFinalError('');
    try {
      const res = await api.get(`/contracts/job/${jobId}`);
      setContractForJob(res.data);
      setTasks(res.data.tasks || []);
      setProgress(res.data.progress || 0);
    } catch (e) {
      setFinalError('Could not load contract info');
      setContractForJob(null);
      setTasks([]);
      setProgress(0);
    }
    setFinalLoading(false);
  };

  // Fetch contract for this job (for modal workflow)
  useEffect(() => {
    fetchContractForJob();
  }, [jobId]);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/conversation/${jobId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');

    // Join the chat room
    socketRef.current.emit('join-chat', { jobId });

    // Listen for incoming messages
    socketRef.current.on('chat-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // Disconnect the socket when the component unmounts
      socketRef.current.disconnect();
    };
  }, [jobId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const recipientId = await getRecipientId();
      if (!recipientId) {
        console.error('Could not determine the recipient ID.');
        return;
      }

      await api.post('/messages', {
        recipientId,
        content: newMessage,
        jobId,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload the file
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url, name, type, size } = uploadResponse.data;

      // 2. Get the recipient ID
      const recipientId = await getRecipientId();
      if (!recipientId) {
        console.error('Could not determine the recipient ID.');
        return;
      }

      // 3. Send a new message with the file information
      await api.post('/messages', {
        recipientId,
        content: name,
        jobId,
        messageType: type.startsWith('image') ? 'image' : (type.startsWith('video') ? 'video' : 'file'),
        attachments: [{
          name,
          url,
          type,
          size,
        }],
      });
    } catch (error) {
      console.error('Error uploading file and sending message:', error);
    }
  };

  const getRecipientId = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      const job = response.data;
      if (user.role === 'company') {
        return job.hiredFreelancer;
      } else {
        return job.company;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      return null;
    }
  };

  const renderMessageContent = (message) => {
    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      const isImage = attachment.type.startsWith('image/');
      const isVideo = attachment.type.startsWith('video/');

      return (
        <div className="flex items-center">
          {isImage ? (
            <img src={`http://localhost:5000${attachment.url}`} alt={attachment.name} className="max-w-xs max-h-48" />
          ) : isVideo ? (
            <video src={`http://localhost:5000${attachment.url}`} controls className="max-w-xs max-h-48" />
          ) : (
            <a
              href={`http://localhost:5000${attachment.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {attachment.name}
            </a>
          )}
          <a
            href={`http://localhost:5000${attachment.url}`}
            download
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <Download size={16} />
          </a>
        </div>
      );
    } else {
      return <p>{message.content}</p>;
    }
  };

  const handleTaskChange = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const handleUpdateTasks = async () => {
    try {
      const res = await api.put(`/contracts/${contractForJob._id}/tasks`, { tasks });
      setTasks(res.data.contract.tasks);
      setProgress(res.data.contract.progress);
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-auto items-start">
      {/* Chat Box (left, 70%) */}
      <div className="w-[70%] h-[80vh] bg-white rounded-lg shadow-lg flex flex-col p-0 overflow-auto mt-8 ml-[5%]">
        <h1 className="text-3xl font-bold mb-8 text-left pl-8 pt-8">Chat for Job</h1>
        <div className="flex flex-col flex-1 px-8 pb-8">
          <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ minHeight: 0, maxHeight: '100%', height: '100%' }}>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex w-full ${
                  message.sender._id === user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg break-words max-w-[60%] ${
                    message.sender._id === user.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="bg-gray-200 text-gray-500 rounded-l-lg px-4"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border-t border-b p-2"
              placeholder="Type a message..."
            />
            <button type="submit" className="bg-primary-500 text-white rounded-r-lg px-4">
              Send
            </button>
          </form>
        </div>
      </div>
      {/* View Detail Button (right, 20%) */}
      <div className="w-[20%] flex flex-col items-center mt-8 ml-[5%]">
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded shadow text-lg mb-4"
          onClick={() => navigate(`/job/${jobId}`)}
        >
          View Detail
        </button>
        {user.role === 'company' && (
            <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded shadow text-lg mb-4"
                onClick={() => setShowEditJobModal(true)}
            >
                Edit Job
            </button>
        )}
        {/* Contract and Review Buttons for Company and Freelancer */}
        {user.role === 'company' && (
          <>
            {/* Pay to Freelancer Button */}
            {contractForJob && contractForJob.isFinalized && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-4">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <button
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded shadow text-lg mb-2"
                  onClick={fetchFreelancerUpiAndAmount}
                  disabled={payLoading}
                >
                  {payLoading ? 'Loading...' : 'Pay to Freelancer'}
                </button>
              </>
            )}
            {/* Show QR code for payment */}
            {showPayQR && freelancerUpi && payAmount && (
              <div className="flex flex-col items-center mt-2">
                <div style={{ background: 'white', padding: 8 }}>
                  <QRCode value={`upi://pay?pa=${freelancerUpi}&pn=Freelancer&am=${payAmount}&cu=INR`} size={180} />
                </div>
                <div className="text-sm mt-2">Scan to pay ₹{payAmount} to UPI: {freelancerUpi}</div>
                <button className="text-xs text-red-500 mt-1" onClick={() => setShowPayQR(false)}>Hide QR</button>
              </div>
            )}
            {/* Contract and Review Buttons */}
            {!contractForJob ? (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow text-lg mb-2"
                onClick={() => setShowContractModal(true)}
              >
                Create Contract
              </button>
            ) : !contractForJob.isFinalized ? (
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded shadow text-lg mb-2"
                onClick={() => setShowContractModal(true)}
              >
                Edit Contract
              </button>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow text-lg mb-2"
                onClick={() => setShowContractModal(true)}
              >
                View Contract
              </button>
            )}
            {/* Review Button for Company to review Freelancer */}
            {contractForJob && contractForJob.isFinalized && (
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded shadow text-lg"
                onClick={() => {
                  // Defensive: ensure ID is string
                  const freelancerId = typeof contractForJob.freelancer === 'object' && contractForJob.freelancer?._id
                    ? contractForJob.freelancer._id
                    : contractForJob.freelancer;
                  navigate(`/review/${freelancerId}?type=company-to-freelancer`);
                }}
              >
                {`Review Freelancer`}
              </button>
            )}
          </>
        )}
        {user.role === 'freelancer' && contractForJob && (
          <>
            {/* Receive Payment Button */}
            {contractForJob.isFinalized && contractForJob.job?.status !== 'completed' && (
              <button
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded shadow text-lg mb-2"
                onClick={handleReceivePayment}
                disabled={payLoading}
              >
                {payLoading ? 'Processing...' : 'Receive Payment'}
              </button>
            )}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow text-lg mb-2"
              onClick={() => setShowContractModal(true)}
            >
              View Contract
            </button>
            {contractForJob.isFinalized && (
              <div className="my-4 w-full">
                <h3 className="text-lg font-bold mb-2">To-Do List</h3>
                {tasks.map((task, index) => (
                  <div key={task._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskChange(index)}
                      className="mr-2"
                    />
                    <span>{task.name} ({task.weightage}%)</span>
                  </div>
                ))}
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
                  onClick={handleUpdateTasks}
                >
                  Save Changes
                </button>
              </div>
            )}
            {contractForJob.isFinalized && (
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded shadow text-lg"
                onClick={() => {
                  // Defensive: ensure ID is string
                  const companyId = typeof contractForJob.company === 'object' && contractForJob.company?._id
                    ? contractForJob.company._id
                    : contractForJob.company;
                  navigate(`/review/${companyId}?type=freelancer-to-company`);
                }}
              >
                {`Review Company`}
              </button>
            )}
          </>
        )}
        {user.role === 'freelancer' && !finalLoading && !contractForJob && (
          <div className="text-gray-500 text-sm mt-2">No contract has been created for this job yet.</div>
        )}
      </div> {/* Close right panel div */}

      {showContractModal && (
        user.role === 'company' ? (
          !contractForJob ? (
            <ContractModal jobId={jobId} onClose={() => setShowContractModal(false)} onCreated={() => {
              setShowContractModal(false);
              setFinalLoading(true);
              api.get(`/contracts/job/${jobId}`)
                .then(res => setContractForJob(res.data))
                .catch(() => setContractForJob(null))
                .finally(() => setFinalLoading(false));
            }} contract={null} />
          ) : !contractForJob.isFinalized ? (
            <ContractModal jobId={jobId} onClose={() => setShowContractModal(false)} onCreated={() => {
              setShowContractModal(false);
              setFinalLoading(true);
              api.get(`/contracts/job/${jobId}`)
                .then(res => setContractForJob(res.data))
                .catch(() => setContractForJob(null))
                .finally(() => setFinalLoading(false));
            }} contract={contractForJob} />
          ) : (
            <ViewContractModal contract={contractForJob} onClose={() => setShowContractModal(false)} />
          )
        ) : ( // user.role === 'freelancer'
          !contractForJob.isFinalized ? (
            <ReviewContractModal contract={contractForJob} onClose={() => setShowContractModal(false)} onFinalized={() => {
              setShowContractModal(false);
              setFinalLoading(true);
              api.get(`/contracts/job/${jobId}`)
                .then(res => setContractForJob(res.data))
                .catch(() => setContractForJob(null))
                .finally(() => setFinalLoading(false));
            }} isViewOnly={false} />
          ) : (
            <ViewContractModal contract={contractForJob} onClose={() => setShowContractModal(false)} />
          )
        )
      )}
      {showReviewModal && contractForJob && (
        <ReviewContractModal contract={contractForJob} onClose={() => setShowReviewModal(false)} onFinalized={() => {
          setShowReviewModal(false);
          setFinalLoading(true);
          api.get(`/contracts/job/${jobId}`)
            .then(res => setContractForJob(res.data))
            .catch(() => setContractForJob(null))
            .finally(() => setFinalLoading(false));
        }} isViewOnly={user.role === 'freelancer' && contractForJob && contractForJob.isFinalized} />
      )}

      {showEditJobModal && (
        <EditJobModal 
            jobId={jobId} 
            onClose={() => setShowEditJobModal(false)} 
            onJobUpdated={() => {
                fetchContractForJob();
            }}
        />
      )}
    </div> 
  );
}
// Place modals outside the main return
// Contract Modal for Company
// Review Modal for Freelancer
  

// --- Contract Modal for Company ---
function ContractModal({ jobId, onClose, onCreated, contract }) {
  const [startDate, setStartDate] = useState(contract ? contract.startDate?.slice(0,10) : '');
  const [endDate, setEndDate] = useState(contract ? contract.endDate?.slice(0,10) : '');
  const [totalAmount, setTotalAmount] = useState(contract ? contract.totalAmount : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState(contract ? contract.application?._id : '');

  // Fetch applicationId for this job (assume only one hired)
  useEffect(() => {
    if (contract && contract.application?._id) {
      setApplicationId(contract.application._id);
      return;
    }
    async function fetchApp() {
      try {
        const res = await api.get(`/jobs/${jobId}/applications`);
        if (res.data && res.data.length > 0) {
          setApplicationId(res.data[0]._id);
        }
      } catch {}
    }
    fetchApp();
  }, [jobId, contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (contract && contract._id && !contract.isFinalized) {
        // Edit contract (PUT)
        await api.put(`/contracts/${contract._id}`, { startDate, endDate, totalAmount });
      } else {
        // Create contract (POST)
        await api.post('/contracts', { applicationId, startDate, endDate, totalAmount });
      }
      setSuccess(true);
      onCreated && onCreated();
    } catch (err) {
      setError('Failed to save contract');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">{contract && !contract.isFinalized ? 'Edit Contract' : 'Create Contract'}</h2>
        {success ? (
          <div className="text-green-600">Contract saved! Freelancer will be notified.</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label>Start Date:<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-field" /></label>
            <label>End Date:<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input-field" /></label>
            <label>Total Amount:<input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required min={1} className="input-field" /></label>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>{loading ? (contract && !contract.isFinalized ? 'Saving...' : 'Creating...') : (contract && !contract.isFinalized ? 'Save Changes' : 'Create Contract')}</button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

// --- Review Contract Modal for Freelancer ---
function ReviewContractModal({ contract, onClose, onFinalized, isViewOnly }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/contracts/${contract._id}/finalize`);
      setSuccess(true);
      onFinalized && onFinalized();
    } catch (err) {
      setError('Failed to finalize contract');
    }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">{isViewOnly ? 'Contract Details' : 'Review Contract'}</h2>
        <div className="mb-2">Start Date: <b>{contract.startDate?.slice(0,10)}</b></div>
        <div className="mb-2">End Date: <b>{contract.endDate?.slice(0,10)}</b></div>
        <div className="mb-2">Total Amount: <b>₹{contract.totalAmount}</b></div>
        {isViewOnly ? (
          <div className="text-green-600 mt-2">This contract has been finalized.</div>
        ) : success ? (
          <div className="text-green-600 mt-2">Contract finalized!</div>
        ) : (
          <button className="bg-green-600 text-white px-4 py-2 rounded mt-4" onClick={handleFinalize} disabled={loading}>{loading ? 'Finalizing...' : 'Done'}</button>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}

// --- View Contract Modal for Company ---
function ViewContractModal({ contract, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Contract Details</h2>
        <div className="mb-2">Start Date: <b>{contract.startDate?.slice(0,10)}</b></div>
        <div className="mb-2">End Date: <b>{contract.endDate?.slice(0,10)}</b></div>
        <div className="mb-2">Total Amount: <b>₹{contract.totalAmount}</b></div>
        <div className="mb-2">Finalized: <b>{contract.isFinalized ? 'Yes' : 'No'}</b></div>
      </div>
    </div>
  );
}

export default Chat;