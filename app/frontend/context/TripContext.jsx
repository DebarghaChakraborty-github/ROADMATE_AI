import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios'; // For making API calls to your backend

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [savedItineraries, setSavedItineraries] = useState([]); // Stores a list of all saved itineraries for the user
  const [currentItinerary, setCurrentItinerary] = useState(null); // Stores the currently active/viewed itinerary
  const [isSavingItinerary, setIsSavingItinerary] = useState(false);
  const [saveItineraryError, setSaveItineraryError] = useState(null);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(false);
  const [loadItinerariesError, setLoadItinerariesError] = useState(null);
  const [isDeletingItinerary, setIsDeletingItinerary] = useState(false);
  const [deleteItineraryError, setDeleteItineraryError] = useState(null);

  /**
   * Saves a new AI-generated itinerary to the backend.
   * This function expects a comprehensive object containing all data related to the itinerary.
   * It will typically be called from the AIItinerary.jsx page after a plan is generated.
   *
   * @param {object} itineraryData - An object containing:
   * - riderProfile: Snapshot of rider's profile
   * - vehicleSpecs: Snapshot of vehicle's specifications
   * - vehicleCondition: Snapshot of vehicle's condition
   * - tripPreferences: Snapshot of trip preferences
   * - externalFactors: Snapshot of external factors
   * - generatedPlan: The array of day-wise itinerary details
   * - overallRecommendation: The combined recommendation object (coachTips, riskAlert, sentiment)
   * - itineraryName (optional): A user-defined name for the itinerary
   * @returns {object|null} The saved itinerary object from the backend, or null on error.
   */
  const saveItinerary = useCallback(async (itineraryData) => {
    setIsSavingItinerary(true);
    setSaveItineraryError(null);
    try {
      // In a real application, the userId would be automatically added by backend middleware
      // after authentication. For now, we'll use a placeholder if not provided.
      // Make sure your backend expects this structure.
      const payload = {
        userId: itineraryData.userId || 'mock_user_id', // Placeholder, replace with actual user ID from AuthContext
        riderProfile: itineraryData.riderProfile,
        vehicleSpecs: itineraryData.vehicleSpecs,
        vehicleCondition: itineraryData.vehicleCondition,
        tripPreferences: itineraryData.tripPreferences,
        externalFactors: itineraryData.externalFactors,
        generatedPlan: itineraryData.generatedPlan,
        overallRecommendation: itineraryData.overallRecommendation,
        itineraryName: itineraryData.itineraryName,
      };

      const response = await axios.post('/api/itineraries', payload);
      const newItinerary = response.data;

      setSavedItineraries(prev => [...prev, newItinerary]); // Add to the list of saved itineraries
      setCurrentItinerary(newItinerary); // Set this as the currently viewed itinerary
      console.log('Itinerary saved successfully:', newItinerary);
      return newItinerary;
    } catch (err) {
      console.error('Error saving itinerary:', err.response ? err.response.data : err.message);
      setSaveItineraryError('Failed to save itinerary. Please check your data and try again.');
      return null;
    } finally {
      setIsSavingItinerary(false);
    }
  }, []);

  /**
   * Fetches all itineraries for the current user from the backend.
   * This would typically be called on a "My Rides" or "Saved Itineraries" page.
   *
   * @param {string} userId - The ID of the user whose itineraries to fetch.
   * In a real app, this would come from AuthContext.
   */
  const fetchSavedItineraries = useCallback(async (userId) => {
    setIsLoadingItineraries(true);
    setLoadItinerariesError(null);
    try {
      // In a real app, the user ID would likely be handled by auth middleware
      // and not explicitly passed in the URL, or it would be req.user.id
      const response = await axios.get(`/api/itineraries/${userId}`);
      setSavedItineraries(response.data);
      console.log('Fetched itineraries:', response.data);
    } catch (err) {
      console.error('Error fetching itineraries:', err.response ? err.response.data : err.message);
      setLoadItinerariesError('Failed to load itineraries. Please check your connection.');
    } finally {
      setIsLoadingItineraries(false);
    }
  }, []);

  /**
   * Sets a specific itinerary as the currently active one for viewing/editing.
   * This could be used when a user clicks on a saved itinerary from a list.
   * @param {object} itinerary - The full itinerary object to set as current.
   */
  const selectItinerary = useCallback((itinerary) => {
    setCurrentItinerary(itinerary);
    console.log('Selected itinerary:', itinerary);
  }, []);

  /**
   * Deletes a specific itinerary from the backend.
   * @param {string} itineraryId - The ID of the itinerary to delete.
   */
  const deleteItinerary = useCallback(async (itineraryId) => {
    setIsDeletingItinerary(true);
    setDeleteItineraryError(null);
    try {
      await axios.delete(`/api/itineraries/${itineraryId}`);
      setSavedItineraries(prev => prev.filter(it => it._id !== itineraryId)); // Remove from local state
      if (currentItinerary && currentItinerary._id === itineraryId) {
        setCurrentItinerary(null); // Clear current if deleted
      }
      console.log(`Itinerary ${itineraryId} deleted successfully.`);
      return true;
    } catch (err) {
      console.error('Error deleting itinerary:', err.response ? err.response.data : err.message);
      setDeleteItineraryError('Failed to delete itinerary. Please try again.');
      return false;
    } finally {
      setIsDeletingItinerary(false);
    }
  }, [currentItinerary]);

  /**
   * Resets all trip-related states to their initial values.
   */
  const resetTripContext = useCallback(() => {
    setSavedItineraries([]);
    setCurrentItinerary(null);
    setIsSavingItinerary(false);
    setSaveItineraryError(null);
    setIsLoadingItineraries(false);
    setLoadItinerariesError(null);
    setIsDeletingItinerary(false);
    setDeleteItineraryError(null);
  }, []);

  // --- Context Value ---
  const contextValue = {
    savedItineraries,
    currentItinerary,
    isSavingItinerary,
    saveItineraryError,
    isLoadingItineraries,
    loadItinerariesError,
    isDeletingItinerary,
    deleteItineraryError,
    saveItinerary,
    fetchSavedItineraries,
    selectItinerary,
    deleteItinerary,
    resetTripContext,
  };

  // Provide the context value to children components
  return (
    <TripContext.Provider value={contextValue}>
      {children}
    </TripContext.Provider>
  );
};

// Hook for consuming the TripContext in functional components
export const useTrip = () => useContext(TripContext);

export default TripContext;
