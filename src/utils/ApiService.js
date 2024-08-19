import axios from 'axios'

const BASE_URL = "http://localhost:8080/api/"

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
})

const ApiService = {
    getAllTracks: async () => {
        try{
            const response = await axiosInstance.get('tracks')
            return response.data;
        }catch(error){
            handleApiError(error);
            throw error;
        }
    },

    getTrack: async (trackId)=>{
        try {
             const response = await axiosInstance.get(`tracks/${trackId}`)
             return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
          }
    },

    addTrack: async (trackData)=>{
        try {
            const response = await axiosInstance.post('tracks', trackData)
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
          }
    },

    editTrack: async (trackId, trackData)=>{
        try {
             const response = await axiosInstance.put(`tracks/${trackId}`, trackData)
             return response;
        } catch (error) {
            handleApiError(error);
            throw error;
          }
    },

    deleteTrack: async (trackId)=>{
        try {
             const response = await axiosInstance.delete(`tracks/${trackId}`)
             return response.status;
        } catch (error) {
            handleApiError(error);
            throw error;
          }
    },

    getBookingCountByTrackId: async (trackId) => {
        try{
            const response = await axiosInstance.get(`bookings/track/${trackId}/count`);
            return response.data;
        } catch(error){
            handleApiError(error)
            throw error
        }
    },

    getBookingCountByTrackIdAndDateBetween: async (trackId, startDate, endDate) => {
        try{
            const response = await axiosInstance.get(`bookings/track/${trackId}/${startDate}/${endDate}/count`);
            return response.data;
        } catch(error){
            handleApiError(error)
            throw error
        }
    },

    getBookingsByTrackIdAndDate: async (trackId, date) => {
        try{
            const response = await axiosInstance.get(`bookings/track/${trackId}/date/${date}`);
            return response.data;
        } catch(error){
            handleApiError(error)
            throw error
        }
    },

    getBookingsByUserId: async (userId) => {
        try{
            const response = await axiosInstance.get(`bookings/user/${userId}`);
            return response.data;
        } catch(error){
            handleApiError(error)
            throw error
        }
    },

    postBooking: async (bookingData) => {
        try{
            const response = await axiosInstance.post(`bookings`, bookingData)
            return response;
        } catch(error){
            handleApiError(error)
            throw error
        }
    },

    deleteBooking: async (bookingId) => {
        try{
            const response = await axiosInstance.delete(`bookings/${bookingId}`)
            return response.status;
        } catch(error){
            handleApiError(error)
            throw error
        }
    }
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    // Add custom error handling logic here
  };
  
export default ApiService;