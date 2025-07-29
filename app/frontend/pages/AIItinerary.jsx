import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { useRider } from '../context/RiderContext';
import { useVehicle } from '../context/VehicleContext';
import { useTrip } from '../context/TripContext'; // For saving itineraries
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ListItem from '../components/ListItem'; // For displaying itinerary details
import { Link } from 'react-router-dom'; // For linking to setup pages

// Helper function for generating random IDs (for stop points, etc.)
const generateUniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const AIItinerary = () => {
  const {
    riderProfile,
    tripPreferences,
    externalFactors,
    recommendation: riderRecommendationFromContext, // Renamed to avoid conflict
    setGeneratedRecommendation, // To update the generatedPlan and overall trip recommendations in context
    isLoadingRider,
    errorRider,
  } = useRider();

  const {
    vehicleSpecs,
    vehicleCondition,
    isLoadingVehicle,
    errorVehicle,
    calculatedMetrics: vehicleCalculatedMetrics, // Renamed to avoid conflict
    vehicleRecommendation: vehicleRecommendationFromContext, // Renamed to avoid conflict
  } = useVehicle();

  const {
    saveItinerary,
    isSavingItinerary,
    saveItineraryError,
  } = useTrip();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedItineraryPlan, setGeneratedItineraryPlan] = useState([]); // Local state for the detailed plan
  const [overallTripSentiment, setOverallTripSentiment] = useState('neutral');
  const [overallTripCoachTips, setOverallTripCoachTips] = useState('');
  const [overallTripRiskAlert, setOverallTripRiskAlert] = useState('');

  // Constants for AI simulation
  const AVERAGE_RIDING_SPEED_KMH = {
    'relaxed': 40, 'moderate': 55, 'fast': 70,
    'highway': 70, 'mixed': 50, 'off-road': 25, 'winding': 40, 'rural': 45
  };
  const DEFAULT_FUEL_RANGE_KM = 300; // Fallback if vehicle data is missing
  const REST_STOP_INTERVAL_HOURS = {
    'Excellent': 3.5, 'High': 3, 'Moderate': 2.5, 'Low': 2
  };
  const FUEL_STOP_THRESHOLD_PERCENT = 0.7; // Refuel when 70% of range is consumed

  // Define a pool of simulated destinations for multi-day trips
  const simulatedDestinations = [
    { name: 'Shimla', type: 'Hill Station' },
    { name: 'Goa', type: 'Coastal Town' },
    { name: 'Jaipur', type: 'Historic City' },
    { name: 'Leh', type: 'High Altitude Desert' },
    { name: 'Rishikesh', type: 'Spiritual Town' },
    { name: 'Ooty', type: 'Hill Station' },
    { name: 'Pondicherry', type: 'Coastal Town' },
    { name: 'Udaipur', type: 'Historic City' },
    { name: 'Manali', type: 'Mountain Valley' },
    { name: 'Varanasi', type: 'Spiritual City' },
  ];

  // Helper to get a random destination (avoiding immediate repeats)
  const getRandomDestination = (currentDestination = '') => {
    let available = simulatedDestinations.filter(d => d.name !== currentDestination);
    if (available.length === 0) available = simulatedDestinations; // Fallback if only one option left
    return available[Math.floor(Math.random() * available.length)];
  };

  /**
   * Dynamically generates the AI-powered trip itinerary.
   * This function contains the core "AI logic" simulated on the frontend.
   */
  const generateAITripPlan = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);

    // --- 1. Initial Validation & Data Collection ---
    const isRiderDataComplete = riderProfile.name && riderProfile.age && riderProfile.height && riderProfile.weight;
    const isVehicleDataComplete = vehicleSpecs.make && vehicleSpecs.model && vehicleSpecs.year && vehicleSpecs.engineCC;
    const hasEnoughVehicleDataForCalculations = vehicleSpecs.fuelEfficiency && vehicleSpecs.fuelTankCapacity && vehicleSpecs.vehicleWeight && vehicleSpecs.groundClearance;

    if (!isRiderDataComplete || !isVehicleDataComplete || !hasEnoughVehicleDataForCalculations) {
      setGenerationError('Please ensure your Rider Profile and Vehicle Setup are fully completed and detailed specs are loaded before generating an itinerary.');
      setIsGenerating(false);
      return;
    }

    // Combine all relevant data for AI logic
    const allTripData = {
      riderProfile,
      tripPreferences,
      externalFactors,
      vehicleSpecs,
      vehicleCondition,
      riderCalculated: {
        bmi: riderProfile.bmi,
        bmiCategory: riderProfile.bmiCategory,
        staminaScore: riderProfile.staminaScore,
        staminaLevel: riderProfile.staminaLevel,
        totalLoad: riderProfile.totalLoad,
      },
      vehicleCalculated: vehicleCalculatedMetrics,
      riderRecommendation: riderRecommendationFromContext,
      vehicleRecommendation: vehicleRecommendationFromContext,
    };

    console.log('AI Generation Payload:', allTripData);

    let generatedPlan = [];
    let currentOdometer = allTripData.vehicleCondition.currentOdometer || 0;
    let currentFuelLevel = allTripData.vehicleSpecs.fuelTankCapacity; // Start with full tank
    let currentFuelRange = allTripData.vehicleCalculated.estimatedRange || DEFAULT_FUEL_RANGE_KM;
    let currentLocation = 'Your Current City';
    let lastStopPointKm = currentOdometer;
    let lastFuelStopKm = currentOdometer;

    const baseDailyDistance = allTripData.riderProfile.preferredDailyDistance;
    const tripDurationDays = allTripData.tripPreferences.tripDurationDays;

    // Simulate network delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- 2. Dynamic Itinerary Generation (Day by Day) ---
    for (let dayNum = 1; dayNum <= tripDurationDays; dayNum++) {
      const dayDate = new Date(Date.now() + (dayNum * 86400000)).toISOString().split('T')[0];
      const startLocation = currentLocation;
      const destinationObj = getRandomDestination(startLocation);
      const destination = destinationObj.name;
      const destinationType = destinationObj.type;

      // Adjust daily distance based on pace and stamina
      let dailyDistance = baseDailyDistance;
      if (allTripData.tripPreferences.desiredPace === 'relaxed') dailyDistance *= 0.8;
      if (allTripData.tripPreferences.desiredPace === 'fast') dailyDistance *= 1.2;
      if (allTripData.riderCalculated.staminaLevel === 'Low') dailyDistance *= 0.7;
      if (allTripData.riderCalculated.staminaLevel === 'Excellent') dailyDistance *= 1.1;

      // Adjust for terrain (e.g., off-road days are shorter)
      let dayTerrain = allTripData.tripPreferences.expectedTerrain;
      if (dayTerrain === 'off-road' && dailyDistance > 150) dailyDistance = 150; // Cap off-road days
      if (destinationType === 'Hill Station' || destinationType === 'Mountain Valley') dayTerrain = 'Winding Mountain Roads';
      if (destinationType === 'Coastal Town') dayTerrain = 'Coastal Highway';
      if (dayTerrain === 'mixed' && Math.random() > 0.5) dayTerrain = 'Rural Roads'; // Randomly make mixed more specific

      // Calculate estimated time based on adjusted distance and terrain-specific speed
      const avgSpeedForTerrain = AVERAGE_RIDING_SPEED_KMH[dayTerrain.toLowerCase().split(' ')[0]] || AVERAGE_RIDING_SPEED_KMH['moderate'];
      let estimatedTimeHours = parseFloat((dailyDistance / avgSpeedForTerrain).toFixed(1));
      estimatedTimeHours = Math.max(estimatedTimeHours, 3); // Minimum 3 hours riding

      currentOdometer += dailyDistance; // Update odometer for the day

      // --- Generate Stop Points for the Day ---
      let stopPoints = [];
      let currentDayRidingTime = 0;
      let currentDayDistanceCovered = 0;
      let timeOfDay = 8; // Start at 8 AM

      // Fuel Stop Logic
      const fuelConsumedToday = dailyDistance / (allTripData.vehicleSpecs.fuelEfficiency || 35); // Litres consumed
      currentFuelLevel -= fuelConsumedToday;
      if (currentFuelLevel <= (allTripData.vehicleSpecs.fuelTankCapacity || 15) * (1 - FUEL_STOP_THRESHOLD_PERCENT)) {
        // Suggest a fuel stop if below threshold
        const fuelStopLocation = `Fuel Station near ${Math.floor(dailyDistance * Math.random())}km mark`;
        stopPoints.push({ name: 'Fuel Stop', type: 'Fuel', location: fuelStopLocation, time: `${String(timeOfDay + Math.floor(estimatedTimeHours * 0.2)).padStart(2, '0')}:00 AM` });
        currentFuelLevel = allTripData.vehicleSpecs.fuelTankCapacity; // Simulate refuel
        lastFuelStopKm = currentOdometer; // Update last fuel stop
      }

      // Rest/Food Stop Logic
      const restInterval = REST_STOP_INTERVAL_HOURS[allTripData.riderCalculated.staminaLevel];
      while (currentDayRidingTime < estimatedTimeHours) {
        currentDayRidingTime += restInterval;
        if (currentDayRidingTime < estimatedTimeHours) {
          const stopTime = `${String(timeOfDay + Math.floor(currentDayRidingTime)).padStart(2, '0')}:00 ${timeOfDay + Math.floor(currentDayRidingTime) < 12 ? 'AM' : 'PM'}`;
          const stopLocation = `Rest Area at ${Math.floor(currentDayDistanceCovered + (dailyDistance / (estimatedTimeHours / restInterval))).toFixed(0)}km`;

          // Randomly decide between rest, food, or scenic
          const stopTypeRoll = Math.random();
          if (stopTypeRoll < 0.4) { // 40% chance of rest
            stopPoints.push({ name: 'Short Rest Stop', type: 'Rest', location: stopLocation, time: stopTime });
          } else if (stopTypeRoll < 0.7) { // 30% chance of food
            stopPoints.push({ name: 'Lunch/Snack Break', type: 'Food', location: stopLocation, time: stopTime });
          } else if (allTripData.tripPreferences.comfortPriority === 'scenery' || Math.random() > 0.5) { // 30% chance of scenic
            stopPoints.push({ name: 'Scenic Viewpoint', type: 'Sightseeing', location: stopLocation, time: stopTime });
          }
          currentDayDistanceCovered += (dailyDistance / (estimatedTimeHours / restInterval));
        }
      }

      // Ensure at least one food stop if none generated
      if (!stopPoints.some(s => s.type === 'Food')) {
        stopPoints.push({ name: 'Lunch Break', type: 'Food', location: `Restaurant in ${destination}`, time: '01:00 PM' });
      }

      // Sort stop points by time
      stopPoints.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]);
        const timeB = parseInt(b.time.split(':')[0]);
        return timeA - timeB;
      });

      // --- Calculate Day-Specific Risk Level ---
      let dayRiskScore = 0;
      // Rider Fatigue & Stamina
      if (allTripData.riderCalculated.staminaLevel === 'Low') dayRiskScore += 3;
      if (estimatedTimeHours > 6 && allTripData.riderCalculated.staminaLevel === 'Moderate') dayRiskScore += 2;
      if (allTripData.riderProfile.recentFatigue === 'high') dayRiskScore += 5;

      // Vehicle Condition
      if (allTripData.vehicleCalculated.maintenanceUrgency === 'high' || allTripData.vehicleCalculated.maintenanceUrgency === 'critical') dayRiskScore += 4;
      if (allTripData.vehicleRecommendation.overallVehicleSentiment === 'warning') dayRiskScore += 5;

      // Terrain
      if (dayTerrain.includes('off-road') && allTripData.riderProfile.terrainAdaptability === 'low') dayRiskScore += 5;
      if (dayTerrain.includes('Winding') && allTripData.riderProfile.ridingStyle === 'Aggressive') dayRiskScore += 3;

      // External Factors
      if (allTripData.externalFactors.weatherForecast === 'rainy' || allTripData.externalFactors.weatherForecast === 'windy') dayRiskScore += 4;
      if (allTripData.externalFactors.roadConditions === 'rough' || allTripData.externalFactors.roadConditions === 'patchy') dayRiskScore += 3;
      if (allTripData.externalFactors.trafficDensity === 'high') dayRiskScore += 2;

      let riskLevel = 'Low';
      if (dayRiskScore >= 10) riskLevel = 'Critical';
      else if (dayRiskScore >= 7) riskLevel = 'High';
      else if (dayRiskScore >= 4) riskLevel = 'Moderate';

      // --- Generate Day-Specific Tips ---
      let dayTips = [];
      dayTips.push(`Prepare for ${dayTerrain} terrain.`);
      if (estimatedTimeHours > 5) dayTips.push('This is a longer riding day, ensure you take ample rest breaks.');
      if (riskLevel === 'High' || riskLevel === 'Critical') dayTips.push(`🚨 High risk detected for this day. Exercise extreme caution, especially with ${allTripData.externalFactors.weatherForecast} weather and ${allTripData.externalFactors.roadConditions} roads.`);
      if (dayTerrain.includes('off-road') && allTripData.vehicleSpecs.groundClearance < 180) dayTips.push('Your vehicle might have limited ground clearance for off-road sections. Ride carefully.');
      if (dayTerrain.includes('Winding') && allTripData.vehicleSpecs.brakeType !== 'ABS') dayTips.push('Be extra cautious on winding roads without ABS. Maintain safe speeds.');
      if (allTripData.riderProfile.hydrationLitres < 2.5) dayTips.push('Remember to hydrate frequently throughout the day.');
      if (allTripData.riderProfile.sleepHours < 7) dayTips.push('Ensure you get enough sleep before this day\'s ride.');
      if (allTripData.vehicleCalculated.estimatedRange < dailyDistance * 1.2) dayTips.push('Fuel stop is critical today, monitor your tank closely.');


      generatedPlan.push({
        id: generateUniqueId(), // Unique ID for each day
        day: dayNum,
        date: dayDate,
        startLocation,
        destination,
        distanceKm: parseFloat(dailyDistance.toFixed(0)),
        estimatedTimeHours: parseFloat(estimatedTimeHours.toFixed(1)),
        terrain: dayTerrain,
        riskLevel,
        stopPoints,
        dayTips: dayTips.join(' '),
      });

      currentLocation = destination; // Set next day's start as this day's end
    }

    // --- 3. Generate Overall Trip Recommendations ---
    let totalTripRiskScore = 0;
    let totalTripDistance = 0;
    let totalRidingHours = 0;
    generatedPlan.forEach(day => {
      totalTripDistance += day.distanceKm;
      totalRidingHours += day.estimatedTimeHours;
      // Convert riskLevel to score: Low=1, Moderate=2, High=3, Critical=4
      totalTripRiskScore += (day.riskLevel === 'Low' ? 1 : day.riskLevel === 'Moderate' ? 2 : day.riskLevel === 'High' ? 3 : 4);
    });

    const avgTripRiskScore = totalTripRiskScore / tripDurationDays;
    let overallSentimentFinal = 'positive';
    let overallCoachTipsFinal = [];
    let overallRiskAlertFinal = [];

    // General sentiment based on average risk
    if (avgTripRiskScore >= 3.5) {
      overallSentimentFinal = 'warning';
      overallRiskAlertFinal.push('🚨 This trip has a high overall risk profile. Reconsider sections or prepare extensively.');
    } else if (avgTripRiskScore >= 2.5) {
      overallSentimentFinal = 'cautionary';
      overallRiskAlertFinal.push('⚠️ Be cautious! This trip has moderate risks. Pay close attention to daily alerts.');
    } else {
      overallSentimentFinal = 'positive';
      overallRiskAlertFinal.push('This trip looks good with manageable risks. Enjoy the ride!');
    }

    // Combine rider and vehicle context recommendations
    overallCoachTipsFinal.push(riderRecommendationFromContext.coachTips);
    overallCoachTipsFinal.push(vehicleRecommendationFromContext.performanceTips);
    overallCoachTipsFinal.push(vehicleRecommendationFromContext.maintenanceTips);

    overallRiskAlertFinal.push(riderRecommendationFromContext.riskAlert);
    overallRiskAlertFinal.push(vehicleRecommendationFromContext.safetyAlerts);

    // Add trip-specific overall tips
    overallCoachTipsFinal.push(`Your total trip distance is approximately ${totalTripDistance} km over ${tripDurationDays} days, with about ${totalRidingHours.toFixed(1)} hours of riding.`);
    if (allTripData.riderProfile.pillion) {
      overallCoachTipsFinal.push('Remember to account for the pillion and luggage in your riding style and braking.');
    }
    if (allTripData.vehicleCalculated.terrainSuitabilityVerdict.includes('Primarily for paved roads') && allTripData.tripPreferences.expectedTerrain.includes('off-road')) {
      overallCoachTipsFinal.push('Your bike is primarily for paved roads, so exercise extreme caution on any off-road sections planned.');
    }
    if (allTripData.tripPreferences.desiredPace === 'fast' && allTripData.riderCalculated.staminaLevel === 'Low') {
      overallRiskAlertFinal.push('Mismatch between desired fast pace and low rider stamina. This significantly increases fatigue risk.');
      overallSentimentFinal = 'warning';
    }
    if (allTripData.tripPreferences.weatherTolerance === 'fair-weather-only' && allTripData.externalFactors.weatherForecast !== 'clear') {
      overallRiskAlertFinal.push(`Your weather tolerance is 'fair-weather-only' but the forecast is ${allTripData.externalFactors.weatherForecast}. Reconsider trip dates or prepare for adverse conditions.`);
      overallSentimentFinal = 'warning';
    }


    setGeneratedItineraryPlan(generatedPlan);
    setOverallTripSentiment(overallSentimentFinal);
    setOverallTripCoachTips(overallCoachTipsFinal.join(' '));
    setOverallTripRiskAlert(overallRiskAlertFinal.join(' '));

    // Update the RiderContext with the generated plan and overall trip recommendations
    setGeneratedRecommendation({
      generatedPlan: generatedPlan,
      overallSentiment: overallSentimentFinal,
      coachTips: overallTripCoachTips,
      riskAlert: overallTripRiskAlert,
    });

    setIsGenerating(false);
  }, [
    riderProfile, tripPreferences, externalFactors, vehicleSpecs, vehicleCondition,
    riderRecommendationFromContext, vehicleRecommendationFromContext, vehicleCalculatedMetrics,
    setGeneratedRecommendation,
  ]);

  // Handle saving the generated itinerary
  const handleSaveItinerary = async () => {
    if (!generatedItineraryPlan || generatedItineraryPlan.length === 0) {
      setGenerationError('No itinerary generated to save. Please generate one first.');
      return;
    }

    // Assemble the full itinerary data from all contexts for saving
    const itineraryDataToSave = {
      // userId: auth.user._id, // Will come from AuthContext later
      riderProfile: riderProfile,
      vehicleSpecs: vehicleSpecs,
      vehicleCondition: vehicleCondition,
      tripPreferences: tripPreferences,
      externalFactors: externalFactors,
      generatedPlan: generatedItineraryPlan, // Use the locally generated plan
      overallRecommendation: { // Use the locally calculated overall trip recommendations
        coachTips: overallTripCoachTips,
        riskAlert: overallTripRiskAlert,
        overallSentiment: overallTripSentiment,
      },
      itineraryName: `Ride to ${generatedItineraryPlan[0]?.destination || 'Unnamed Trip'} - ${new Date().toLocaleDateString()}`,
    };

    const saved = await saveItinerary(itineraryDataToSave);
    if (saved) {
      alert('Itinerary saved successfully!'); // Replace with a Modal or Toast notification
    }
  };

  // Determine if AI specs for vehicle are loaded (needed for generating plan)
  const areVehicleSpecsLoaded = vehicleSpecs.engineCC !== null && vehicleSpecs.vehicleWeight !== null && vehicleSpecs.fuelEfficiency !== null;
  // Determine if rider profile is sufficiently complete (needed for generating plan)
  const isRiderProfileComplete = riderProfile.name && riderProfile.age && riderProfile.height && riderProfile.weight;

  // Check if a plan has been generated
  const hasGeneratedPlan = generatedItineraryPlan && generatedItineraryPlan.length > 0;

  return (
    <MainLayout pageTitle="AI Trip Itinerary">
      <div className="max-w-3xl mx-auto">
        {(isLoadingRider || isLoadingVehicle || isGenerating || isSavingItinerary) && <LoadingSpinner size="lg" className="my-8" />}
        {(errorRider || errorVehicle || generationError || saveItineraryError) && (
          <ErrorMessage
            message={errorRider || errorVehicle || generationError || saveItineraryError}
            onClose={() => {
              // Clear specific error based on which one is active
              if (errorRider) { /* handle clearing rider error in RiderContext */ }
              if (errorVehicle) { /* handle clearing vehicle error in VehicleContext */ }
              if (generationError) { setGenerationError(null); }
              if (saveItineraryError) { /* handle clearing save error in TripContext */ }
            }}
          />
        )}

        {/* Generate Itinerary Section */}
        <Card title="Generate Your Ride Plan">
          <p className="text-gray-600 mb-4">
            Click the button below to generate a personalized trip itinerary based on your rider profile, vehicle details, and trip preferences.
          </p>
          <Button
            onClick={generateAITripPlan}
            disabled={isGenerating || !isRiderProfileComplete || !areVehicleSpecsLoaded}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate AI Itinerary'}
          </Button>
          {(!isRiderProfileComplete || !areVehicleSpecsLoaded) && (
            <p className="text-sm text-yellow-600 mt-2 text-center">
              Please complete your <Link to="/rider-setup" className="underline font-semibold">Rider Profile</Link> and <Link to="/vehicle-setup" className="underline font-semibold">Vehicle Setup</Link> first to enable itinerary generation.
            </p>
          )}
        </Card>

        {/* Display Generated Itinerary */}
        {hasGeneratedPlan && (
          <Card title="Your Generated Trip Plan" className="mt-6">
            {/* Overall Trip Sentiment */}
            <h3 className="text-md font-semibold text-gray-800 mb-2">Overall Trip Sentiment:
              <span className={`ml-2 font-bold ${
                overallTripSentiment === 'warning' ? 'text-red-600' :
                overallTripSentiment === 'cautionary' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {overallTripSentiment.toUpperCase()}
              </span>
            </h3>

            {overallTripRiskAlert && (
              <ErrorMessage message={overallTripRiskAlert} type={
                overallTripSentiment === 'warning' ? 'error' : 'warning'
              } className="mb-4" />
            )}

            {overallTripCoachTips && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Coach's Advice:</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{overallTripCoachTips}</p>
              </div>
            )}

            {/* Day-wise Plan */}
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Day-by-Day Breakdown:</h4>
            <div className="space-y-4">
              {generatedItineraryPlan.map((day, index) => (
                <div key={day.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                  <h5 className="text-lg font-semibold text-blue-700 mb-2">Day {day.day}: {day.startLocation} to {day.destination}</h5>
                  <ListItem label="Date" value={day.date} />
                  <ListItem label="Distance" value={`${day.distanceKm} km`} />
                  <ListItem label="Est. Riding Time" value={`${day.estimatedTimeHours} hours`} />
                  <ListItem label="Terrain" value={day.terrain} />
                  <ListItem label="Risk Level" value={day.riskLevel} />
                  {day.stopPoints && day.stopPoints.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-gray-600 mb-1">Planned Stops:</h6>
                      <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                        {day.stopPoints.map((stop, sIndex) => (
                          <li key={sIndex}>
                            <span className="font-semibold">{stop.name}</span> ({stop.type}) at {stop.time}
                            {stop.location && ` (${stop.location})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {day.dayTips && (
                    <div className="mt-3 text-sm text-gray-600 italic border-t border-gray-200 pt-2">
                      <span className="font-semibold">Day Tips:</span> {day.dayTips}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Placeholder for Map Integration */}
            <Card title="Route Map (Coming Soon!)" className="mt-6 bg-blue-50 border-blue-200">
              <p className="text-blue-700 text-center">
                A detailed interactive map of your itinerary will appear here.
                We're integrating real-time routing from Mapbox/ORS API.
              </p>
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mt-4">
                <span className="text-xl">🗺️ Map Placeholder 🗺️</span>
              </div>
            </Card>

            {/* Save Itinerary Button */}
            <Button
              onClick={handleSaveItinerary}
              disabled={isSavingItinerary || isGenerating}
              variant="primary"
              size="lg"
              className="w-full mt-6"
            >
              {isSavingItinerary ? 'Saving...' : 'Save This Itinerary'}
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AIItinerary;
