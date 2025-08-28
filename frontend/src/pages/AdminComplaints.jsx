import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react'
import api from '../utils/api'

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints')
      setComplaints(response.data)
    } catch (error) {
      toast.error('Failed to load complaints')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async (complaintId, status) => {
    try {
      await api.put(`/complaints/${complaintId}`, {
        status,
        resolution: status === 'resolved' ? 'Issue has been resolved' : 'Under investigation'
      })
      toast.success('Complaint status updated successfully!')
      fetchComplaints()
    } catch (error) {
      toast.error('Failed to update complaint status')
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel - Complaints</h1>
          <p className="text-gray-600">Manage and resolve user complaints</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complaints List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">All Complaints</h2>
              
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                        <p className="text-sm text-gray-500">
                          Filed by {complaint.complainant?.name || 'Unknown'} on{' '}
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{complaint.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {complaint.type}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {complaint.category}
                        </span>
                      </div>
                      
                      {complaint.status !== 'resolved' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolve(complaint._id, 'in-progress')}
                            className="btn-outline px-3 py-1 text-sm"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            In Progress
                          </button>
                          <button
                            onClick={() => handleResolve(complaint._id, 'resolved')}
                            className="btn-primary px-3 py-1 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {complaints.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No complaints found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Complaints</span>
                  <span className="font-medium">{complaints.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">
                    {complaints.filter(c => c.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {complaints.filter(c => c.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-medium">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full btn-outline text-left">
                  Export Complaints
                </button>
                <button className="w-full btn-outline text-left">
                  Generate Report
                </button>
                <button className="w-full btn-outline text-left">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminComplaints 