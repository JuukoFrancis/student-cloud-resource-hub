import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resourcesAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function UploadResource() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    semester: '',
    resource_type: '',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file to upload.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('course', form.course)
      formData.append('semester', form.semester)
      formData.append('resource_type', form.resource_type)
      formData.append('file', file)

      await resourcesAPI.upload(formData)
      toast.success('Resource uploaded successfully!')
      navigate('/resources')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        Object.entries(data).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : messages
          toast.error(`${field}: ${msg}`)
        })
      } else {
        toast.error('Upload failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Resource</h1>
        <p className="text-gray-600 mt-1">Share academic resources with the community</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Data Structures Lecture Notes"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Brief description of the resource"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., CS201"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Semester</option>
                <option value="1_1">Year 1 - Sem 1</option>
                <option value="1_2">Year 1 - Sem 2</option>
                <option value="2_1">Year 2 - Sem 1</option>
                <option value="2_2">Year 2 - Sem 2</option>
                <option value="3_1">Year 3 - Sem 1</option>
                <option value="3_2">Year 3 - Sem 2</option>
                <option value="4_1">Year 4 - Sem 1</option>
                <option value="4_2">Year 4 - Sem 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
              <select
                name="resource_type"
                value={form.resource_type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Type</option>
                <option value="lecture_notes">Lecture Notes</option>
                <option value="assignment">Assignment</option>
                <option value="past_paper">Past Paper</option>
                <option value="tutorial">Tutorial</option>
                <option value="project_report">Project Report</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.docx,.pptx,.zip,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOCX, PPTX, ZIP, Images — Max 50MB</p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
            <button type="button" onClick={() => navigate('/resources')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
