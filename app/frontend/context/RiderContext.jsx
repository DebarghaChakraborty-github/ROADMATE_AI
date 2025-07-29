import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assuming a backend for vehicle data or future AI calls

// Create Context for Rider and Vehicle data, and associated functions
const RiderContext = createContext();

// Utility function for deep merging objects (reused across contexts)
const deepMerge = (target, source) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};

// Provider Component that encapsulates all rider and vehicle logic
export const RiderProvider = ({ children }) => {
  // --- Core State Management ---

  // Rider Profile State: Comprehensive details about the rider
  const [riderProfile, setRiderProfile] = useState({
    name: '',
    age: null,
    height: null, // in cm
    weight: null, // in kg
    experienceYears: 0,
    ridingStyle: 'Balanced', // 'Aggressive', 'Scenic', 'Fuel-saving', 'Balanced'
    preferredDailyDistance: 250, // typical km/day rider aims for
    pillion: false,
    pillionGender: '', // 'Male', 'Female', or '' if no pillion
    luggageWeight: 0, // in kg
    hasHardLuggage: false, // panniers, top box
    sleepHours: 7, // avg hours of sleep per night
    hydrationLitres: 2.5, // avg water intake per day
    terrainAdaptability: 'moderate', // rider comfort with off-road: 'low', 'moderate', 'high'
    recentFatigue: 'none', // 'none', 'mild', 'moderate', 'high'
    fitnessLevel: 'average', // 'low', 'average', 'good', 'athletic'
    dietQuality: 'average', // 'poor', 'average', 'good', 'excellent'

    // Calculated fields (derived from above inputs)
    bmi: null,
    bmiCategory: '', // 'Underweight', 'Normal', 'Overweight', 'Obese'
    staminaScore: null, // 0-100
    staminaLevel: '', // 'Low', 'Moderate', 'High', 'Excellent'
    totalLoad: null, // rider + pillion + luggage + hard luggage weight in kg
  });

  // Trip Preferences State: Goals and conditions for the upcoming trip
  const [tripPreferences, setTripPreferences] = useState({
    desiredPace: 'moderate', // 'relaxed', 'moderate', 'fast'
    tripDurationDays: 1, // number of days for the trip
    expectedTerrain: 'mixed', // 'highway', 'mixed', 'off-road'
    comfortPriority: 'balance', // 'speed', 'comfort', 'scenery', 'balance'
    weatherTolerance: 'moderate', // 'any', 'moderate', 'fair-weather-only'
  });

  // External Factors State: Simulated or actual real-time conditions
  const [externalFactors, setExternalFactors] = useState({
    roadConditions: 'good', // 'good', 'patchy', 'rough', 'off-road'
    weatherForecast: 'clear', // 'clear', 'rainy', 'windy', 'hot', 'cold'
    trafficDensity: 'low', // 'low', 'moderate', 'high'
  });

  // Recommendation and Alert State: Outputs for the user based on rider profile and trip context
  const [recommendation, setRecommendation] = useState({
    coachTips: '', // General advice for the rider
    riskAlert: '', // Warnings about potential risks
    overallSentiment: 'neutral', // 'positive', 'neutral', 'cautionary', 'warning'
    // Placeholder for AI generated itinerary plan (will be populated by AI engine)
    generatedPlan: [],
  });

  // UI/API State for this context
  const [isLoadingRider, setIsLoadingRider] = useState(false);
  const [errorRider, setErrorRider] = useState(null);

  // --- Core Calculation Functions ---

  /**
   * Calculates Body Mass Index (BMI).
   * @param {number} height - Height in centimeters.
   * @param {number} weight - Weight in kilograms.
   * @returns {number|null} BMI value or null if inputs are invalid.
   */
  const calculateBMI = useCallback((height, weight) => {
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const hMeters = height / 100; // Convert cm to meters
    return parseFloat((weight / (hMeters * hMeters)).toFixed(1));
  }, []);

  /**
   * Classifies BMI into categories.
   * @param {number|null} bmi - BMI value.
   * @returns {string} BMI category.
   */
  const classifyBMI = useCallback((bmi) => {
    if (bmi === null) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }, []);

  /**
   * Estimates Rider Stamina Score (0-100) and Level.
   * Incorporates age, BMI, sleep, hydration, experience, riding style, terrain adaptability,
   * recent fatigue, and fitness level.
   * @param {object} riderData - Subset of riderProfile relevant for stamina.
   * @returns {{score: number, level: string}} Stamina score and level.
   */
  const estimateStamina = useCallback((riderData) => {
    let score = 50; // Base score

    // Age factor: Younger riders generally have higher stamina
    if (riderData.age < 30) score += 10;
    else if (riderData.age < 45) score += 5;
    else if (riderData.age > 60) score -= 15; // Significant drop for older riders

    // BMI factor: Optimal BMI contributes positively
    if (riderData.bmi >= 18.5 && riderData.bmi <= 24.9) score += 10;
    else if (riderData.bmi > 30) score -= 10; // Obese negatively impacts stamina
    else if (riderData.bmi < 18.5) score -= 5; // Underweight can also impact stamina

    // Sleep factor: Adequate sleep is crucial
    if (riderData.sleepHours >= 7 && riderData.sleepHours <= 9) score += 8;
    else if (riderData.sleepHours < 5) score -= 10;

    // Hydration factor: Good hydration is vital
    if (riderData.hydrationLitres >= 2.5) score += 7;
    else if (riderData.hydrationLitres < 1.5) score -= 8;

    // Experience factor: More experience can mean better stamina management
    score += Math.min(riderData.experienceYears * 1.5, 15); // Max 15 points from experience

    // Riding style: Aggressive can deplete stamina faster
    if (riderData.ridingStyle === 'Aggressive') score -= 5;
    else if (riderData.ridingStyle === 'Fuel-saving' || riderData.ridingStyle === 'Scenic') score += 3;

    // Terrain adaptability: Higher comfort with diverse terrains means less strain
    if (riderData.terrainAdaptability === 'high') score += 7;
    else if (riderData.terrainAdaptability === 'low') score -= 7;

    // Recent fatigue: Direct impact on current stamina
    if (riderData.recentFatigue === 'mild') score -= 5;
    else if (riderData.recentFatigue === 'moderate') score -= 10;
    else if (riderData.recentFatigue === 'high') score -= 20;

    // Fitness level: General fitness is a strong indicator
    if (riderData.fitnessLevel === 'athletic') score += 15;
    else if (riderData.fitnessLevel === 'good') score += 10;
    else if (riderData.fitnessLevel === 'low') score -= 10;

    // Diet quality: Good diet supports sustained energy
    if (riderData.dietQuality === 'excellent') score += 5;
    else if (riderData.dietQuality === 'poor') score -= 5;

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine human-friendly level
    let level = 'Moderate';
    if (score >= 85) level = 'Excellent';
    else if (score >= 70) level = 'High';
    else if (score < 40) level = 'Low';

    return { score, level };
  }, []);

  /**
   * Computes the total load on the vehicle (rider + pillion + luggage).
   * @param {object} loadData - Subset of riderProfile relevant for load.
   * @returns {number} Total load in kg.
   */
  const computeTotalLoad = useCallback((loadData) => {
    const baseRiderWeight = loadData.weight || 0;
    let pillionWeight = 0;
    if (loadData.pillion) {
      pillionWeight = loadData.pillionGender === 'Male' ? 75 : 55; // Avg male/female weight
    }
    const hardLuggageWeight = loadData.hasHardLuggage ? 12 : 0; // Avg weight of hard luggage itself
    return baseRiderWeight + pillionWeight + loadData.luggageWeight + hardLuggageWeight;
  }, []);

  /**
   * Generates a comprehensive risk assessment based on rider profile and trip factors.
   * Note: Vehicle-specific risks will be handled in VehicleContext or combined later.
   * @param {object} allRiderTripData - Combined rider, trip, and external factors.
   * @returns {{alert: string, sentiment: string}} Risk alert message and overall sentiment.
   */
  const generateRiderRiskAssessment = useCallback((allRiderTripData) => {
    const alerts = [];
    let sentiment = 'positive'; // Default sentiment

    // Rider-related risks
    if (allRiderTripData.staminaLevel === 'Low') {
      alerts.push('Rider stamina is low, increasing fatigue risk on longer rides.');
      sentiment = 'cautionary';
    } else if (allRiderTripData.staminaLevel === 'Excellent' && allRiderTripData.ridingStyle === 'Aggressive') {
      alerts.push('High stamina combined with aggressive style requires extra caution on speed and braking.');
    }

    if (allRiderTripData.bmiCategory === 'Obese' || allRiderTripData.bmiCategory === 'Underweight') {
      alerts.push(`Rider BMI is ${allRiderTripData.bmiCategory}, which can impact comfort and endurance.`);
      if (sentiment === 'positive') sentiment = 'neutral';
    }

    if (allRiderTripData.recentFatigue === 'high') {
      alerts.push('🚨 High rider fatigue detected. Postpone long rides or take extensive rest.');
      sentiment = 'warning';
    } else if (allRiderTripData.recentFatigue === 'moderate') {
      alerts.push('Moderate rider fatigue. Plan shorter rides and frequent breaks.');
      if (sentiment === 'positive') sentiment = 'neutral';
    }

    if (allRiderTripData.sleepHours < 6 || allRiderTripData.hydrationLitres < 1.5) {
      alerts.push('Inadequate sleep or hydration can severely impair riding ability and focus. Prioritize rest and water intake.');
      if (sentiment === 'positive' || sentiment === 'neutral') sentiment = 'cautionary';
    }

    // Trip and External factors risks (related to rider's preparedness)
    if (allRiderTripData.expectedTerrain === 'off-road' && allRiderTripData.terrainAdaptability === 'low') {
      alerts.push('Rider has low terrain adaptability for expected off-road conditions. Proceed with extreme caution or reconsider route.');
      if (sentiment === 'positive' || sentiment === 'neutral') sentiment = 'cautionary';
    }

    if (allRiderTripData.weatherForecast === 'rainy' && allRiderTripData.weatherTolerance === 'fair-weather-only') {
      alerts.push('Rainy weather forecast conflicts with rider preference. Consider rescheduling or preparing for wet conditions (appropriate gear).');
      if (sentiment === 'positive' || sentiment === 'neutral') sentiment = 'cautionary';
    } else if (allRiderTripData.weatherForecast === 'windy' || allRiderTripData.weatherForecast === 'hot' || allRiderTripData.weatherForecast === 'cold') {
      alerts.push(`Expected weather is ${allRiderTripData.weatherForecast}. Prepare for challenging riding conditions (e.g., wind gusts, heat exhaustion, hypothermia).`);
      if (sentiment === 'positive' || sentiment === 'neutral') sentiment = 'cautionary';
    }
    if (allRiderTripData.trafficDensity === 'high' && allRiderTripData.ridingStyle === 'Aggressive') {
      alerts.push('High traffic combined with aggressive riding style increases accident risk. Exercise patience and defensive riding.');
      if (sentiment === 'positive' || sentiment === 'neutral') sentiment = 'cautionary';
    }

    const finalAlert = alerts.length > 0 ? `🚨 Rider/Trip Risk: ${alerts.join(' ')}` : 'Rider and trip conditions look good!';
    return { alert: finalAlert, sentiment };
  }, []);


  /**
   * Generates personalized, coach-like recommendations for the rider.
   * This is where the "human-like" aspect comes in, combining various factors.
   * @param {object} allRiderTripData - Combined rider, trip, and external factors.
   * @returns {string} Comprehensive coach tips.
   */
  const generatePersonalizedRecommendation = useCallback((allRiderTripData) => {
    const tips = [];

    // --- Opening Statement ---
    tips.push(`Hello ${allRiderTripData.name || 'Rider'}! Let's get you ready for your journey.`);

    // --- Stamina and Endurance Guidance ---
    if (allRiderTripData.staminaLevel === 'Low') {
      tips.push(
        `Based on your profile, your stamina seems limited. For a ${allRiderTripData.tripDurationDays}-day trip, I highly recommend planning shorter daily distances, perhaps around 100-150km, with frequent breaks every 1.5-2 hours. Prioritize good sleep and consistent hydration.`
      );
    } else if (allRiderTripData.staminaLevel === 'High' || allRiderTripData.staminaLevel === 'Excellent') {
      tips.push(
        `Your stamina is impressive! You're well-equipped to handle longer days. You can comfortably aim for ${allRiderTripData.preferredDailyDistance || 300}km/day, but remember to still take short breaks to maintain focus.`
      );
    } else {
      tips.push(
        `Your stamina is moderate. Aim for a balanced approach: around 200-250km/day. Listen to your body and don't push yourself too hard, especially on the first day.`
      );
    }

    // --- Load guidance (Rider's personal load, vehicle load is in VehicleContext) ---
    if (allRiderTripData.totalLoad > 200) {
      tips.push(
        `Your personal load (rider + pillion + luggage) is quite heavy at ${allRiderTripData.totalLoad}kg. This will impact your bike's handling. Consider offloading non-essentials if possible.`
      );
    } else {
      tips.push('Your personal load is reasonable. Ensure luggage is securely fastened and weight is evenly distributed.');
    }

    // --- Riding Style and Safety ---
    if (allRiderTripData.ridingStyle === 'Aggressive') {
      tips.push(
        'Your aggressive riding style can be exhilarating, but remember to always prioritize safety. Maintain ample braking distance, especially in traffic or adverse conditions. Consider a defensive riding course if you haven\'t already.'
      );
    } else if (allRiderTripData.ridingStyle === 'Scenic') {
      tips.push(
        'Embrace your scenic riding style! Remember to keep an eye on the road, not just the views. Plan stops at beautiful spots to fully enjoy the scenery safely.'
      );
    } else if (allRiderTripData.ridingStyle === 'Fuel-saving') {
      tips.push(
        'Your fuel-saving style is smart! Maintain steady speeds and smooth acceleration/deceleration. This also contributes to a more relaxed ride and less fatigue.'
      );
    }

    // --- Terrain and Conditions (Rider's preparedness) ---
    if (allRiderTripData.expectedTerrain !== allRiderTripData.terrainAdaptability && allRiderTripData.terrainAdaptability === 'low') {
      tips.push(
        `You've indicated low comfort with varied terrain, but your trip expects ${allRiderTripData.expectedTerrain} conditions. Practice on similar terrains before your trip or adjust your route to avoid overly challenging sections.`
      );
    }

    // --- Health and Well-being ---
    if (allRiderTripData.fitnessLevel === 'low' || allRiderTripData.dietQuality === 'poor') {
      tips.push('For optimal riding performance and enjoyment, consider improving your general fitness and diet quality. Even small changes can make a big difference in your endurance and focus.');
    }
    if (allRiderTripData.sleepHours < 7) {
      tips.push(`You're aiming for ${allRiderTripData.sleepHours} hours of sleep. Try to get at least 7-8 hours, especially before long rides, to maximize alertness and minimize fatigue.`);
    }
    if (allRiderTripData.hydrationLitres < 2.5) {
      tips.push(`Your typical water intake is ${allRiderTripData.hydrationLitres} litres. Aim for at least 2.5-3 litres, especially on riding days, to stay well-hydrated and prevent fatigue.`);
    }

    // --- External Factors Integration (Rider's response) ---
    if (allRiderTripData.weatherForecast !== 'clear' || allRiderTripData.roadConditions !== 'good') {
      tips.push(
        `Heads up on the conditions: expect ${allRiderTripData.weatherForecast} weather and ${allRiderTripData.roadConditions} roads. Dress appropriately, check your gear, and adjust your riding pace accordingly. Safety first!`
      );
    }
    if (allRiderTripData.trafficDensity === 'high') {
      tips.push('Anticipate high traffic. Plan your departure to avoid peak hours if possible, or be prepared for slower, stop-and-go riding. Stay patient!');
    }

    // --- Closing Remarks ---
    tips.push('Remember, riding is about the journey as much as the destination. Stay safe, stay hydrated, and enjoy every moment!');

    return tips.join(' ');
  }, []);

  // --- State Update Handlers ---

  /**
   * Updates rider profile and recalculates derived metrics.
   * @param {object} input - Partial rider profile data.
   */
  const updateRiderProfile = useCallback((input) => {
    setRiderProfile(prev => {
      const merged = deepMerge({ ...prev }, input); // Use deepMerge for nested objects if any
      const bmi = calculateBMI(merged.height, merged.weight);
      const bmiCategory = classifyBMI(bmi);

      // Update and return the new state
      return {
        ...merged,
        bmi,
        bmiCategory,
        // Stamina and totalLoad will be calculated in the main useEffect
      };
    });
  }, [calculateBMI, classifyBMI]);

  /**
   * Updates trip preferences.
   * @param {object} input - Partial trip preferences data.
   */
  const updateTripPreferences = useCallback((input) => {
    setTripPreferences(prev => deepMerge({ ...prev }, input));
  }, []);

  /**
   * Updates external factors.
   * @param {object} input - Partial external factors data.
   */
  const updateExternalFactors = useCallback((input) => {
    setExternalFactors(prev => deepMerge({ ...prev }, input));
  }, []);

  /**
   * Updates the recommendation state, including generated plan.
   * This function would be called by the AI itinerary generation logic.
   * @param {object} newRecommendation - The new recommendation object including generatedPlan.
   */
  const setGeneratedRecommendation = useCallback((newRecommendation) => {
    setRecommendation(prev => deepMerge({ ...prev }, newRecommendation));
  }, []);

  /**
   * Resets all rider-related profiles to their initial state.
   */
  const resetRiderContext = useCallback(() => {
    setRiderProfile({
      name: '', age: null, height: null, weight: null, experienceYears: 0, ridingStyle: 'Balanced',
      preferredDailyDistance: 250, pillion: false, pillionGender: '', luggageWeight: 0, hasHardLuggage: false,
      sleepHours: 7, hydrationLitres: 2.5, terrainAdaptability: 'moderate', recentFatigue: 'none',
      fitnessLevel: 'average', dietQuality: 'average', bmi: null, bmiCategory: '', staminaScore: null,
      staminaLevel: '', totalLoad: null,
    });
    setTripPreferences({
      desiredPace: 'moderate', tripDurationDays: 1, expectedTerrain: 'mixed',
      comfortPriority: 'balance', weatherTolerance: 'moderate',
    });
    setExternalFactors({
      roadConditions: 'good', weatherForecast: 'clear', trafficDensity: 'low',
    });
    setRecommendation({ coachTips: '', riskAlert: '', overallSentiment: 'neutral', generatedPlan: [] });
    setErrorRider(null);
    setIsLoadingRider(false);
  }, []);

  // --- Main Effect Hook for Calculations and Recommendations ---
  useEffect(() => {
    // Combine all relevant data into a single object for comprehensive calculations
    const allRiderTripData = {
      ...riderProfile,
      ...tripPreferences,
      ...externalFactors,
    };

    // Recalculate derived rider metrics
    const { score: newStaminaScore, level: newStaminaLevel } = estimateStamina(allRiderTripData);
    const newTotalLoad = computeTotalLoad(allRiderTripData);

    // Update rider profile with new derived metrics
    setRiderProfile(prev => ({
      ...prev,
      staminaScore: newStaminaScore,
      staminaLevel: newStaminaLevel,
      totalLoad: newTotalLoad,
    }));

    // Generate rider-specific risk assessments
    const newRiderRiskAssessment = generateRiderRiskAssessment({
      ...allRiderTripData, // Pass all data including newly calculated ones
      staminaLevel: newStaminaLevel, // Ensure latest stamina is used
      totalLoad: newTotalLoad, // Ensure latest total load is used
    });

    // Generate personalized coach tips
    const newCoachTips = generatePersonalizedRecommendation({
      ...allRiderTripData, // Pass all data including newly calculated ones
      staminaLevel: newStaminaLevel,
      totalLoad: newTotalLoad,
    });

    // Update the recommendation state (only rider-specific parts here)
    // Note: generatedPlan will be set by the AI itinerary generation service
    setRecommendation(prev => ({
      ...prev,
      coachTips: newCoachTips,
      riskAlert: newRiderRiskAssessment.alert,
      overallSentiment: newRiderRiskAssessment.sentiment,
    }));

    // Debugging: Log state changes
    console.log('--- RiderContext State Recalculated & Updated ---');
    console.log('Rider Profile:', riderProfile);
    console.log('Trip Preferences:', tripPreferences);
    console.log('External Factors:', externalFactors);
    console.log('Recommendations (Rider):', recommendation);
    console.log('------------------------------------------------');

  }, [
    // Dependencies for useEffect: whenever any of these change, recalculate
    riderProfile.name, riderProfile.age, riderProfile.height, riderProfile.weight, riderProfile.experienceYears,
    riderProfile.ridingStyle, riderProfile.pillion, riderProfile.pillionGender,
    riderProfile.luggageWeight, riderProfile.hasHardLuggage, riderProfile.sleepHours,
    riderProfile.hydrationLitres, riderProfile.terrainAdaptability, riderProfile.recentFatigue,
    riderProfile.fitnessLevel, riderProfile.dietQuality, // Rider profile dependencies

    tripPreferences.desiredPace, tripPreferences.tripDurationDays, tripPreferences.expectedTerrain,
    tripPreferences.comfortPriority, tripPreferences.weatherTolerance, // Trip preferences dependencies

    externalFactors.roadConditions, externalFactors.weatherForecast, externalFactors.trafficDensity, // External factors dependencies

    // Include memoized functions as dependencies for useCallback, though their internal dependencies are already covered
    estimateStamina, computeTotalLoad, generateRiderRiskAssessment, generatePersonalizedRecommendation,
  ]);


  // --- Context Value ---
  const contextValue = {
    riderProfile,
    updateRiderProfile,
    tripPreferences,
    updateTripPreferences,
    externalFactors,
    updateExternalFactors,
    recommendation,
    setGeneratedRecommendation, // Expose this for AI itinerary to update
    isLoadingRider,
    errorRider,
    resetRiderContext,
  };

  // Provide the context value to children components
  return (
    <RiderContext.Provider value={contextValue}>
      {children}
    </RiderContext.Provider>
  );
};

// Hook for consuming the RiderContext in functional components
export const useRider = () => useContext(RiderContext);

export default RiderContext;
