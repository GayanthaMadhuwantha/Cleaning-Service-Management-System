import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Briefcase, 
  MessageSquare,
  AlertCircle,
  Save,
  Home
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const BookingForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, logout} = useAuth();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    address: '',
    date_time: '',
    service_id: '',
    notes: '',
  });
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchServices();
    if (isEdit) {
      fetchBooking();
    }
  }, [id]);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    }
  };

  const fetchBooking = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const booking = data.find(b => b.id === parseInt(id));
      console.log(booking);
      if (booking) {
        const formattedDateTime = new Date(booking.date_time).toISOString().slice(0, 16);
  
        // Try to find the service in the services array by name
        const matchedService = services.find(
          s => s.name === booking.name
        );
  
        setFormData({
          customer_name: booking.customer_name,
          address: booking.address,
          date_time: formattedDateTime,
          service_id: matchedService ? String(matchedService.id) : '',
          notes: booking.notes || '',
        });
      } else {
        setError('Booking not found');
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to fetch booking details');
      console.error('Error fetching booking:', err);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Customer name is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.date_time) {
      errors.date_time = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.date_time);
      if (selectedDate <= new Date()) {
        errors.date_time = 'Please select a future date and time';
      }
    }
    
    if (!formData.service_id) {
      errors.service_id = 'Please select a service';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} booking`);
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === parseInt(formData.service_id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">CleanPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Booking' : 'Book a Cleaning Service'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isEdit ? 'Update your booking details below' : 'Fill out the form below to schedule your cleaning service'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.customer_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer name"
                  />
                </div>
                {validationErrors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.customer_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${
                      validationErrors.service_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={String(service.id)}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.service_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.service_id}</p>
                )}
                {selectedService && (
                  <p className="mt-2 text-sm text-gray-600">{selectedService.description}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    validationErrors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter the full address where the service will be performed"
                />
              </div>
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleChange}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.date_time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.date_time && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.date_time}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Please select a date and time at least 24 hours in advance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Any special instructions, access details, or specific areas to focus on..."
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {loading 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Booking' : 'Create Booking')
                }
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;