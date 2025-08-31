import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Star, Send } from 'lucide-react'
import api from '../utils/api'

const Review = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    type: ''
  })
  const [reviewId, setReviewId] = useState(null)
  // Get ?type=company-to-freelancer or freelancer-to-company from query
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type') || 'company-to-freelancer'
    setFormData(f => ({ ...f, type }))
    // Fetch existing review for this user/type
    const fetchReview = async () => {
      try {
        const res = await api.get(`/reviews/${userId}`)
        // Find review by current user and type
        const token = localStorage.getItem('auth-storage')
        let myId = null
        if (token) {
          try {
            const authData = JSON.parse(token)
            myId = authData.state?.user?._id
          } catch {}
        }
        const myReview = res.data.find(r => r.reviewer?._id === myId && r.type === type)
        if (myReview) {
          setFormData({
            rating: myReview.rating,
            comment: myReview.comment,
            type: myReview.type
          })
          setReviewId(myReview._id)
        }
      } catch {}
    }
    fetchReview()
  }, [userId, location.search])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (reviewId) {
        // Update existing review (assume PATCH endpoint exists, else use POST fallback)
        await api.patch(`/reviews/${reviewId}`, {
          ...formData,
          rating: parseInt(formData.rating)
        })
        toast.success('Review updated successfully!')
      } else {
        await api.post('/reviews', {
          targetUserId: userId,
          ...formData,
          rating: parseInt(formData.rating)
        })
        toast.success('Review submitted successfully!')
      }
      navigate(-1)
    } catch (error) {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Write a Review
            </h1>
            <p className="text-gray-600">
              Share your experience and help others make informed decisions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`p-1 ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.rating} out of 5 stars
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comment *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Share your experience working with this person/company..."
                maxLength={1000}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-8 py-3"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {reviewId ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Review 