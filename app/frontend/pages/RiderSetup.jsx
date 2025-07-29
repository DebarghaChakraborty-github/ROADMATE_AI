import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { useRider } from '../context/RiderContext';
import Input from '../components/Input';
import Select from '../components/Select';
import ToggleSwitch from '../components/ToggleSwitch';
import RadioGroup from '../components/RadioGroup';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Options for various select/radio fields
const ridingStyleOptions = [
  { value: 'Aggressive', label: 'Aggressive' },
  { value: 'Scenic', label: 'Scenic' },
  { value: 'Fuel-saving', label: 'Fuel-saving' },
  { value: 'Balanced', label: 'Balanced' },
];

const pillionGenderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const terrainAdaptabilityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const recentFatigueOptions = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const fitnessLevelOptions = [
  { value: 'low', label: 'Low' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'athletic', label: 'Athletic' },
];

const dietQualityOptions = [
  { value: 'poor', label: 'Poor' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
];

const desiredPaceOptions = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'fast', label: 'Fast' },
];

const expectedTerrainOptions = [
  { value: 'highway', label: 'Highway' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'off-road', label: 'Off-road' },
];

const comfortPriorityOptions = [
  { value: 'speed', label: 'Speed' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'scenery', label: 'Scenery' },
  { value: 'balance', label: 'Balance' },
];

const weatherToleranceOptions = [
  { value: 'any', label: 'Any Weather' },
  { value: 'moderate', label: 'Moderate (light rain/wind)' },
  { value: 'fair-weather-only', label: 'Fair Weather Only' },
];

const roadConditionsOptions = [
  { value: 'good', label: 'Good' },
  { value: 'patchy', label: 'Patchy' },
  { value: 'rough', label: 'Rough' },
  { value: 'off-road', label: 'Off-road' },
];

const weatherForecastOptions = [
  { value: 'clear', label: 'Clear' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'windy', label: 'Windy' },
  { value: 'hot', label: 'Hot' },
  { value: 'cold', label: 'Cold' },
];

const trafficDensityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const RiderSetup = () => {
  const {
    riderProfile,
    updateRiderProfile,
    tripPreferences,
    updateTripPreferences,
    externalFactors,
    updateExternalFactors,
    isLoadingRider,
    errorRider,
    resetRiderContext, // In case we need to clear data
  } = useRider();

  // Local state to manage form inputs before submitting to context
  const [formData, setFormData] = useState({
    // Rider Profile
    name: riderProfile.name,
    age: riderProfile.age || '',
    height: riderProfile.height || '',
    weight: riderProfile.weight || '',
    experienceYears: riderProfile.experienceYears || '',
    ridingStyle: riderProfile.ridingStyle,
    preferredDailyDistance: riderProfile.preferredDailyDistance || '',
    pillion: riderProfile.pillion,
    pillionGender: riderProfile.pillionGender,
    luggageWeight: riderProfile.luggageWeight || '',
    hasHardLuggage: riderProfile.hasHardLuggage,
    sleepHours: riderProfile.sleepHours || '',
    hydrationLitres: riderProfile.hydrationLitres || '',
    terrainAdaptability: riderProfile.terrainAdaptability,
    recentFatigue: riderProfile.recentFatigue,
    fitnessLevel: riderProfile.fitnessLevel,
    dietQuality: riderProfile.dietQuality,

    // Trip Preferences
    desiredPace: tripPreferences.desiredPace,
    tripDurationDays: tripPreferences.tripDurationDays || '',
    expectedTerrain: tripPreferences.expectedTerrain,
    comfortPriority: tripPreferences.comfortPriority,
    weatherTolerance: tripPreferences.weatherTolerance,

    // External Factors
    roadConditions: externalFactors.roadConditions,
    weatherForecast: externalFactors.weatherForecast,
    trafficDensity: externalFactors.trafficDensity,
  });

  // Effect to sync context data to local form data when context changes (e.g., on initial load)
  useEffect(() => {
    setFormData({
      name: riderProfile.name,
      age: riderProfile.age || '',
      height: riderProfile.height || '',
      weight: riderProfile.weight || '',
      experienceYears: riderProfile.experienceYears || '',
      ridingStyle: riderProfile.ridingStyle,
      preferredDailyDistance: riderProfile.preferredDailyDistance || '',
      pillion: riderProfile.pillion,
      pillionGender: riderProfile.pillionGender,
      luggageWeight: riderProfile.luggageWeight || '',
      hasHardLuggage: riderProfile.hasHardLuggage,
      sleepHours: riderProfile.sleepHours || '',
      hydrationLitres: riderProfile.hydrationLitres || '',
      terrainAdaptability: riderProfile.terrainAdaptability,
      recentFatigue: riderProfile.recentFatigue,
      fitnessLevel: riderProfile.fitnessLevel,
      dietQuality: riderProfile.dietQuality,

      desiredPace: tripPreferences.desiredPace,
      tripDurationDays: tripPreferences.tripDurationDays || '',
      expectedTerrain: tripPreferences.expectedTerrain,
      comfortPriority: tripPreferences.comfortPriority,
      weatherTolerance: tripPreferences.weatherTolerance,

      roadConditions: externalFactors.roadConditions,
      weatherForecast: externalFactors.weatherForecast,
      trafficDensity: externalFactors.trafficDensity,
    });
  }, [riderProfile, tripPreferences, externalFactors]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleChange = (name) => (checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update RiderContext with the new form data
    updateRiderProfile({
      name: formData.name,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      experienceYears: Number(formData.experienceYears),
      ridingStyle: formData.ridingStyle,
      preferredDailyDistance: Number(formData.preferredDailyDistance),
      pillion: formData.pillion,
      pillionGender: formData.pillion ? formData.pillionGender : '', // Clear gender if no pillion
      luggageWeight: Number(formData.luggageWeight),
      hasHardLuggage: formData.hasHardLuggage,
      sleepHours: Number(formData.sleepHours),
      hydrationLitres: Number(formData.hydrationLitres),
      terrainAdaptability: formData.terrainAdaptability,
      recentFatigue: formData.recentFatigue,
      fitnessLevel: formData.fitnessLevel,
      dietQuality: formData.dietQuality,
    });
    updateTripPreferences({
      desiredPace: formData.desiredPace,
      tripDurationDays: Number(formData.tripDurationDays),
      expectedTerrain: formData.expectedTerrain,
      comfortPriority: formData.comfortPriority,
      weatherTolerance: formData.weatherTolerance,
    });
    updateExternalFactors({
      roadConditions: formData.roadConditions,
      weatherForecast: formData.weatherForecast,
      trafficDensity: formData.trafficDensity,
    });

    // In a real app, you might navigate to the next setup page or a dashboard
    // For now, we'll just log success.
    console.log('Rider profile and trip preferences updated in context!');
    // Example: navigate('/vehicle-setup'); // Assuming you have react-router-dom history/navigate
  };

  return (
    <MainLayout pageTitle="Rider Profile Setup">
      <div className="max-w-xl mx-auto"> {/* Center content and limit width */}
        {isLoadingRider && <LoadingSpinner size="lg" className="my-8" />}
        {errorRider && <ErrorMessage message={errorRider} onClose={() => { /* handle error dismissal */ }} />}

        <form onSubmit={handleSubmit} className="space-y-6"> {/* Add vertical spacing between cards */}

          {/* Rider Personal Details */}
          <Card title="Your Personal Details">
            <Input
              label="Your Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
            <Input
              label="Age (Years)"
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 30"
              required
              min="18"
              max="99"
            />
            <Input
              label="Height (cm)"
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g., 175"
              required
              min="100"
              max="250"
            />
            <Input
              label="Weight (kg)"
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g., 70"
              required
              min="30"
              max="200"
            />
            <Input
              label="Riding Experience (Years)"
              id="experienceYears"
              name="experienceYears"
              type="number"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="e.g., 5"
              required
              min="0"
              max="80"
            />
            <Select
              label="Preferred Riding Style"
              id="ridingStyle"
              name="ridingStyle"
              value={formData.ridingStyle}
              onChange={handleChange}
              options={ridingStyleOptions}
              placeholder="Choose your style"
              required
            />
            <Input
              label="Preferred Daily Distance (km)"
              id="preferredDailyDistance"
              name="preferredDailyDistance"
              type="number"
              value={formData.preferredDailyDistance}
              onChange={handleChange}
              placeholder="e.g., 250"
              required
              min="50"
              max="1000"
            />
          </Card>

          {/* Pillion & Luggage Details */}
          <Card title="Pillion & Luggage">
            <ToggleSwitch
              label="Riding with a Pillion?"
              id="pillion"
              name="pillion"
              checked={formData.pillion}
              onChange={handleToggleChange('pillion')}
            />
            {formData.pillion && (
              <RadioGroup
                label="Pillion Gender"
                name="pillionGender"
                options={pillionGenderOptions}
                selectedValue={formData.pillionGender}
                onChange={handleChange}
                required
                className="mt-4"
              />
            )}
            <Input
              label="Estimated Luggage Weight (kg)"
              id="luggageWeight"
              name="luggageWeight"
              type="number"
              value={formData.luggageWeight}
              onChange={handleChange}
              placeholder="e.g., 10"
              required
              min="0"
              max="100"
            />
            <ToggleSwitch
              label="Using Hard Luggage (Panniers/Top Box)?"
              id="hasHardLuggage"
              name="hasHardLuggage"
              checked={formData.hasHardLuggage}
              onChange={handleToggleChange('hasHardLuggage')}
            />
          </Card>

          {/* Rider Health & Preparedness */}
          <Card title="Your Health & Preparedness">
            <Input
              label="Average Sleep Hours (per night)"
              id="sleepHours"
              name="sleepHours"
              type="number"
              value={formData.sleepHours}
              onChange={handleChange}
              placeholder="e.g., 7"
              required
              min="4"
              max="12"
            />
            <Input
              label="Average Hydration (Litres/day)"
              id="hydrationLitres"
              name="hydrationLitres"
              type="number"
              value={formData.hydrationLitres}
              onChange={handleChange}
              placeholder="e.g., 2.5"
              step="0.1"
              required
              min="0.5"
              max="5"
            />
            <Select
              label="Comfort with Varied Terrain"
              id="terrainAdaptability"
              name="terrainAdaptability"
              value={formData.terrainAdaptability}
              onChange={handleChange}
              options={terrainAdaptabilityOptions}
              placeholder="Select level"
              required
            />
            <Select
              label="Recent Fatigue Level"
              id="recentFatigue"
              name="recentFatigue"
              value={formData.recentFatigue}
              onChange={handleChange}
              options={recentFatigueOptions}
              placeholder="Select level"
              required
            />
            <Select
              label="Fitness Level"
              id="fitnessLevel"
              name="fitnessLevel"
              value={formData.fitnessLevel}
              onChange={handleChange}
              options={fitnessLevelOptions}
              placeholder="Select level"
              required
            />
            <Select
              label="Diet Quality"
              id="dietQuality"
              name="dietQuality"
              value={formData.dietQuality}
              onChange={handleChange}
              options={dietQualityOptions}
              placeholder="Select quality"
              required
            />
          </Card>

          {/* Trip Preferences */}
          <Card title="Your Trip Preferences">
            <Select
              label="Desired Trip Pace"
              id="desiredPace"
              name="desiredPace"
              value={formData.desiredPace}
              onChange={handleChange}
              options={desiredPaceOptions}
              placeholder="Select pace"
              required
            />
            <Input
              label="Trip Duration (Days)"
              id="tripDurationDays"
              name="tripDurationDays"
              type="number"
              value={formData.tripDurationDays}
              onChange={handleChange}
              placeholder="e.g., 3"
              required
              min="1"
              max="30"
            />
            <Select
              label="Expected Terrain Type"
              id="expectedTerrain"
              name="expectedTerrain"
              value={formData.expectedTerrain}
              onChange={handleChange}
              options={expectedTerrainOptions}
              placeholder="Select terrain"
              required
            />
            <Select
              label="Trip Comfort Priority"
              id="comfortPriority"
              name="comfortPriority"
              value={formData.comfortPriority}
              onChange={handleChange}
              options={comfortPriorityOptions}
              placeholder="Select priority"
              required
            />
            <Select
              label="Weather Tolerance"
              id="weatherTolerance"
              name="weatherTolerance"
              value={formData.weatherTolerance}
              onChange={handleChange}
              options={weatherToleranceOptions}
              placeholder="Select tolerance"
              required
            />
          </Card>

          {/* Current External Factors */}
          <Card title="Current External Factors">
            <Select
              label="Current Road Conditions"
              id="roadConditions"
              name="roadConditions"
              value={formData.roadConditions}
              onChange={handleChange}
              options={roadConditionsOptions}
              placeholder="Select condition"
              required
            />
            <Select
              label="Weather Forecast"
              id="weatherForecast"
              name="weatherForecast"
              value={formData.weatherForecast}
              onChange={handleChange}
              options={weatherForecastOptions}
              placeholder="Select forecast"
              required
            />
            <Select
              label="Traffic Density"
              id="trafficDensity"
              name="trafficDensity"
              value={formData.trafficDensity}
              onChange={handleChange}
              options={trafficDensityOptions}
              placeholder="Select density"
              required
            />
          </Card>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
            Save Rider Profile & Preferences
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default RiderSetup;
