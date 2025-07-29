import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { useVehicle } from '../context/VehicleContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ListItem from '../components/ListItem'; // To display fetched specs

const VehicleSetup = () => {
  const {
    vehicleSpecs,
    updateVehicleSpecs,
    vehicleCondition,
    updateVehicleCondition,
    isLoadingVehicle,
    errorVehicle,
    calculatedMetrics, // To display calculated values
    vehicleRecommendation, // To display initial recommendations
  } = useVehicle();

  // Local state to manage form inputs for basic vehicle identification
  const [formData, setFormData] = useState({
    make: vehicleSpecs.make,
    model: vehicleSpecs.model,
    year: vehicleSpecs.year || '',
  });

  // Local state for current vehicle condition inputs
  const [conditionFormData, setConditionFormData] = useState({
    currentOdometer: vehicleCondition.currentOdometer || '',
    tirePressureFront: vehicleCondition.tirePressureFront || '',
    tirePressureRear: vehicleCondition.tirePressureRear || '',
    tireWearLevelFront: vehicleCondition.tireWearLevelFront || '',
    tireWearLevelRear: vehicleCondition.tireWearLevelRear || '',
    brakePadWearFront: vehicleCondition.brakePadWearFront || '',
    brakePadWearRear: vehicleCondition.brakePadWearRear || '',
    brakeFluidLevel: vehicleCondition.brakeFluidLevel,
    chainLubeStatus: vehicleCondition.chainLubeStatus,
    chainTensionStatus: vehicleCondition.chainTensionStatus,
    oilLevelStatus: vehicleCondition.oilLevelStatus,
    coolantLevelStatus: vehicleCondition.coolantLevelStatus,
    batteryHealth: vehicleCondition.batteryHealth || '',
    lastTireChangeKm: vehicleCondition.lastTireChangeKm || '',
    lastOilChangeKm: vehicleCondition.lastOilChangeKm || '',
    lastBrakePadChangeKm: vehicleCondition.lastBrakePadChangeKm || '',
    lastChainChangeKm: vehicleCondition.lastChainChangeKm || '',
    lastServiceKm: vehicleCondition.lastServiceKm || '',
    lastServiceDate: vehicleCondition.lastServiceDate || '',
    recentIssues: vehicleCondition.recentIssues.join(', '), // Convert array to string for input
    customizations: vehicleCondition.customizations.join(', '), // Convert array to string for input
  });

  // Options for select fields in Vehicle Condition
  const fluidLevelOptions = [
    { value: 'good', label: 'Good' },
    { value: 'low', label: 'Low' },
    { value: 'critical', label: 'Critical' },
  ];

  const chainLubeOptions = [
    { value: 'good', label: 'Good' },
    { value: 'needs-lube', label: 'Needs Lube' },
    { value: 'dry', label: 'Dry' },
    { value: 'rusty', label: 'Rusty' },
  ];

  const chainTensionOptions = [
    { value: 'good', label: 'Good' },
    { value: 'loose', label: 'Loose' },
    { value: 'tight', label: 'Tight' },
  ];

  const lightFunctionOptions = [
    { value: 'working', label: 'Working' },
    { value: 'dim', label: 'Dim' },
    { value: 'not-working', label: 'Not Working' },
  ];

  const hornFunctionOptions = [
    { value: 'working', label: 'Working' },
    { value: 'not-working', label: 'Not Working' },
  ];

  const mirrorConditionOptions = [
    { value: 'good', label: 'Good' },
    { value: 'cracked', label: 'Cracked' },
    { value: 'missing', label: 'Missing' },
  ];


  // Effect to sync context data to local form data when context changes (e.g., on initial load or AI fetch)
  useEffect(() => {
    setFormData({
      make: vehicleSpecs.make,
      model: vehicleSpecs.model,
      year: vehicleSpecs.year || '',
    });
    setConditionFormData({
      currentOdometer: vehicleCondition.currentOdometer || '',
      tirePressureFront: vehicleCondition.tirePressureFront || '',
      tirePressureRear: vehicleCondition.tirePressureRear || '',
      tireWearLevelFront: vehicleCondition.tireWearLevelFront || '',
      tireWearLevelRear: vehicleCondition.tireWearLevelRear || '',
      brakePadWearFront: vehicleCondition.brakePadWearFront || '',
      brakePadWearRear: vehicleCondition.brakePadWearRear || '',
      brakeFluidLevel: vehicleCondition.brakeFluidLevel,
      chainLubeStatus: vehicleCondition.chainLubeStatus,
      chainTensionStatus: vehicleCondition.chainTensionStatus,
      oilLevelStatus: vehicleCondition.oilLevelStatus,
      coolantLevelStatus: vehicleCondition.coolantLevelStatus,
      batteryHealth: vehicleCondition.batteryHealth || '',
      lastTireChangeKm: vehicleCondition.lastTireChangeKm || '',
      lastOilChangeKm: vehicleCondition.lastOilChangeKm || '',
      lastBrakePadChangeKm: vehicleCondition.lastBrakePadChangeKm || '',
      lastChainChangeKm: vehicleCondition.lastChainChangeKm || '',
      lastServiceKm: vehicleCondition.lastServiceKm || '',
      lastServiceDate: vehicleCondition.lastServiceDate || '',
      recentIssues: vehicleCondition.recentIssues.join(', '),
      customizations: vehicleCondition.customizations.join(', '),
    });
  }, [vehicleSpecs, vehicleCondition]);


  // Handle change for basic vehicle identification fields
  const handleIdChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle change for vehicle condition fields
  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setConditionFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler for basic vehicle identification
  const handleIdSubmit = async (e) => {
    e.preventDefault();
    // This call to updateVehicleSpecs will trigger the AI fetch in the context
    await updateVehicleSpecs({
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
    });
    console.log('Vehicle identification submitted. Fetching detailed specs...');
  };

  // Submit handler for vehicle condition
  const handleConditionSubmit = (e) => {
    e.preventDefault();
    updateVehicleCondition({
      currentOdometer: Number(conditionFormData.currentOdometer),
      tirePressureFront: Number(conditionFormData.tirePressureFront),
      tirePressureRear: Number(conditionFormData.tirePressureRear),
      tireWearLevelFront: Number(conditionFormData.tireWearLevelFront),
      tireWearLevelRear: Number(conditionFormData.tireWearLevelRear),
      brakePadWearFront: Number(conditionFormData.brakePadWearFront),
      brakePadWearRear: Number(conditionFormData.brakePadWearRear),
      brakeFluidLevel: conditionFormData.brakeFluidLevel,
      chainLubeStatus: conditionFormData.chainLubeStatus,
      chainTensionStatus: conditionFormData.chainTensionStatus,
      oilLevelStatus: conditionFormData.oilLevelStatus,
      coolantLevelStatus: conditionFormData.coolantLevelStatus,
      batteryHealth: Number(conditionFormData.batteryHealth),
      headlightFunction: conditionFormData.headlightFunction,
      taillightFunction: conditionFormData.taillightFunction,
      turnSignalFunction: conditionFormData.turnSignalFunction,
      hornFunction: conditionFormData.hornFunction,
      mirrorCondition: conditionFormData.mirrorCondition,
      lastTireChangeKm: Number(conditionFormData.lastTireChangeKm),
      lastOilChangeKm: Number(conditionFormData.lastOilChangeKm),
      lastBrakePadChangeKm: Number(conditionFormData.lastBrakePadChangeKm),
      lastChainChangeKm: Number(conditionFormData.lastChainChangeKm),
      lastServiceKm: Number(conditionFormData.lastServiceKm),
      lastServiceDate: conditionFormData.lastServiceDate,
      recentIssues: conditionFormData.recentIssues.split(',').map(s => s.trim()).filter(Boolean), // Convert string to array
      customizations: conditionFormData.customizations.split(',').map(s => s.trim()).filter(Boolean), // Convert string to array
    });
    console.log('Vehicle condition updated in context!');
  };

  // Determine if AI specs have been loaded
  const areSpecsLoaded = vehicleSpecs.engineCC !== null && vehicleSpecs.vehicleWeight !== null;

  return (
    <MainLayout pageTitle="Vehicle Setup & Health">
      <div className="max-w-xl mx-auto">
        {isLoadingVehicle && <LoadingSpinner size="lg" className="my-8" />}
        {errorVehicle && <ErrorMessage message={errorVehicle} onClose={() => { /* handle error dismissal */ }} />}

        {/* Section 1: Basic Vehicle Identification */}
        <Card title="Identify Your Motorcycle">
          <form onSubmit={handleIdSubmit} className="space-y-4">
            <Input
              label="Make"
              id="make"
              name="make"
              type="text"
              value={formData.make}
              onChange={handleIdChange}
              placeholder="e.g., Royal Enfield"
              required
            />
            <Input
              label="Model"
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={handleIdChange}
              placeholder="e.g., Himalayan"
              required
            />
            <Input
              label="Year"
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleIdChange}
              placeholder="e.g., 2022"
              required
              min="1900"
              max={new Date().getFullYear()}
            />
            <Button type="submit" variant="primary" size="md" className="w-full">
              Fetch Vehicle Specs
            </Button>
          </form>
        </Card>

        {/* Section 2: Display AI-Fetched Vehicle Specifications */}
        {areSpecsLoaded && (
          <Card title="AI-Fetched Vehicle Specifications" className="mt-6">
            <div className="space-y-2">
              <ListItem label="Engine CC" value={`${vehicleSpecs.engineCC || 'N/A'} CC`} />
              <ListItem label="Vehicle Weight" value={`${vehicleSpecs.vehicleWeight || 'N/A'} kg`} />
              <ListItem label="Ground Clearance" value={`${vehicleSpecs.groundClearance || 'N/A'} mm`} />
              <ListItem label="Fuel Tank Capacity" value={`${vehicleSpecs.fuelTankCapacity || 'N/A'} litres`} />
              <ListItem label="Fuel Efficiency" value={`${vehicleSpecs.fuelEfficiency || 'N/A'} km/l`} />
              <ListItem label="Load Capacity" value={`${vehicleSpecs.loadCapacity || 'N/A'} kg`} />
              <ListItem label="Tire Type" value={vehicleSpecs.tireType || 'N/A'} />
              <ListItem label="Brake Type" value={vehicleSpecs.brakeType || 'N/A'} />
              <ListItem label="Suspension Type" value={vehicleSpecs.suspensionType || 'N/A'} />
              <ListItem label="Cooling System" value={vehicleSpecs.coolingSystem || 'N/A'} />
              <ListItem label="Transmission" value={vehicleSpecs.transmissionType || 'N/A'} />
              <ListItem label="Emission Standard" value={vehicleSpecs.emissionStandard || 'N/A'} />
              <ListItem label="Has ABS?" value={vehicleSpecs.hasABS ? 'Yes' : 'No'} />
              <ListItem label="Has Traction Control?" value={vehicleSpecs.hasTractionControl ? 'Yes' : 'No'} />
              <ListItem label="Has Quick Shifter?" value={vehicleSpecs.hasQuickShifter ? 'Yes' : 'No'} />
              <ListItem label="Typical Tire Lifespan" value={`${vehicleSpecs.typicalTireLifespanKm || 'N/A'} km`} />
              <ListItem label="Typical Brake Pad Lifespan" value={`${vehicleSpecs.typicalBrakePadLifespanKm || 'N/A'} km`} />
              <ListItem label="Typical Chain Lifespan" value={`${vehicleSpecs.typicalChainLifespanKm || 'N/A'} km`} />
            </div>
          </Card>
        )}

        {/* Section 3: Current Vehicle Condition */}
        {areSpecsLoaded && ( // Only show condition input if specs are loaded
          <Card title="Current Vehicle Condition" className="mt-6">
            <form onSubmit={handleConditionSubmit} className="space-y-4">
              <Input
                label="Current Odometer (km)"
                id="currentOdometer"
                name="currentOdometer"
                type="number"
                value={conditionFormData.currentOdometer}
                onChange={handleConditionChange}
                placeholder="e.g., 15000"
                required
                min="0"
              />
              <Input
                label="Front Tire Pressure (PSI)"
                id="tirePressureFront"
                name="tirePressureFront"
                type="number"
                value={conditionFormData.tirePressureFront}
                onChange={handleConditionChange}
                placeholder="e.g., 32"
                min="10"
                max="60"
              />
              <Input
                label="Rear Tire Pressure (PSI)"
                id="tirePressureRear"
                name="tirePressureRear"
                type="number"
                value={conditionFormData.tirePressureRear}
                onChange={handleConditionChange}
                placeholder="e.g., 36"
                min="10"
                max="60"
              />
              <Input
                label="Front Tire Wear Level (% Life Remaining)"
                id="tireWearLevelFront"
                name="tireWearLevelFront"
                type="number"
                value={conditionFormData.tireWearLevelFront}
                onChange={handleConditionChange}
                placeholder="e.g., 80"
                min="0"
                max="100"
              />
              <Input
                label="Rear Tire Wear Level (% Life Remaining)"
                id="tireWearLevelRear"
                name="tireWearLevelRear"
                type="number"
                value={conditionFormData.tireWearLevelRear}
                onChange={handleConditionChange}
                placeholder="e.g., 75"
                min="0"
                max="100"
              />
              <Input
                label="Front Brake Pad Wear (% Life Remaining)"
                id="brakePadWearFront"
                name="brakePadWearFront"
                type="number"
                value={conditionFormData.brakePadWearFront}
                onChange={handleConditionChange}
                placeholder="e.g., 70"
                min="0"
                max="100"
              />
              <Input
                label="Rear Brake Pad Wear (% Life Remaining)"
                id="brakePadWearRear"
                name="brakePadWearRear"
                type="number"
                value={conditionFormData.brakePadWearRear}
                onChange={handleConditionChange}
                placeholder="e.g., 65"
                min="0"
                max="100"
              />
              <Select
                label="Brake Fluid Level"
                id="brakeFluidLevel"
                name="brakeFluidLevel"
                value={conditionFormData.brakeFluidLevel}
                onChange={handleConditionChange}
                options={fluidLevelOptions}
                placeholder="Select level"
              />
              <Select
                label="Chain Lube Status"
                id="chainLubeStatus"
                name="chainLubeStatus"
                value={conditionFormData.chainLubeStatus}
                onChange={handleConditionChange}
                options={chainLubeOptions}
                placeholder="Select status"
              />
              <Select
                label="Chain Tension Status"
                id="chainTensionStatus"
                name="chainTensionStatus"
                value={conditionFormData.chainTensionStatus}
                onChange={handleConditionChange}
                options={chainTensionOptions}
                placeholder="Select status"
              />
              <Select
                label="Engine Oil Level"
                id="oilLevelStatus"
                name="oilLevelStatus"
                value={conditionFormData.oilLevelStatus}
                onChange={handleConditionChange}
                options={fluidLevelOptions}
                placeholder="Select level"
              />
              <Select
                label="Coolant Level (if liquid-cooled)"
                id="coolantLevelStatus"
                name="coolantLevelStatus"
                value={conditionFormData.coolantLevelStatus}
                onChange={handleConditionChange}
                options={fluidLevelOptions}
                placeholder="Select level"
              />
              <Input
                label="Battery Health (%)"
                id="batteryHealth"
                name="batteryHealth"
                type="number"
                value={conditionFormData.batteryHealth}
                onChange={handleConditionChange}
                placeholder="e.g., 90"
                min="0"
                max="100"
              />
              <Select
                label="Headlight Function"
                id="headlightFunction"
                name="headlightFunction"
                value={conditionFormData.headlightFunction}
                onChange={handleConditionChange}
                options={lightFunctionOptions}
                placeholder="Select status"
              />
              <Select
                label="Taillight Function"
                id="taillightFunction"
                name="taillightFunction"
                value={conditionFormData.taillightFunction}
                onChange={handleConditionChange}
                options={lightFunctionOptions}
                placeholder="Select status"
              />
              <Select
                label="Turn Signal Function"
                id="turnSignalFunction"
                name="turnSignalFunction"
                value={conditionFormData.turnSignalFunction}
                onChange={handleConditionChange}
                options={lightFunctionOptions}
                placeholder="Select status"
              />
              <Select
                label="Horn Function"
                id="hornFunction"
                name="hornFunction"
                value={conditionFormData.hornFunction}
                onChange={handleConditionChange}
                options={hornFunctionOptions}
                placeholder="Select status"
              />
              <Select
                label="Mirror Condition"
                id="mirrorCondition"
                name="mirrorCondition"
                value={conditionFormData.mirrorCondition}
                onChange={handleConditionChange}
                options={mirrorConditionOptions}
                placeholder="Select condition"
              />
              <Input
                label="Last Tire Change Odometer (km)"
                id="lastTireChangeKm"
                name="lastTireChangeKm"
                type="number"
                value={conditionFormData.lastTireChangeKm}
                onChange={handleConditionChange}
                placeholder="e.g., 10000"
                min="0"
              />
              <Input
                label="Last Oil Change Odometer (km)"
                id="lastOilChangeKm"
                name="lastOilChangeKm"
                type="number"
                value={conditionFormData.lastOilChangeKm}
                onChange={handleConditionChange}
                placeholder="e.g., 14500"
                min="0"
              />
              <Input
                label="Last Brake Pad Change Odometer (km)"
                id="lastBrakePadChangeKm"
                name="lastBrakePadChangeKm"
                type="number"
                value={conditionFormData.lastBrakePadChangeKm}
                onChange={handleConditionChange}
                placeholder="e.g., 8000"
                min="0"
              />
              <Input
                label="Last Chain Change Odometer (km)"
                id="lastChainChangeKm"
                name="lastChainChangeKm"
                type="number"
                value={conditionFormData.lastChainChangeKm}
                onChange={handleConditionChange}
                placeholder="e.g., 12000"
                min="0"
              />
              <Input
                label="Last Full Service Odometer (km)"
                id="lastServiceKm"
                name="lastServiceKm"
                type="number"
                value={conditionFormData.lastServiceKm}
                onChange={handleConditionChange}
                placeholder="e.g., 10000"
                min="0"
              />
              <Input
                label="Last Full Service Date"
                id="lastServiceDate"
                name="lastServiceDate"
                type="date"
                value={conditionFormData.lastServiceDate}
                onChange={handleConditionChange}
                // Max date is today
                max={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Recent Issues (comma-separated)"
                id="recentIssues"
                name="recentIssues"
                type="text"
                value={conditionFormData.recentIssues}
                onChange={handleConditionChange}
                placeholder="e.g., 'check engine light, minor oil leak'"
              />
              <Input
                label="Customizations (comma-separated)"
                id="customizations"
                name="customizations"
                type="text"
                value={conditionFormData.customizations}
                onChange={handleConditionChange}
                placeholder="e.g., 'aftermarket exhaust, crash guards'"
              />
              <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
                Update Vehicle Condition
              </Button>
            </form>
          </Card>
        )}

        {/* Section 4: Vehicle Recommendations (only if specs are loaded) */}
        {areSpecsLoaded && (
          <Card title="Vehicle Health & Performance Insights" className="mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Overall Status:
              <span className={`ml-2 font-bold ${
                vehicleRecommendation.overallVehicleSentiment === 'warning' ? 'text-red-600' :
                vehicleRecommendation.overallVehicleSentiment === 'cautionary' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {vehicleRecommendation.overallVehicleSentiment.toUpperCase()}
              </span>
            </h3>

            <div className="space-y-4">
              {vehicleRecommendation.safetyAlerts && (
                <ErrorMessage message={vehicleRecommendation.safetyAlerts} type={
                  vehicleRecommendation.overallVehicleSentiment === 'warning' ? 'error' : 'warning'
                } />
              )}
              {vehicleRecommendation.maintenanceTips && (
                <div>
                  <h4 className="font-medium text-gray-700">Maintenance Tips:</h4>
                  <p className="text-sm text-gray-600">{vehicleRecommendation.maintenanceTips}</p>
                </div>
              )}
              {vehicleRecommendation.performanceTips && (
                <div>
                  <h4 className="font-medium text-gray-700 mt-3">Performance Tips:</h4>
                  <p className="text-sm text-gray-600">{vehicleRecommendation.performanceTips}</p>
                </div>
              )}
            </div>

            <h4 className="font-medium text-gray-700 mt-4 mb-2">Key Metrics:</h4>
            <div className="space-y-2">
              <ListItem label="Age of Vehicle" value={`${calculatedMetrics.ageOfVehicleYears || 'N/A'} years`} />
              <ListItem label="Power-to-Weight Ratio" value={`${calculatedMetrics.powerToWeightRatio || 'N/A'} HP/kg`} />
              <ListItem label="Estimated Range" value={`${calculatedMetrics.estimatedRange || 'N/A'} km`} />
              <ListItem label="Fuel Cost/100km" value={`₹${calculatedMetrics.fuelCostPer100Km || 'N/A'}`} />
              <ListItem label="Next Service Due" value={`${calculatedMetrics.nextServiceDueKm || 'N/A'} km or by ${calculatedMetrics.nextServiceDueDate || 'N/A'}`} />
              <ListItem label="Next Tire Change Due" value={`${calculatedMetrics.nextTireChangeDueKm || 'N/A'} km`} />
              <ListItem label="Next Brake Pad Change Due" value={`${calculatedMetrics.nextBrakePadChangeDueKm || 'N/A'} km`} />
              <ListItem label="Next Chain Change Due" value={`${calculatedMetrics.nextChainChangeDueKm || 'N/A'} km`} />
              <ListItem label="Remaining Tire Life" value={`${calculatedMetrics.remainingTireLifeKm !== null ? calculatedMetrics.remainingTireLifeKm + ' km' : 'N/A'}`} />
              <ListItem label="Remaining Brake Pad Life" value={`${calculatedMetrics.remainingBrakePadLifeKm !== null ? calculatedMetrics.remainingBrakePadLifeKm + ' km' : 'N/A'}`} />
              <ListItem label="Remaining Chain Life" value={`${calculatedMetrics.remainingChainLifeKm !== null ? calculatedMetrics.remainingChainLifeKm + ' km' : 'N/A'}`} />
              <ListItem label="Maintenance Urgency" value={calculatedMetrics.maintenanceUrgency || 'N/A'} />
              <ListItem label="Terrain Suitability" value={calculatedMetrics.terrainSuitabilityVerdict || 'N/A'} />
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default VehicleSetup;
