import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { useAuthStore } from '../stores/authStore'
import api from '../utils/api'
import { toast } from 'react-toastify'

const ScheduledInterviews = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [interviews, setInterviews] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchInterviews()

    const socket = window.socket;
    if (socket) {
      socket.on('interview-started', (data) => {
        setInterviews(prevInterviews => {
          return prevInterviews.map(interview => {
            if (interview._id === data.interviewId) {
              return { ...interview, status: 'in-progress' };
            }
            return interview;
          });
        });
        toast.info('An interview has started!');
      });
    }

    return () => {
      if (socket) {
        socket.off('interview-started');
      }
    };
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviews')
      setInterviews(response.data)
    } catch (error) {
      toast.error('Failed to fetch interviews')
    } finally {
      setIsLoading(false)
    }
  }

  const getInterviewsForDate = (date) => {
    return interviews.filter(interview => 
      isSameDay(new Date(interview.scheduledTime), date)
    )
  }

  const getCalendarDays = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  const startInterview = (interviewId) => {
    navigate(`/interview/${interviewId}`)
  }

  const getInterviewStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  const getInterviewStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const isInterviewTime = (interview) => {
    const now = new Date()
    const interviewTime = new Date(interview.scheduledTime)
    const timeDiff = Math.abs(now - interviewTime) / (1000 * 60) // difference in minutes
    
    // Interview can be started 15 minutes before and up to 2 hours after scheduled time
    return timeDiff <= 135 && interview.status === 'scheduled'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Interviews</h1>
          <p className="text-gray-600 mt-2">View and manage your upcoming interviews</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((date, index) => {
                  const dayInterviews = getInterviewsForDate(date)
                  const hasInterviews = dayInterviews.length > 0
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  const isCurrentMonth = isSameMonth(date, currentDate)
                  const isCurrentDay = isToday(date)

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`
                        min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
                        ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}
                        ${hasInterviews ? 'bg-green-50 border-green-300' : ''}
                        hover:bg-gray-50
                      `}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {format(date, 'd')}
                      </div>
                      {hasInterviews && (
                        <div className="flex flex-wrap gap-1">
                          {dayInterviews.slice(0, 2).map((interview, idx) => (
                            <div
                              key={idx}
                              className="w-2 h-2 bg-green-500 rounded-full"
                              title={`${interview.job?.title || 'Interview'} at ${format(new Date(interview.scheduledTime), 'HH:mm')}`}
                            />
                          ))}
                          {dayInterviews.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayInterviews.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Interviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </h3>

              {selectedDate ? (
                <div className="space-y-4">
                  {getInterviewsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No interviews scheduled for this date</p>
                  ) : (
                    getInterviewsForDate(selectedDate).map((interview) => (
                      <div
                        key={interview._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getInterviewStatusIcon(interview.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterviewStatusColor(interview.status)}`}>
                              {interview.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(interview.scheduledTime), 'HH:mm')}
                          </div>
                        </div>

                        <h4 className="font-medium text-gray-900 mb-2">
                          {interview.job?.title || 'Interview'}
                        </h4>

                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {user.role === 'company' 
                                ? interview.freelancer?.name || 'Freelancer'
                                : interview.company?.companyName || 'Company'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{interview.duration} minutes</span>
                          </div>
                        </div>

                        {interview.notes && (
                          <p className="text-sm text-gray-600 mb-3">
                            {interview.notes}
                          </p>
                        )}

                        {interview.status === 'scheduled' && isInterviewTime(interview) && (
                          <button
                            onClick={() => startInterview(interview._id)}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Interview</span>
                          </button>
                        )}

                        {interview.status === 'in-progress' && user.role === 'freelancer' && (
                          <button
                            onClick={() => startInterview(interview._id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Join Interview</span>
                          </button>
                        )}

                        {interview.status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-green-800">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Interview Completed</span>
                            </div>
                            {interview.outcome && (
                              <p className="text-sm text-green-700 mt-1">
                                Outcome: {interview.outcome}
                              </p>
                            )}
                          </div>
                        )}

                        {interview.status === 'cancelled' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-red-800">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Interview Cancelled</span>
                            </div>
                            {interview.cancellationReason && (
                              <p className="text-sm text-red-700 mt-1">
                                Reason: {interview.cancellationReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Click on a date to view interviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduledInterviews