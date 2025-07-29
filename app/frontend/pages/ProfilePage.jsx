import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../Layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { useVehicle } from '../context/VehicleContext';
import Card from '../components/Card';
import ListItem from '../components/ListItem';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal'; // For logout confirmation

const ProfilePage = () => {
  const { user, isAuthenticated, isLoadingAuth, logout, authError } = useAuth();
  const {
    riderProfile,
    tripPreferences,
    externalFactors,
    recommendation: riderRecommendation,
    isLoadingRider,
    errorRider,
    resetRiderContext, // Option to reset rider data
  } = useRider();
  const {
    vehicleSpecs,
    vehicleCondition,
    calculatedMetrics: vehicleCalculatedMetrics,
    vehicleRecommendation,
    isLoadingVehicle,
    errorVehicle,
    resetVehicleContext, // Option to reset vehicle data
  } = useVehicle();

  const navigate = useNavigate();
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showResetDataModal, setShowResetDataModal] = useState(false);
  const [resetDataType, setResetDataType] = useState(null); // 'rider' or 'vehicle'

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // --- Logout Logic ---
  const handleLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirmModal(false);
    // Redirection handled by AuthContext useEffect
  };

  const cancelLogout = () => {
    setShowLogoutConfirmModal(false);
  };

  // --- Reset Data Logic ---
  const handleResetData = (type) => {
    setResetDataType(type);
    setShowResetDataModal(true);
  };

  const confirmResetData = () => {
    if (resetDataType === 'rider') {
      resetRiderContext();
      console.log('Rider data reset.');
    } else if (resetDataType === 'vehicle') {
      resetVehicleContext();
      console.log('Vehicle data reset.');
    }
    setShowResetDataModal(false);
    setResetDataType(null);
  };

  const cancelResetData = () => {
    setShowResetDataModal(false);
    setResetDataType(null);
  };

  // --- Loading and Error States ---
  const showLoading = isLoadingAuth || isLoadingRider || isLoadingVehicle;
  const showError = authError || errorRider || errorVehicle;

  // Check if rider profile is complete enough to display summary
  const isRiderProfileComplete = riderProfile.name && riderProfile.age && riderProfile.height && riderProfile.weight;
  // Check if vehicle specs are complete enough to display summary
  const areVehicleSpecsLoaded = vehicleSpecs.engineCC !== null && vehicleSpecs.vehicleWeight !== null;


  // Helper to render a section of ListItems
  const renderListSection = (title, data, iconMap = {}) => (
    <div className="mb-4">
      <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => {
          // Format specific keys for better readability
          let displayValue = value;
          let displayLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // CamelCase to Title Case

          if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else if (Array.isArray(value)) {
            displayValue = value.length > 0 ? value.join(', ') : 'N/A';
          } else if (value === null || value === undefined || value === '') {
            displayValue = 'N/A';
          } else if (typeof value === 'number' && key.includes('Km')) {
            displayValue = `${value} km`;
          } else if (typeof value === 'number' && key.includes('Hours')) {
            displayValue = `${value} hours`;
          } else if (typeof value === 'number' && key.includes('Litres')) {
            displayValue = `${value} litres`;
          } else if (typeof value === 'number' && key.includes('Weight')) {
            displayValue = `${value} kg`;
          } else if (typeof value === 'number' && key.includes('Height')) {
            displayValue = `${value} cm`;
          } else if (typeof value === 'number' && key.includes('Pressure')) {
            displayValue = `${value} PSI`;
          } else if (typeof value === 'number' && key.includes('Health')) {
            displayValue = `${value}%`;
          } else if (key.includes('Date') && value) {
            try {
              displayValue = new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
            } catch {
              displayValue = value;
            }
          }

          return (
            <ListItem
              key={key}
              label={displayLabel}
              value={displayValue}
              icon={iconMap[key]}
            />
          );
        })}
      </div>
    </div>
  );

  if (showLoading) {
    return (
      <MainLayout pageTitle="Your Profile">
        <div className="flex justify-center items-center h-full min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (showError) {
    return (
      <MainLayout pageTitle="Your Profile">
        <div className="max-w-xl mx-auto p-4">
          <ErrorMessage message={showError} type="error" onClose={() => { /* Handle error dismissal */ }} />
          {!isAuthenticated && !isLoadingAuth && (
            <div className="mt-6 text-center">
              <Link to="/login">
                <Button variant="primary" size="md">
                  Login Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout pageTitle="Your Profile">
        <div className="max-w-xl mx-auto p-4 text-center">
          <Card title="Access Denied">
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <Link to="/login">
              <Button variant="primary" size="md">
                Login Now
              </Button>
            </Link>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Your Profile">
      <div className="max-w-3xl mx-auto p-4 space-y-6">

        {/* User Account Details Card */}
        <Card title="Account Information">
          <ListItem label="Username" value={user?.username || 'N/A'} icon="👤" />
          <ListItem label="Email" value={user?.email || 'N/A'} icon="📧" />
          <ListItem label="User ID" value={user?.id || 'N/A'} icon="🆔" />
          <div className="mt-6 flex justify-end">
            <Button onClick={handleLogout} variant="danger" size="md">
              Logout
            </Button>
          </div>
        </Card>

        {/* Rider Profile Summary Card */}
        <Card title="Your Rider Profile">
          {!isRiderProfileComplete ? (
            <div className="text-center text-gray-600 py-4">
              <p className="mb-4">Rider profile not fully set up.</p>
              <Link to="/rider-setup">
                <Button variant="secondary" size="sm">
                  Complete Rider Setup
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {renderListSection("Personal Details", {
                name: riderProfile.name,
                age: riderProfile.age,
                height: riderProfile.height,
                weight: riderProfile.weight,
                bmi: riderProfile.bmi,
                bmiCategory: riderProfile.bmiCategory,
                experienceYears: riderProfile.experienceYears,
                ridingStyle: riderProfile.ridingStyle,
                preferredDailyDistance: riderProfile.preferredDailyDistance,
              }, {
                name: '📝', age: '🎂', height: '📏', weight: '⚖️', bmi: '📊', bmiCategory: '🏷️',
                experienceYears: '⏳', ridingStyle: '🏍️', preferredDailyDistance: '🛣️'
              })}

              {renderListSection("Pillion & Luggage", {
                pillion: riderProfile.pillion,
                pillionGender: riderProfile.pillionGender,
                luggageWeight: riderProfile.luggageWeight,
                hasHardLuggage: riderProfile.hasHardLuggage,
                totalLoad: riderProfile.totalLoad,
              }, {
                pillion: '👫', pillionGender: '🚻', luggageWeight: '🎒', hasHardLuggage: '🧳', totalLoad: '⚖️'
              })}

              {renderListSection("Health & Preparedness", {
                sleepHours: riderProfile.sleepHours,
                hydrationLitres: riderProfile.hydrationLitres,
                terrainAdaptability: riderProfile.terrainAdaptability,
                recentFatigue: riderProfile.recentFatigue,
                fitnessLevel: riderProfile.fitnessLevel,
                dietQuality: riderProfile.dietQuality,
                staminaScore: riderProfile.staminaScore,
                staminaLevel: riderProfile.staminaLevel,
              }, {
                sleepHours: '😴', hydrationLitres: '💧', terrainAdaptability: '⛰️',
                recentFatigue: 'ired', fitnessLevel: '💪', dietQuality: '🍎',
                staminaScore: '⚡', staminaLevel: '📈'
              })}

              {renderListSection("Trip Preferences", {
                desiredPace: tripPreferences.desiredPace,
                tripDurationDays: tripPreferences.tripDurationDays,
                expectedTerrain: tripPreferences.expectedTerrain,
                comfortPriority: tripPreferences.comfortPriority,
                weatherTolerance: tripPreferences.weatherTolerance,
              }, {
                desiredPace: '💨', tripDurationDays: '📆', expectedTerrain: '🏞️',
                comfortPriority: '🛋️', weatherTolerance: '☀️'
              })}

              {renderListSection("Current External Factors", {
                roadConditions: externalFactors.roadConditions,
                weatherForecast: externalFactors.weatherForecast,
                trafficDensity: externalFactors.trafficDensity,
              }, {
                roadConditions: '🚧', weatherForecast: '☁️', trafficDensity: '🚗'
              })}

              <div className="mt-6">
                <h4 className="font-semibold text-md text-gray-700 mb-2">Rider Recommendations:</h4>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{riderRecommendation.coachTips}</p>
                {riderRecommendation.riskAlert && (
                  <ErrorMessage message={riderRecommendation.riskAlert} type={
                    riderRecommendation.overallSentiment === 'warning' ? 'error' : 'warning'
                  } />
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => handleResetData('rider')} variant="secondary" size="sm">
                  Reset Rider Data
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Vehicle Profile Summary Card */}
        <Card title="Your Vehicle Profile">
          {!areVehicleSpecsLoaded ? (
            <div className="text-center text-gray-600 py-4">
              <p className="mb-4">Vehicle details not fully set up or fetched.</p>
              <Link to="/vehicle-setup">
                <Button variant="secondary" size="sm">
                  Complete Vehicle Setup
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {renderListSection("Basic & AI Specs", {
                make: vehicleSpecs.make,
                model: vehicleSpecs.model,
                year: vehicleSpecs.year,
                engineCC: vehicleSpecs.engineCC,
                groundClearance: vehicleSpecs.groundClearance,
                vehicleWeight: vehicleSpecs.vehicleWeight,
                fuelTankCapacity: vehicleSpecs.fuelTankCapacity,
                fuelEfficiency: vehicleSpecs.fuelEfficiency,
                loadCapacity: vehicleSpecs.loadCapacity,
                tireType: vehicleSpecs.tireType,
                brakeType: vehicleSpecs.brakeType,
                suspensionType: vehicleSpecs.suspensionType,
                coolingSystem: vehicleSpecs.coolingSystem,
                transmissionType: vehicleSpecs.transmissionType,
                emissionStandard: vehicleSpecs.emissionStandard,
                hasABS: vehicleSpecs.hasABS,
                hasTractionControl: vehicleSpecs.hasTractionControl,
                hasQuickShifter: vehicleSpecs.hasQuickShifter,
                typicalTireLifespanKm: vehicleSpecs.typicalTireLifespanKm,
                typicalBrakePadLifespanKm: vehicleSpecs.typicalBrakePadLifespanKm,
                typicalChainLifespanKm: vehicleSpecs.typicalChainLifespanKm,
              }, {
                make: '🏭', model: '🏍️', year: '📅', engineCC: '⚙️', groundClearance: '⬆️',
                vehicleWeight: '⚖️', fuelTankCapacity: '⛽', fuelEfficiency: '🍃',
                loadCapacity: '📦', tireType: ' टायर', brakeType: '🛑', suspensionType: '🎢',
                coolingSystem: '❄️', transmissionType: '🕹️', emissionStandard: '💨',
                hasABS: '✅', hasTractionControl: '✅', hasQuickShifter: '✅',
                typicalTireLifespanKm: '🔄', typicalBrakePadLifespanKm: '🛞', typicalChainLifespanKm: '⛓️'
              })}

              {renderListSection("Current Condition", {
                currentOdometer: vehicleCondition.currentOdometer,
                tirePressureFront: vehicleCondition.tirePressureFront,
                tirePressureRear: vehicleCondition.tirePressureRear,
                tireWearLevelFront: vehicleCondition.tireWearLevelFront,
                tireWearLevelRear: vehicleCondition.tireWearLevelRear,
                brakePadWearFront: vehicleCondition.brakePadWearFront,
                brakePadWearRear: vehicleCondition.brakePadWearRear,
                brakeFluidLevel: vehicleCondition.brakeFluidLevel,
                chainLubeStatus: vehicleCondition.chainLubeStatus,
                chainTensionStatus: vehicleCondition.chainTensionStatus,
                oilLevelStatus: vehicleCondition.oilLevelStatus,
                coolantLevelStatus: vehicleCondition.coolantLevelStatus,
                batteryHealth: vehicleCondition.batteryHealth,
                headlightFunction: vehicleCondition.headlightFunction,
                taillightFunction: vehicleCondition.taillightFunction,
                turnSignalFunction: vehicleCondition.turnSignalFunction,
                hornFunction: vehicleCondition.hornFunction,
                mirrorCondition: vehicleCondition.mirrorCondition,
                lastTireChangeKm: vehicleCondition.lastTireChangeKm,
                lastOilChangeKm: vehicleCondition.lastOilChangeKm,
                lastBrakePadChangeKm: vehicleCondition.lastBrakePadChangeKm,
                lastChainChangeKm: vehicleCondition.lastChainChangeKm,
                lastServiceKm: vehicleCondition.lastServiceKm,
                lastServiceDate: vehicleCondition.lastServiceDate,
                recentIssues: vehicleCondition.recentIssues,
                customizations: vehicleCondition.customizations,
              }, {
                currentOdometer: ' odometer', tirePressureFront: ' PSI', tirePressureRear: ' PSI',
                tireWearLevelFront: '🛞', tireWearLevelRear: '🛞', brakePadWearFront: '🛑',
                brakePadWearRear: '🛑', brakeFluidLevel: '💧', chainLubeStatus: '⛓️',
                chainTensionStatus: '⚙️', oilLevelStatus: '🛢️', coolantLevelStatus: '🧊',
                batteryHealth: '🔋', headlightFunction: '💡', taillightFunction: '💡',
                turnSignalFunction: '💡', hornFunction: '📣', mirrorCondition: '🪞',
                lastTireChangeKm: '🔄', lastOilChangeKm: '🛢️', lastBrakePadChangeKm: '🛑',
                lastChainChangeKm: '⛓️', lastServiceKm: '🛠️', lastServiceDate: '📅',
                recentIssues: '❗', customizations: '✨'
              })}

              {renderListSection("Calculated Metrics", {
                ageOfVehicleYears: vehicleCalculatedMetrics.ageOfVehicleYears,
                powerToWeightRatio: vehicleCalculatedMetrics.powerToWeightRatio,
                estimatedRange: vehicleCalculatedMetrics.estimatedRange,
                fuelCostPer100Km: vehicleCalculatedMetrics.fuelCostPer100Km,
                nextServiceDueKm: vehicleCalculatedMetrics.nextServiceDueKm,
                nextServiceDueDate: vehicleCalculatedMetrics.nextServiceDueDate,
                nextTireChangeDueKm: vehicleCalculatedMetrics.nextTireChangeDueKm,
                nextBrakePadChangeDueKm: vehicleCalculatedMetrics.nextBrakePadChangeDueKm,
                nextChainChangeDueKm: vehicleCalculatedMetrics.nextChainChangeDueKm,
                remainingTireLifeKm: vehicleCalculatedMetrics.remainingTireLifeKm,
                remainingBrakePadLifeKm: vehicleCalculatedMetrics.remainingBrakePadLifeKm,
                remainingChainLifeKm: vehicleCalculatedMetrics.remainingChainLifeKm,
                maintenanceUrgency: vehicleCalculatedMetrics.maintenanceUrgency,
                terrainSuitabilityVerdict: vehicleCalculatedMetrics.terrainSuitabilityVerdict,
              }, {
                ageOfVehicleYears: '⏳', powerToWeightRatio: '⚡', estimatedRange: '🗺️',
                fuelCostPer100Km: '💰', nextServiceDueKm: '🛠️', nextServiceDueDate: '📅',
                nextTireChangeDueKm: '🛞', nextBrakePadChangeDueKm: '🛑', nextChainChangeDueKm: '⛓️',
                remainingTireLifeKm: '🛞', remainingBrakePadLifeKm: '🛑', remainingChainLifeKm: '⛓️',
                maintenanceUrgency: '🚨', terrainSuitabilityVerdict: '⛰️'
              })}

              <div className="mt-6">
                <h4 className="font-semibold text-md text-gray-700 mb-2">Vehicle Recommendations:</h4>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{vehicleRecommendation.maintenanceTips}</p>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{vehicleRecommendation.performanceTips}</p>
                {vehicleRecommendation.safetyAlerts && (
                  <ErrorMessage message={vehicleRecommendation.safetyAlerts} type={
                    vehicleRecommendation.overallVehicleSentiment === 'warning' ? 'error' : 'warning'
                  } />
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => handleResetData('vehicle')} variant="secondary" size="sm">
                  Reset Vehicle Data
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Logout Confirmation Modal */}
        <Modal
          isOpen={showLogoutConfirmModal}
          onClose={cancelLogout}
          title="Confirm Logout"
        >
          <p className="text-gray-700 mb-6">Are you sure you want to log out?</p>
          <div className="flex justify-end space-x-3">
            <Button onClick={cancelLogout} variant="secondary">
              Cancel
            </Button>
            <Button onClick={confirmLogout} variant="primary">
              Logout
            </Button>
          </div>
        </Modal>

        {/* Reset Data Confirmation Modal */}
        <Modal
          isOpen={showResetDataModal}
          onClose={cancelResetData}
          title={`Confirm Reset ${resetDataType === 'rider' ? 'Rider' : 'Vehicle'} Data`}
        >
          <p className="text-gray-700 mb-6">
            Are you sure you want to reset all your {resetDataType === 'rider' ? 'rider profile and trip preferences' : 'vehicle specifications and condition'}?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button onClick={cancelResetData} variant="secondary">
              Cancel
            </Button>
            <Button onClick={confirmResetData} variant="danger">
              Reset Data
            </Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
