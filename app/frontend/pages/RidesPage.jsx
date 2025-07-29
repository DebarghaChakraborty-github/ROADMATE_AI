import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext'; // To get the user ID for fetching
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ListItem from '../components/ListItem';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

const RidesPage = () => {
  const {
    savedItineraries,
    isLoadingItineraries,
    loadItinerariesError,
    fetchSavedItineraries,
    deleteItinerary,
    isDeletingItinerary,
    deleteItineraryError,
    selectItinerary, // To set a specific itinerary as current if needed
  } = useTrip();

  const { user, isAuthenticated, isLoadingAuth } = useAuth(); // Get user and auth status

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itineraryToDeleteId, setItineraryToDeleteId] = useState(null);
  const [itineraryToDeleteName, setItineraryToDeleteName] = useState('');

  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [itineraryToView, setItineraryToView] = useState(null);

  // --- Fetch itineraries on component mount or when user changes ---
  useEffect(() => {
    // Only fetch if authentication state is known and user is logged in
    if (!isLoadingAuth && isAuthenticated && user?.id) {
      fetchSavedItineraries(user.id);
    } else if (!isLoadingAuth && !isAuthenticated) {
      // Handle case where user is not authenticated, perhaps redirect to login
      console.warn("User not authenticated. Cannot fetch saved itineraries.");
      // Optionally, set an error or redirect
    }
  }, [isAuthenticated, isLoadingAuth, user?.id, fetchSavedItineraries]);

  // --- Handlers for Viewing Itinerary Details ---
  const handleViewDetails = useCallback((itinerary) => {
    setItineraryToView(itinerary);
    setShowViewDetailsModal(true);
  }, []);

  const handleCloseViewDetailsModal = useCallback(() => {
    setShowViewDetailsModal(false);
    setItineraryToView(null);
  }, []);

  // --- Handlers for Deleting Itinerary ---
  const handleConfirmDelete = useCallback((itineraryId, itineraryName) => {
    setItineraryToDeleteId(itineraryId);
    setItineraryToDeleteName(itineraryName);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setItineraryToDeleteId(null);
    setItineraryToDeleteName('');
  }, []);

  const handleExecuteDelete = useCallback(async () => {
    if (itineraryToDeleteId) {
      const success = await deleteItinerary(itineraryToDeleteId);
      if (success) {
        console.log(`Itinerary ${itineraryToDeleteId} successfully deleted.`);
      }
      handleCancelDelete(); // Close modal regardless of success/failure
    }
  }, [itineraryToDeleteId, deleteItinerary, handleCancelDelete]);

  // --- Loading and Error States ---
  const showLoading = isLoadingAuth || isLoadingItineraries || isDeletingItinerary;
  const showError = authError || loadItinerariesError || deleteItineraryError;

  return (
    <MainLayout pageTitle="My Saved Rides">
      <div className="max-w-3xl mx-auto p-4">
        {showLoading && <LoadingSpinner size="lg" className="my-8" />}
        {showError && (
          <ErrorMessage
            message={showError}
            onClose={() => {
              // Clear specific errors based on which one is active
              // Note: RiderContext and VehicleContext errors are handled on their respective pages
              if (loadItinerariesError) { /* This would require a clearError function in TripContext */ }
              if (deleteItineraryError) { /* This would require a clearError function in TripContext */ }
              // For now, simple console log for context errors
              console.log("Error message dismissed.");
            }}
          />
        )}

        {!isAuthenticated && !isLoadingAuth && (
          <Card title="Access Denied">
            <p className="text-center text-gray-600 mb-4">
              You need to be logged in to view your saved rides.
            </p>
            <Link to="/login">
              <Button variant="primary" size="md" className="w-full">
                Login Now
              </Button>
            </Link>
          </Card>
        )}

        {isAuthenticated && !showLoading && !showError && (
          <>
            <Card title="Your Saved Trip Itineraries">
              {savedItineraries.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <p className="mb-4">You haven't saved any itineraries yet.</p>
                  <p className="mb-6">Start by generating a new plan!</p>
                  <Link to="/ai-itinerary">
                    <Button variant="primary" size="md">
                      Generate New Itinerary
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedItineraries.map((itinerary) => (
                    <div
                      key={itinerary._id}
                      className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden"
                    >
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        {itinerary.itineraryName || `Ride to ${itinerary.generatedPlan[0]?.destination || 'Unnamed Trip'}`}
                      </h3>
                      <ListItem
                        label="Duration"
                        value={`${itinerary.tripPreferences?.tripDurationDays || 'N/A'} days`}
                        icon="🗓️"
                      />
                      <ListItem
                        label="Total Distance"
                        value={`${itinerary.generatedPlan?.reduce((sum, day) => sum + day.distanceKm, 0) || 'N/A'} km`}
                        icon="🛣️"
                      />
                      <ListItem
                        label="Overall Sentiment"
                        value={itinerary.overallRecommendation?.overallSentiment || 'N/A'}
                        icon={
                          itinerary.overallRecommendation?.overallSentiment === 'warning' ? '🚨' :
                          itinerary.overallRecommendation?.overallSentiment === 'cautionary' ? '⚠️' :
                          '✅'
                        }
                        valueClassName={`${
                          itinerary.overallRecommendation?.overallSentiment === 'warning' ? 'text-red-600 font-bold' :
                          itinerary.overallRecommendation?.overallSentiment === 'cautionary' ? 'text-yellow-600 font-bold' :
                          'text-green-600 font-bold'
                        }`}
                      />
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          onClick={() => handleViewDetails(itinerary)}
                          variant="secondary"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleConfirmDelete(itinerary._id, itinerary.itineraryName)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
              isOpen={showDeleteConfirmModal}
              onClose={handleCancelDelete}
              title="Confirm Deletion"
            >
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the itinerary: <span className="font-semibold text-blue-700">"{itineraryToDeleteName}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button onClick={handleCancelDelete} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={handleExecuteDelete} variant="danger" disabled={isDeletingItinerary}>
                  {isDeletingItinerary ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </Modal>

            {/* View Details Modal */}
            <Modal
              isOpen={showViewDetailsModal}
              onClose={handleCloseViewDetailsModal}
              title={itineraryToView?.itineraryName || "Itinerary Details"}
              className="max-w-2xl" // Make modal wider for details
            >
              {itineraryToView && (
                <div className="space-y-4 text-gray-700">
                  <h4 className="font-semibold text-lg text-blue-800">Overall Trip Summary:</h4>
                  <ListItem label="Total Days" value={`${itineraryToView.tripPreferences?.tripDurationDays} days`} />
                  <ListItem label="Overall Sentiment" value={itineraryToView.overallRecommendation?.overallSentiment} />
                  <ListItem label="Risk Alert" value={itineraryToView.overallRecommendation?.riskAlert} />
                  <ListItem label="Coach Tips" value={itineraryToView.overallRecommendation?.coachTips} />

                  <h4 className="font-semibold text-lg text-blue-800 mt-6">Day-by-Day Breakdown:</h4>
                  <div className="space-y-4">
                    {itineraryToView.generatedPlan.map((day) => (
                      <div key={day.id} className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-md text-gray-800 mb-1">Day {day.day}: {day.startLocation} to {day.destination} ({day.date})</h5>
                        <ListItem label="Distance" value={`${day.distanceKm} km`} />
                        <ListItem label="Est. Time" value={`${day.estimatedTimeHours} hours`} />
                        <ListItem label="Terrain" value={day.terrain} />
                        <ListItem label="Risk Level" value={day.riskLevel} />
                        {day.stopPoints && day.stopPoints.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-sm font-medium text-gray-600">Stop Points:</h6>
                            <ul className="list-disc list-inside text-sm ml-4">
                              {day.stopPoints.map((stop, sIdx) => (
                                <li key={sIdx}>{stop.name} ({stop.type}) at {stop.time}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {day.dayTips && (
                          <p className="text-xs text-gray-600 italic mt-2">Tips: {day.dayTips}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Modal>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default RidesPage;
