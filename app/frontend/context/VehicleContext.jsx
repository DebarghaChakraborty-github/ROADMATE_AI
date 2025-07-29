import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; // For fetching vehicle specs from backend

// Create Context for Vehicle data and associated functions
const VehicleContext = createContext();

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

// Provider Component that encapsulates all vehicle-related logic
export const VehicleProvider = ({ children }) => {
  // --- Core State Management ---

  // Vehicle Specifications State: Only make, model, year are user inputs.
  // All other fields are populated by the AI fetch from the backend.
  const [vehicleSpecs, setVehicleSpecs] = useState({
    make: '',
    model: '',
    year: null, // Year of manufacture
    // The rest of these fields will be populated by fetchDetailedVehicleSpecs (AI backend)
    engineCC: null,
    groundClearance: null, // in mm
    vehicleWeight: null, // Dry weight in kg
    fuelTankCapacity: null, // in litres
    fuelEfficiency: null, // km per litre (average)
    loadCapacity: null, // how much extra weight it can safely carry (payload) in kg
    tireType: null, // 'road', 'dual-sport', 'off-road', 'sport'
    brakeType: null, // 'disc', 'drum', 'ABS'
    suspensionType: null, // 'standard', 'adjustable', 'upside-down', 'off-road'
    coolingSystem: null, // 'air', 'liquid'
    transmissionType: null, // 'manual', 'automatic'
    serviceIntervalKm: null, // Recommended service interval in km
    serviceIntervalMonths: null, // Recommended service interval in months
    emissionStandard: null, // e.g., 'BS4', 'BS6', 'Euro4'
    hasABS: null, // Boolean
    hasTractionControl: null, // Boolean
    hasQuickShifter: null, // Boolean
    typicalTireLifespanKm: null, // Typical lifespan for this model (in km)
    typicalBrakePadLifespanKm: null, // Typical brake pad lifespan (in km)
    typicalChainLifespanKm: null, // Typical chain lifespan (in km)
  });

  // Vehicle Condition State: Dynamic, user-reported or sensor-derived current status
  const [vehicleCondition, setVehicleCondition] = useState({
    currentOdometer: 0, // Current odometer reading in km
    tirePressureFront: null, // in PSI
    tirePressureRear: null, // in PSI
    tireWearLevelFront: 80, // Percentage of life remaining (e.g., 80% remaining, 20% worn)
    tireWearLevelRear: 80, // Percentage of life remaining
    brakePadWearFront: 80, // Percentage of life remaining
    brakePadWearRear: 80, // Percentage of life remaining
    brakeFluidLevel: 'good', // 'good', 'low', 'critical'
    chainLubeStatus: 'good', // 'good', 'needs-lube', 'dry', 'rusty'
    chainTensionStatus: 'good', // 'good', 'loose', 'tight'
    oilLevelStatus: 'good', // 'good', 'low', 'critical'
    coolantLevelStatus: 'good', // 'good', 'low', 'critical' (for liquid-cooled bikes)
    batteryHealth: 90, // Percentage (0-100)
    headlightFunction: 'working', // 'working', 'dim', 'not-working'
    taillightFunction: 'working', // 'working', 'dim', 'not-working'
    turnSignalFunction: 'working', // 'working', 'dim', 'not-working'
    hornFunction: 'working', // 'working', 'not-working'
    mirrorCondition: 'good', // 'good', 'cracked', 'missing'
    lastTireChangeKm: 0, // Odometer reading at last tire change
    lastOilChangeKm: 0, // Odometer reading at last oil change
    lastBrakePadChangeKm: 0, // Odometer reading at last brake pad change
    lastChainChangeKm: 0, // Odometer reading at last chain change
    lastServiceKm: 0, // Odometer reading at last full service
    lastServiceDate: null, // Date of last full service (e.g., 'YYYY-MM-DD')
    recentIssues: [], // Array of strings, e.g., ['check engine light', 'clutch slipping', 'minor oil leak']
    customizations: [], // Array of strings, e.g., ['aftermarket exhaust', 'crash guards']
  });

  // Calculated Metrics State: Derived performance and maintenance data
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    powerToWeightRatio: null, // HP per kg
    estimatedRange: null, // Estimated range on a full tank in km
    fuelCostPer100Km: null, // Estimated fuel cost for 100km
    nextServiceDueKm: null, // Odometer for next service
    nextServiceDueDate: null, // Date for next service
    nextTireChangeDueKm: null, // Odometer for next tire change
    nextBrakePadChangeDueKm: null, // Odometer for next brake pad change
    nextChainChangeDueKm: null, // Odometer for next chain change
    maintenanceUrgency: 'low', // 'low', 'moderate', 'high', 'critical'
    ageOfVehicleYears: null, // Calculated age
    remainingTireLifeKm: null,
    remainingBrakePadLifeKm: null,
    remainingChainLifeKm: null,
    terrainSuitabilityVerdict: '', // New: Vehicle's terrain suitability (derived from specs like ground clearance, tire type)
  });

  // Vehicle Recommendation State: Human-like advice and alerts for the vehicle
  const [vehicleRecommendation, setVehicleRecommendation] = useState({
    maintenanceTips: '', // Advice on upcoming/current maintenance
    performanceTips: '', // Advice on optimizing vehicle performance
    safetyAlerts: '', // Critical warnings
    overallVehicleSentiment: 'positive', // 'positive', 'neutral', 'cautionary', 'warning'
  });

  // UI/API State for this context
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [errorVehicle, setErrorVehicle] = useState(null);

  // --- Core Calculation Functions ---

  /**
   * Calculates key performance metrics for the vehicle.
   * @param {object} specs - Vehicle specifications.
   * @returns {{powerToWeightRatio: number|null, estimatedRange: number|null, fuelCostPer100Km: number|null}}
   */
  const calculatePerformanceMetrics = useCallback((specs) => {
    let powerToWeightRatio = null;
    if (specs.engineCC && specs.vehicleWeight) {
      // Very rough estimate: 1 HP per 15-20 CC for average bikes, then divide by weight
      const estimatedHP = specs.engineCC / 18; // Example conversion
      powerToWeightRatio = parseFloat((estimatedHP / specs.vehicleWeight).toFixed(2));
    }

    let estimatedRange = null;
    if (specs.fuelTankCapacity && specs.fuelEfficiency) {
      estimatedRange = parseFloat((specs.fuelTankCapacity * specs.fuelEfficiency).toFixed(0));
    }

    // Assuming average fuel price (e.g., ₹100/litre for India)
    const averageFuelPricePerLiter = 100;
    let fuelCostPer100Km = null;
    if (specs.fuelEfficiency && specs.fuelEfficiency > 0) {
      fuelCostPer100Km = parseFloat(((100 / specs.fuelEfficiency) * averageFuelPricePerLiter).toFixed(2));
    }

    return { powerToWeightRatio, estimatedRange, fuelCostPer100Km };
  }, []);

  /**
   * Calculates the age of the vehicle in years.
   * @param {number} year - Year of manufacture.
   * @returns {number|null} Age in years or null if invalid.
   */
  const calculateVehicleAge = useCallback((year) => {
    if (!year || year <= 1900 || year > new Date().getFullYear()) return null;
    return new Date().getFullYear() - year;
  }, []);

  /**
   * Determines the vehicle's suitability for different terrains based on its specs.
   * @param {object} specs - Vehicle specifications.
   * @returns {string} Terrain suitability verdict.
   */
  const determineTerrainSuitability = useCallback((specs) => {
    if (!specs.groundClearance || !specs.tireType || !specs.suspensionType) {
      return 'Insufficient data for terrain verdict.';
    }

    const clearance = specs.groundClearance;
    const tireType = specs.tireType.toLowerCase();
    const suspensionType = specs.suspensionType.toLowerCase();

    if (clearance >= 200 && (tireType.includes('off-road') || tireType.includes('dual-sport')) && suspensionType.includes('off-road')) {
      return 'Excellent for off-road and touring.';
    } else if (clearance >= 160 && (tireType.includes('dual-sport') || tireType.includes('road')) && suspensionType.includes('adjustable')) {
      return 'Good for mixed terrain and light trails.';
    } else if (clearance < 140 && tireType.includes('road')) {
      return 'Primarily for paved roads. Avoid rough terrain.';
    } else {
      return 'Suitable for general road use.';
    }
  }, []);

  /**
   * Assesses maintenance needs and calculates due dates/mileages for various components.
   * @param {object} specs - Vehicle specifications.
   * @param {object} condition - Current vehicle condition.
   * @returns {{
   * nextServiceDueKm: number|null, nextServiceDueDate: string|null,
   * nextTireChangeDueKm: number|null, nextBrakePadChangeDueKm: number|null, nextChainChangeDueKm: number|null,
   * maintenanceUrgency: string,
   * remainingTireLifeKm: number|null, remainingBrakePadLifeKm: number|null, remainingChainLifeKm: number|null
   * }}
   */
  const assessMaintenanceNeeds = useCallback((specs, condition) => {
    let nextServiceDueKm = null;
    let nextServiceDueDate = null;
    let nextTireChangeDueKm = null;
    let nextBrakePadChangeDueKm = null;
    let nextChainChangeDueKm = null;
    let urgencyScore = 0; // Higher score means more urgent

    let remainingTireLifeKm = null;
    let remainingBrakePadLifeKm = null;
    let remainingChainLifeKm = null;

    // --- Full Service Due ---
    if (specs.serviceIntervalKm && condition.lastServiceKm !== null) {
      nextServiceDueKm = condition.lastServiceKm + specs.serviceIntervalKm;
      if (condition.currentOdometer >= nextServiceDueKm - 500) { // Within 500km of service
        urgencyScore += 2;
        if (condition.currentOdometer >= nextServiceDueKm) { // Overdue
          urgencyScore += 5;
        }
      }
    }

    if (specs.serviceIntervalMonths && condition.lastServiceDate) {
      const lastService = new Date(condition.lastServiceDate);
      const nextServiceDateObj = new Date(lastService.setMonth(lastService.getMonth() + specs.serviceIntervalMonths));
      nextServiceDueDate = nextServiceDateObj.toISOString().split('T')[0]; // YYYY-MM-DD format

      const now = new Date();
      if (now >= nextServiceDateObj) { // Overdue by date
        urgencyScore += 4;
      } else if ((nextServiceDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) { // Within 30 days
        urgencyScore += 1;
      }
    }

    // --- Tire Change Due ---
    if (specs.typicalTireLifespanKm && condition.lastTireChangeKm !== null) {
      nextTireChangeDueKm = condition.lastTireChangeKm + specs.typicalTireLifespanKm;
      remainingTireLifeKm = nextTireChangeDueKm - condition.currentOdometer;

      // Check by mileage and wear level
      if (condition.currentOdometer >= nextTireChangeDueKm - 1000 || condition.tireWearLevelFront <= 30 || condition.tireWearLevelRear <= 30) {
        urgencyScore += 3;
        if (condition.currentOdometer >= nextTireChangeDueKm || condition.tireWearLevelFront <= 10 || condition.tireWearLevelRear <= 10) {
          urgencyScore += 6; // Critical wear or overdue
        }
      }
    }

    // --- Brake Pad Change Due ---
    if (specs.typicalBrakePadLifespanKm && condition.lastBrakePadChangeKm !== null) {
      nextBrakePadChangeDueKm = condition.lastBrakePadChangeKm + specs.typicalBrakePadLifespanKm;
      remainingBrakePadLifeKm = nextBrakePadChangeDueKm - condition.currentOdometer;

      if (condition.currentOdometer >= nextBrakePadChangeDueKm - 1000 || condition.brakePadWearFront <= 30 || condition.brakePadWearRear <= 30) {
        urgencyScore += 3;
        if (condition.currentOdometer >= nextBrakePadChangeDueKm || condition.brakePadWearFront <= 10 || condition.brakePadWearRear <= 10) {
          urgencyScore += 6; // Critical wear or overdue
        }
      }
    }

    // --- Chain Change Due ---
    if (specs.typicalChainLifespanKm && condition.lastChainChangeKm !== null) {
      nextChainChangeDueKm = condition.lastChainChangeKm + specs.typicalChainLifespanKm;
      remainingChainLifeKm = nextChainChangeDueKm - condition.currentOdometer;

      if (condition.currentOdometer >= nextChainChangeDueKm - 1000 || condition.chainTensionStatus !== 'good' || condition.chainLubeStatus === 'rusty') {
        urgencyScore += 3;
        if (condition.currentOdometer >= nextChainChangeDueKm || condition.chainTensionStatus === 'loose' || condition.chainTensionStatus === 'tight') {
          urgencyScore += 6; // Critical wear or overdue
        }
      }
    }

    // --- Other Critical Conditions (Fluids, Battery, Lights, Mirrors) ---
    if (condition.oilLevelStatus === 'critical' || condition.coolantLevelStatus === 'critical' || condition.brakeFluidLevel === 'critical') {
      urgencyScore += 10; // Major fluid issues
    } else if (condition.oilLevelStatus === 'low' || condition.coolantLevelStatus === 'low' || condition.brakeFluidLevel === 'low') {
      urgencyScore += 5; // Low fluid issues
    }

    if (condition.batteryHealth <= 20) {
      urgencyScore += 10; // Critical battery
    } else if (condition.batteryHealth <= 40) {
      urgencyScore += 5; // Low battery
    }

    if (condition.headlightFunction !== 'working' || condition.taillightFunction !== 'working' || condition.turnSignalFunction !== 'working' || condition.hornFunction !== 'working') {
      urgencyScore += 8; // Critical lighting/horn issues
    } else if (condition.headlightFunction === 'dim' || condition.taillightFunction === 'dim' || condition.turnSignalFunction === 'dim') {
      urgencyScore += 3; // Dim lighting issues
    }

    if (condition.mirrorCondition !== 'good') {
      urgencyScore += 5; // Mirror issues
    }

    // --- Recent Issues ---
    if (condition.recentIssues && condition.recentIssues.length > 0) {
      // Assign higher score for more severe issues (e.g., 'check engine light', 'oil leak')
      condition.recentIssues.forEach(issue => {
        if (issue.includes('engine') || issue.includes('oil leak') || issue.includes('clutch slipping')) {
          urgencyScore += 7;
        } else {
          urgencyScore += 3;
        }
      });
    }

    // --- Determine Overall Maintenance Urgency Level ---
    let maintenanceUrgency = 'low';
    if (urgencyScore >= 25) maintenanceUrgency = 'critical';
    else if (urgencyScore >= 15) maintenanceUrgency = 'high';
    else if (urgencyScore >= 7) maintenanceUrgency = 'moderate';

    return {
      nextServiceDueKm, nextServiceDueDate,
      nextTireChangeDueKm, nextBrakePadChangeDueKm, nextChainChangeDueKm,
      maintenanceUrgency,
      remainingTireLifeKm, remainingBrakePadLifeKm, remainingChainLifeKm,
    };
  }, []);

  /**
   * Generates a human-like health report for the vehicle, focusing on maintenance.
   * @param {object} vehicleData - Combined specs, condition, and calculated metrics.
   * @returns {string} Comprehensive maintenance tips.
   */
  const generateMaintenanceTips = useCallback((vehicleData) => {
    const tips = [];

    tips.push(`Hello there! Let's take a closer look at the health of your ${vehicleData.make} ${vehicleData.model}.`);

    // --- Overall Maintenance Urgency Summary ---
    if (vehicleData.maintenanceUrgency === 'critical') {
      tips.push('🚨 Immediate attention required! Your bike has critical maintenance needs. Please address these before your next ride to ensure safety and prevent further damage.');
    } else if (vehicleData.maintenanceUrgency === 'high') {
      tips.push('⚠️ Your bike needs significant attention soon. Schedule maintenance to avoid potential issues escalating and affecting your ride quality.');
    } else if (vehicleData.maintenanceUrgency === 'moderate') {
      tips.push('Your bike is due for some checks. Plan for maintenance in the near future to keep it running smoothly.');
    } else {
      tips.push('Your bike is in great shape! Keep up the routine checks to maintain its excellent condition.');
    }

    // --- Service Due ---
    if (vehicleData.nextServiceDueKm !== null && vehicleData.currentOdometer >= vehicleData.nextServiceDueKm) {
      tips.push(`Your bike is overdue for service by ${vehicleData.currentOdometer - vehicleData.nextServiceDueKm} km. A full service will refresh many components.`);
    } else if (vehicleData.nextServiceDueKm !== null && vehicleData.currentOdometer >= vehicleData.nextServiceDueKm - 500) {
      tips.push(`Heads up! Service is due soon! You're within 500 km of your ${vehicleData.nextServiceDueKm} km service mark. Time to book that appointment!`);
    } else if (vehicleData.nextServiceDueDate && new Date() >= new Date(vehicleData.nextServiceDueDate)) {
      tips.push(`Your bike's service is overdue by date. It was due around ${vehicleData.nextServiceDueDate}.`);
    } else if (vehicleData.nextServiceDueDate) {
      tips.push(`Your next service is due by ${vehicleData.nextServiceDueDate} or at ${vehicleData.nextServiceDueKm} km, whichever comes first.`);
    }

    // --- Tires ---
    const tireLifeRemaining = Math.min(vehicleData.tireWearLevelFront, vehicleData.tireWearLevelRear);
    if (tireLifeRemaining <= 10) {
      tips.push('🚨 Your tires are critically worn (less than 10% life left). This is a major safety risk. Replace them immediately!');
    } else if (tireLifeRemaining <= 30) {
      tips.push('Your tires are showing significant wear (around 30% life left). Consider replacing them soon, especially before long trips or monsoon season.');
    } else if (vehicleData.nextTireChangeDueKm && vehicleData.currentOdometer >= vehicleData.nextTireChangeDueKm - 1000) {
      tips.push(`Your tires are approaching their typical lifespan. They're due for replacement around ${vehicleData.nextTireChangeDueKm} km. Keep an eye on the tread.`);
    } else {
      tips.push(`Tires look good for now. Remember to check tire pressure (front: ${vehicleData.tirePressureFront || 'N/A'} PSI, rear: ${vehicleData.tirePressureRear || 'N/A'} PSI) regularly for optimal performance and safety!`);
    }

    // --- Brakes ---
    const brakeLifeRemaining = Math.min(vehicleData.brakePadWearFront, vehicleData.brakePadWearRear);
    if (brakeLifeRemaining <= 10) {
      tips.push('🚨 Brake pads are critically worn (less than 10% life left). Get them replaced urgently to ensure effective stopping power!');
    } else if (brakeLifeRemaining <= 30) {
      tips.push('Brake pads are wearing down (around 30% life left). Plan for replacement soon to maintain optimal stopping performance.');
    } else if (vehicleData.nextBrakePadChangeDueKm && vehicleData.currentOdometer >= vehicleData.nextBrakePadChangeDueKm - 1000) {
      tips.push(`Your brake pads are nearing the end of their typical lifespan, due around ${vehicleData.nextBrakePadChangeDueKm} km.`);
    } else {
      tips.push('Brakes are in good condition. Always use both front and rear brakes effectively for balanced stopping.');
    }
    if (vehicleData.brakeFluidLevel === 'critical') {
      tips.push('🚨 Brake fluid level is critically low. This can lead to brake failure. Get it checked and topped up immediately!');
    } else if (vehicleData.brakeFluidLevel === 'low') {
      tips.push('Brake fluid level is low. Top it up soon to ensure consistent braking performance.');
    }

    // --- Fluids (Oil, Coolant) ---
    if (vehicleData.oilLevelStatus === 'critical') {
      tips.push('🚨 Engine oil level is dangerously low. Do not ride until it is topped up or changed. Low oil can cause severe engine damage!');
    } else if (vehicleData.oilLevelStatus === 'low') {
      tips.push('Engine oil level is low. Please top it up or consider an oil change soon.');
    } else if (vehicleData.lastOilChangeKm && vehicleData.currentOdometer - vehicleData.lastOilChangeKm > 5000) { // Example interval
      tips.push(`It's been a while since your last oil change (${vehicleData.currentOdometer - vehicleData.lastOilChangeKm} km). Fresh oil keeps your engine happy!`);
    }

    if (vehicleData.coolingSystem === 'liquid') {
      if (vehicleData.coolantLevelStatus === 'critical') {
        tips.push('🚨 Coolant level is critically low. Your engine is at high risk of overheating. Top up immediately!');
      } else if (vehicleData.coolantLevelStatus === 'low') {
        tips.push('Coolant level is low. Top it up to prevent overheating, especially in hot weather.');
      }
    }

    // --- Chain (if applicable) ---
    if (vehicleData.chainLubeStatus === 'rusty') {
      tips.push('🚨 Your chain is rusty! This indicates severe neglect and can lead to breakage. Get it cleaned, lubricated, and inspected immediately.');
    } else if (vehicleData.chainLubeStatus === 'dry') {
      tips.push('Your chain is dry and needs lubrication. A dry chain can wear out faster and affect performance. Lube it up!');
    } else if (vehicleData.chainLubeStatus === 'needs-lube') {
      tips.push('Remember to lube your chain soon for smooth operation and extended life.');
    }

    if (vehicleData.chainTensionStatus === 'loose') {
      tips.push('Your chain is too loose. This can cause erratic power delivery and potentially derail. Get it adjusted.');
    } else if (vehicleData.chainTensionStatus === 'tight') {
      tips.push('Your chain is too tight. This puts excessive strain on the bearings and can damage components. Get it adjusted.');
    } else if (vehicleData.nextChainChangeDueKm && vehicleData.currentOdometer >= vehicleData.nextChainChangeDueKm - 1000) {
      tips.push(`Your chain is nearing its typical lifespan, due around ${vehicleData.nextChainChangeDueKm} km. Consider a replacement soon.`);
    }

    // --- Battery ---
    if (vehicleData.batteryHealth <= 20) {
      tips.push('🚨 Your battery health is critically low. This is a high risk for starting issues and breakdown. Consider replacing it immediately.');
    } else if (vehicleData.batteryHealth <= 40) {
      tips.push('Your battery health is low. Consider testing or replacing it to avoid unexpected starting issues, especially in cold weather.');
    } else {
      tips.push('Battery health looks good. If you don\'t ride often, consider a trickle charger.');
    }

    // --- Lights & Horn & Mirrors ---
    if (vehicleData.headlightFunction !== 'working' || vehicleData.taillightFunction !== 'working' || vehicleData.turnSignalFunction !== 'working' || vehicleData.hornFunction !== 'working') {
      tips.push('🚨 Critical safety check: One or more of your lights (headlight, taillight, turn signals) or horn is not fully functional. Get this fixed immediately for your safety and visibility.');
    } else if (vehicleData.headlightFunction === 'dim' || vehicleData.taillightFunction === 'dim' || vehicleData.turnSignalFunction === 'dim') {
      tips.push('Some of your lights appear dim. Check bulbs or wiring to ensure maximum visibility, especially at night.');
    }
    if (vehicleData.mirrorCondition !== 'good') {
      tips.push('Your mirrors are not in good condition. Replace or repair them to ensure clear rear visibility.');
    }

    // --- Recent Issues ---
    if (vehicleData.recentIssues && vehicleData.recentIssues.length > 0) {
      tips.push(`You've reported these recent issues: ${vehicleData.recentIssues.join(', ')}. It's highly recommended to get these checked by a qualified mechanic as soon as possible.`);
    }

    // --- Customizations ---
    if (vehicleData.customizations && vehicleData.customizations.length > 0) {
      tips.push(`Nice! Your bike has some customizations: ${vehicleData.customizations.join(', ')}. Ensure all aftermarket parts are installed correctly and are road-legal.`);
    }

    return tips.join(' ');
  }, []);

  /**
   * Provides tips for optimizing vehicle performance based on its characteristics.
   * @param {object} vehicleData - Combined specs, condition, and calculated metrics.
   * @returns {string} Performance optimization tips.
   */
  const generatePerformanceTips = useCallback((vehicleData) => {
    const tips = [];
    tips.push('Here are some tips to get the best out of your ride:');

    // --- Power and Weight ---
    if (vehicleData.powerToWeightRatio !== null) {
      if (vehicleData.powerToWeightRatio > 0.15) { // High power-to-weight
        tips.push(`Your ${vehicleData.make} ${vehicleData.model} has a fantastic power-to-weight ratio (${vehicleData.powerToWeightRatio} HP/kg)! Enjoy its spirited performance, but always ride responsibly and within your limits.`);
      } else if (vehicleData.powerToWeightRatio < 0.08) { // Lower power-to-weight
        tips.push(`Your bike has a moderate power-to-weight ratio (${vehicleData.powerToWeightRatio} HP/kg). Focus on smooth acceleration and maintaining momentum, especially during overtakes or with a pillion/luggage.`);
      }
    }

    // --- Fuel Efficiency and Range ---
    if (vehicleData.estimatedRange !== null) {
      if (vehicleData.estimatedRange < 200) {
        tips.push(`With an estimated range of ${vehicleData.estimatedRange} km, plan your fuel stops carefully, especially on long routes or in remote areas.`);
      } else {
        tips.push(`Your bike offers a good estimated range of ${vehicleData.estimatedRange} km. You can cover significant distances between refills, giving you more freedom.`);
      }
    }

    if (vehicleData.fuelEfficiency !== null) {
      if (vehicleData.fuelEfficiency < 25) {
        tips.push(`Your fuel efficiency is around ${vehicleData.fuelEfficiency} km/l. To improve it, try maintaining consistent speeds, avoiding aggressive throttle inputs, and ensuring proper tire pressure.`);
      } else {
        tips.push(`Great fuel efficiency at ${vehicleData.fuelEfficiency} km/l! Keep up the smooth riding habits to maximize your mileage.`);
      }
    }

    // --- Ground Clearance ---
    if (vehicleData.groundClearance !== null) {
      if (vehicleData.groundClearance < 140) {
        tips.push(`Your ground clearance (${vehicleData.groundClearance} mm) is on the lower side. Be extra careful over speed breakers, deep potholes, and rough terrain to avoid scraping the underbelly.`);
      } else if (vehicleData.groundClearance >= 200) {
        tips.push(`With ${vehicleData.groundClearance} mm ground clearance, your bike is well-suited for varied and even challenging terrains. Explore with confidence, but always assess the path ahead!`);
      }
    }

    // --- Tire Type and Usage ---
    // Now using terrainSuitabilityVerdict from calculatedMetrics
    if (vehicleData.terrainSuitabilityVerdict) {
      tips.push(`Based on its design and your current setup, your bike is ${vehicleData.terrainSuitabilityVerdict}.`);
    }
    if (vehicleData.tireType === 'off-road') {
        tips.push('You have off-road tires. These provide excellent grip on loose surfaces, but be aware they might affect on-road handling, cornering, and braking, especially in wet conditions.');
    } else if (vehicleData.tireType === 'road') {
        tips.push('You have road tires. These are optimized for asphalt and provide good grip and handling on paved surfaces.');
    } else if (vehicleData.tireType === 'dual-sport') {
      tips.push('Your dual-sport tires offer a good balance for both on-road and light off-road adventures. They are versatile for mixed terrain riding.');
    } else if (vehicleData.tireType === 'sport') {
      tips.push('Your sport tires offer excellent grip for spirited riding and track days. Ensure they are at optimal temperature for maximum performance, and always be aware of road conditions.');
    }


    // --- Advanced Features (ABS, TC, Quick Shifter) ---
    if (vehicleData.hasABS) {
      tips.push('Your bike has ABS (Anti-lock Braking System), a great safety feature! It helps prevent wheel lock-up during hard braking, especially on slippery surfaces.');
    }
    if (vehicleData.hasTractionControl) {
      tips.push('Traction Control helps manage wheel spin, especially on slippery roads or during aggressive acceleration. It adds an extra layer of safety.');
    }
    if (vehicleData.hasQuickShifter) {
      tips.push('Enjoy seamless gear changes with your quick shifter! It allows for faster acceleration and smoother downshifts without using the clutch.');
    }

    // --- Vehicle Age Considerations ---
    if (vehicleData.ageOfVehicleYears !== null && vehicleData.ageOfVehicleYears > 10) {
      tips.push(`Your bike is ${vehicleData.ageOfVehicleYears} years old. Older bikes might require a bit more care and attention to maintain peak performance. Regular checks are even more important.`);
    }

    // --- Emission Standard Awareness ---
    if (vehicleData.emissionStandard) { // Check if emissionStandard is available
      tips.push(`Your bike is a ${vehicleData.emissionStandard} model. Be aware of changing emission norms in some cities or regions, which might affect future usability.`);
    }

    return tips.join(' ');
  }, []);

  /**
   * Generates critical safety alerts based on vehicle condition.
   * @param {object} vehicleData - Combined specs, condition, and calculated metrics.
   * @returns {{alert: string, sentiment: string}} Critical safety alerts and overall sentiment.
   */
  const generateSafetyAlerts = useCallback((vehicleData) => {
    const alerts = [];
    let sentiment = 'positive';

    // --- Critical Component Wear ---
    if (vehicleData.tireWearLevelFront <= 10 || vehicleData.tireWearLevelRear <= 10) {
      alerts.push('🚨 CRITICAL: Tire wear is dangerously low. Risk of loss of grip and blowouts. Replace immediately!');
      sentiment = 'warning';
    }
    if (vehicleData.brakePadWearFront <= 10 || vehicleData.brakePadWearRear <= 10) {
      alerts.push('🚨 CRITICAL: Brake pads are severely worn. Risk of brake failure. Replace immediately!');
      sentiment = 'warning';
    }
    if (vehicleData.chainLubeStatus === 'rusty' || vehicleData.chainTensionStatus === 'loose' || vehicleData.chainTensionStatus === 'tight') {
      alerts.push('🚨 CRITICAL: Chain condition is poor (rusty/incorrect tension). Risk of chain breakage or derailment. Address immediately!');
      sentiment = 'warning';
    }

    // --- Critical Fluid Levels ---
    if (vehicleData.oilLevelStatus === 'critical') {
      alerts.push('🚨 CRITICAL: Engine oil level is dangerously low. Severe engine damage imminent. Do NOT ride until topped up!');
      sentiment = 'warning';
    }
    if (vehicleData.coolingSystem === 'liquid' && vehicleData.coolantLevelStatus === 'critical') {
      alerts.push('🚨 CRITICAL: Coolant level is dangerously low. High risk of engine overheating and damage. Top up immediately!');
      sentiment = 'warning';
    }
    if (vehicleData.brakeFluidLevel === 'critical') {
      alerts.push('🚨 CRITICAL: Brake fluid level is dangerously low. Risk of brake failure. Get it checked and topped up immediately!');
      sentiment = 'warning';
    }

    // --- Electrical & Visibility ---
    if (vehicleData.batteryHealth <= 10) {
      alerts.push('🚨 CRITICAL: Battery health is extremely poor. High risk of breakdown and starting failure.');
      sentiment = 'warning';
    }
    if (vehicleData.headlightFunction === 'not-working' || vehicleData.taillightFunction === 'not-working' || vehicleData.turnSignalFunction === 'not-working' || vehicleData.hornFunction === 'not-working') {
      alerts.push('🚨 CRITICAL: Essential safety component (lights/horn) is not working. Do NOT ride, especially at night or in traffic, until fixed!');
      sentiment = 'warning';
    }
    if (vehicleData.mirrorCondition === 'missing') {
      alerts.push('🚨 CRITICAL: Mirror is missing. Riding without proper rear visibility is extremely dangerous and illegal. Do NOT ride until replaced!');
      sentiment = 'warning';
    }

    // --- Reported Issues ---
    if (vehicleData.recentIssues && vehicleData.recentIssues.length > 0) {
      if (vehicleData.recentIssues.some(issue => issue.includes('engine') || issue.includes('brake') || issue.includes('steering') || issue.includes('suspension'))) {
        alerts.push(`🚨 URGENT: You've reported critical issues like: ${vehicleData.recentIssues.join(', ')}. These can severely compromise safety. Get professional diagnosis immediately.`);
        sentiment = 'warning';
      } else {
        alerts.push(`⚠️ You've reported recent issues: ${vehicleData.recentIssues.join(', ')}. While not immediately critical, get them checked soon to prevent escalation.`);
        if (sentiment === 'positive') sentiment = 'cautionary';
      }
    }

    // --- Overall Maintenance Status ---
    if (vehicleData.maintenanceUrgency === 'critical') {
      alerts.push('🚨 Overall maintenance status is CRITICAL. Riding is not recommended until all identified issues are resolved.');
      sentiment = 'warning';
    }

    const finalAlert = alerts.length > 0 ? `Safety Alert: ${alerts.join(' ')}` : 'No immediate safety concerns detected. Your bike appears ready for the road!';
    return { alert: finalAlert, sentiment: alerts.length > 0 ? sentiment : 'positive' };
  }, []);


  // --- API Call for Detailed Vehicle Specs (Placeholder for GPT/External API) ---
  const fetchDetailedVehicleSpecs = async (make, model, year) => {
    setIsLoadingVehicle(true);
    setErrorVehicle(null);
    try {
      // This is where you would make a real API call to your backend:
      // const response = await axios.post('/api/gpt-vehicle-fetch', { make, model, year });
      // return response.data;

      // --- SIMULATED RESPONSE (REPLACE WITH ACTUAL BACKEND CALL) ---
      const response = await new Promise(resolve => setTimeout(() => {
        const dummyDetailedSpecs = {
          'Honda': {
            'CB350': {
              engineCC: 348, groundClearance: 166, vehicleWeight: 181, fuelTankCapacity: 15,
              fuelEfficiency: 45, loadCapacity: 170, tireType: 'dual-sport', brakeType: 'disc',
              suspensionType: 'standard', serviceIntervalKm: 6000, serviceIntervalMonths: 6,
              coolingSystem: 'air', transmissionType: 'manual', emissionStandard: 'BS6',
              hasABS: true, hasTractionControl: false, hasQuickShifter: false,
              typicalTireLifespanKm: 20000, typicalBrakePadLifespanKm: 18000, typicalChainLifespanKm: 30000,
            },
            'CBR650R': {
              engineCC: 649, groundClearance: 130, vehicleWeight: 208, fuelTankCapacity: 15.4,
              fuelEfficiency: 20, loadCapacity: 180, tireType: 'sport', brakeType: 'ABS',
              suspensionType: 'adjustable', serviceIntervalKm: 12000, serviceIntervalMonths: 12,
              coolingSystem: 'liquid', transmissionType: 'manual', emissionStandard: 'BS6',
              hasABS: true, hasTractionControl: true, hasQuickShifter: true,
              typicalTireLifespanKm: 15000, typicalBrakePadLifespanKm: 12000, typicalChainLifespanKm: 20000,
            },
          },
          'Royal Enfield': {
            'Himalayan': {
              engineCC: 411, groundClearance: 220, vehicleWeight: 199, fuelTankCapacity: 15,
              fuelEfficiency: 30, loadCapacity: 200, tireType: 'off-road', brakeType: 'ABS',
              suspensionType: 'off-road', serviceIntervalKm: 10000, serviceIntervalMonths: 12,
              coolingSystem: 'air', transmissionType: 'manual', emissionStandard: 'BS6',
              hasABS: true, hasTractionControl: false, hasQuickShifter: false,
              typicalTireLifespanKm: 25000, typicalBrakePadLifespanKm: 20000, typicalChainLifespanKm: 35000,
            },
            'Classic 350': {
              engineCC: 349, groundClearance: 170, vehicleWeight: 195, fuelTankCapacity: 13,
              fuelEfficiency: 35, loadCapacity: 160, tireType: 'road', brakeType: 'disc',
              suspensionType: 'standard', serviceIntervalKm: 5000, serviceIntervalMonths: 6,
              coolingSystem: 'air', transmissionType: 'manual', emissionStandard: 'BS6',
              hasABS: true, hasTractionControl: false, hasQuickShifter: false,
              typicalTireLifespanKm: 20000, typicalBrakePadLifespanKm: 18000, typicalChainLifespanKm: 30000,
            },
          },
          'KTM': {
            '390 Duke': {
              engineCC: 373, groundClearance: 185, vehicleWeight: 163, fuelTankCapacity: 13.4,
              fuelEfficiency: 28, loadCapacity: 150, tireType: 'sport', brakeType: 'ABS',
              suspensionType: 'upside-down', serviceIntervalKm: 7500, serviceIntervalMonths: 12,
              coolingSystem: 'liquid', transmissionType: 'manual', emissionStandard: 'BS6',
              hasABS: true, hasTractionControl: true, hasQuickShifter: true,
              typicalTireLifespanKm: 12000, typicalBrakePadLifespanKm: 10000, typicalChainLifespanKm: 18000,
            },
          },
        };
        const found = dummyDetailedSpecs[make]?.[model];
        if (found) {
          resolve({ data: found });
        } else {
          resolve({ data: null }); // Simulate not found
        }
      }, 1000)); // Simulate network delay
      // --- END SIMULATED RESPONSE ---

      if (response.data) {
        return response.data;
      } else {
        setErrorVehicle(`Detailed specs for ${make} ${model} ${year} not found. Please check spelling or try another vehicle.`);
        return null;
      }
    } catch (err) {
      console.error('Error fetching detailed vehicle specs:', err.response ? err.response.data : err.message);
      setErrorVehicle('Failed to fetch vehicle specs. Please check your network or backend connection.');
      return null;
    } finally {
      setIsLoadingVehicle(false);
    }
  };

  // --- State Update Handlers ---

  /**
   * Updates vehicle specifications. If make, model, or year change, it triggers
   * a fetch to the AI backend to get detailed vehicle specs.
   * @param {object} input - Partial vehicle specs data (expected to contain make, model, year initially).
   */
  const updateVehicleSpecs = useCallback(async (input) => {
    let fetchedSpecs = {};
    const currentMake = vehicleSpecs.make;
    const currentModel = vehicleSpecs.model;
    const currentYear = vehicleSpecs.year;

    // Check if make, model, or year have changed in the input
    const makeChanged = input.make && input.make !== currentMake;
    const modelChanged = input.model && input.model !== currentModel;
    const yearChanged = input.year && input.year !== currentYear;

    // If any of the identifying fields change, attempt to fetch new specs
    if (makeChanged || modelChanged || yearChanged) {
      // Use the new input values, fallback to current state if not provided in input
      const newMake = input.make || currentMake;
      const newModel = input.model || currentModel;
      const newYear = input.year || currentYear;

      if (newMake && newModel && newYear) { // Only fetch if all identifying data is present
        fetchedSpecs = await fetchDetailedVehicleSpecs(newMake, newModel, newYear);
      }
    }

    // Merge the input, and then the fetched specs (fetched specs will override defaults)
    setVehicleSpecs(prev => deepMerge({ ...prev }, { ...input, ...fetchedSpecs }));
  }, [vehicleSpecs.make, vehicleSpecs.model, vehicleSpecs.year, fetchDetailedVehicleSpecs]);

  /**
   * Updates vehicle condition.
   * @param {object} input - Partial vehicle condition data.
   */
  const updateVehicleCondition = useCallback((input) => {
    setVehicleCondition(prev => deepMerge({ ...prev }, input));
  }, []);

  /**
   * Resets all vehicle-related states to their initial values.
   */
  const resetVehicleContext = useCallback(() => {
    setVehicleSpecs({
      make: '', model: '', year: null, // Only initial user inputs
      // Reset all AI-populated fields to null/defaults
      engineCC: null, groundClearance: null, vehicleWeight: null,
      fuelTankCapacity: null, fuelEfficiency: null, loadCapacity: null,
      tireType: null, brakeType: null, suspensionType: null,
      coolingSystem: null, transmissionType: null, emissionStandard: null,
      hasABS: null, hasTractionControl: null, hasQuickShifter: null,
      typicalTireLifespanKm: null, typicalBrakePadLifespanKm: null, typicalChainLifespanKm: null,
    });
    setVehicleCondition({
      currentOdometer: 0, tirePressureFront: null, tirePressureRear: null,
      tireWearLevelFront: 80, tireWearLevelRear: 80, brakePadWearFront: 80, brakePadWearRear: 80,
      brakeFluidLevel: 'good', chainLubeStatus: 'good', chainTensionStatus: 'good',
      oilLevelStatus: 'good', coolantLevelStatus: 'good', batteryHealth: 90,
      headlightFunction: 'working', taillightFunction: 'working', turnSignalFunction: 'working',
      hornFunction: 'working', mirrorCondition: 'good',
      lastTireChangeKm: 0, lastOilChangeKm: 0, lastBrakePadChangeKm: 0, lastChainChangeKm: 0,
      lastServiceKm: 0, lastServiceDate: null, recentIssues: [], customizations: [],
    });
    setCalculatedMetrics({
      powerToWeightRatio: null, estimatedRange: null, fuelCostPer100Km: null,
      nextServiceDueKm: null, nextServiceDueDate: null, nextTireChangeDueKm: null,
      nextBrakePadChangeDueKm: null, nextChainChangeDueKm: null, maintenanceUrgency: 'low',
      ageOfVehicleYears: null,
      remainingTireLifeKm: null, remainingBrakePadLifeKm: null, remainingChainLifeKm: null,
      terrainSuitabilityVerdict: '',
    });
    setVehicleRecommendation({
      maintenanceTips: '', performanceTips: '', safetyAlerts: '', overallVehicleSentiment: 'positive',
    });
    setErrorVehicle(null);
    setIsLoadingVehicle(false);
  }, []);

  // --- Main Effect Hook for Calculations and Recommendations ---
  // This useEffect will now primarily react to changes in vehicleSpecs (after AI fetch)
  // and vehicleCondition (user inputs).
  useEffect(() => {
    // Only proceed with calculations if essential vehicle specs are available (e.g., after AI fetch)
    // We check for a few key specs to ensure the AI fetch has completed successfully.
    if (!vehicleSpecs.engineCC || !vehicleSpecs.vehicleWeight || !vehicleSpecs.groundClearance) {
      console.log('Waiting for full vehicle specs from AI before calculating metrics...');
      // Reset calculated metrics and recommendations if specs are incomplete
      setCalculatedMetrics(prev => ({
        ...prev,
        powerToWeightRatio: null, estimatedRange: null, fuelCostPer100Km: null,
        nextServiceDueKm: null, nextServiceDueDate: null, nextTireChangeDueKm: null,
        nextBrakePadChangeDueKm: null, nextChainChangeDueKm: null, maintenanceUrgency: 'low',
        ageOfVehicleYears: null, remainingTireLifeKm: null, remainingBrakePadLifeKm: null,
        remainingChainLifeKm: null, terrainSuitabilityVerdict: '',
      }));
      setVehicleRecommendation({
        maintenanceTips: '', performanceTips: '', safetyAlerts: '', overallVehicleSentiment: 'neutral',
      });
      return;
    }

    // Combine all relevant vehicle data into a single object for comprehensive calculations
    const allVehicleData = {
      ...vehicleSpecs,
      ...vehicleCondition,
    };

    // Calculate age
    const ageOfVehicleYears = calculateVehicleAge(allVehicleData.year);

    // Calculate performance metrics
    const newPerformanceMetrics = calculatePerformanceMetrics(allVehicleData);

    // Assess maintenance needs
    const newMaintenanceNeeds = assessMaintenanceNeeds(allVehicleData, allVehicleData);

    // Determine terrain suitability
    const newTerrainSuitabilityVerdict = determineTerrainSuitability(allVehicleData);

    // Update calculated metrics state
    setCalculatedMetrics({
      ...newPerformanceMetrics,
      ...newMaintenanceNeeds,
      ageOfVehicleYears,
      terrainSuitabilityVerdict: newTerrainSuitabilityVerdict,
    });

    // Generate recommendations and alerts based on all current data
    const combinedDataForRecommendations = {
      ...allVehicleData,
      ...newPerformanceMetrics,
      ...newMaintenanceNeeds,
      ageOfVehicleYears, // Ensure age is passed
      terrainSuitabilityVerdict: newTerrainSuitabilityVerdict, // Ensure terrain verdict is passed
    };

    const newMaintenanceTips = generateMaintenanceTips(combinedDataForRecommendations);
    const newPerformanceTips = generatePerformanceTips(combinedDataForRecommendations);
    const { alert: newSafetyAlerts, sentiment: safetySentiment } = generateSafetyAlerts(combinedDataForRecommendations);

    // Determine overall sentiment for the vehicle
    let overallSentiment = 'positive';
    if (safetySentiment === 'warning' || newMaintenanceNeeds.maintenanceUrgency === 'critical') {
      overallSentiment = 'warning';
    } else if (safetySentiment === 'cautionary' || newMaintenanceNeeds.maintenanceUrgency === 'high') {
      overallSentiment = 'cautionary';
    } else if (newMaintenanceNeeds.maintenanceUrgency === 'moderate') {
      overallSentiment = 'neutral';
    }

    // Update vehicle recommendation state
    setVehicleRecommendation({
      maintenanceTips: newMaintenanceTips,
      performanceTips: newPerformanceTips,
      safetyAlerts: newSafetyAlerts,
      overallVehicleSentiment: overallSentiment,
    });

    // Debugging: Log state changes
    console.log('--- VehicleContext State Recalculated & Updated ---');
    console.log('Vehicle Specs:', vehicleSpecs);
    console.log('Vehicle Condition:', vehicleCondition);
    console.log('Calculated Metrics:', calculatedMetrics);
    console.log('Vehicle Recommendations:', vehicleRecommendation);
    console.log('--------------------------------------------------');

  }, [
    // Dependencies for useEffect: Trigger when identifying specs or any condition changes
    vehicleSpecs.make, vehicleSpecs.model, vehicleSpecs.year, // User inputs that trigger AI fetch
    // All AI-populated vehicleSpecs fields (ensure they trigger recalculation once populated)
    vehicleSpecs.engineCC, vehicleSpecs.groundClearance, vehicleSpecs.vehicleWeight,
    vehicleSpecs.fuelTankCapacity, vehicleSpecs.fuelEfficiency, vehicleSpecs.loadCapacity,
    vehicleSpecs.tireType, vehicleSpecs.brakeType, vehicleSpecs.suspensionType,
    vehicleSpecs.coolingSystem, vehicleSpecs.transmissionType, vehicleSpecs.serviceIntervalKm,
    vehicleSpecs.serviceIntervalMonths, vehicleSpecs.emissionStandard, vehicleSpecs.hasABS,
    vehicleSpecs.hasTractionControl, vehicleSpecs.hasQuickShifter, vehicleSpecs.typicalTireLifespanKm,
    vehicleSpecs.typicalBrakePadLifespanKm, vehicleSpecs.typicalChainLifespanKm,

    // All user-inputted vehicleCondition fields
    vehicleCondition.currentOdometer, vehicleCondition.tirePressureFront, vehicleCondition.tirePressureRear,
    vehicleCondition.tireWearLevelFront, vehicleCondition.tireWearLevelRear,
    vehicleCondition.brakePadWearFront, vehicleCondition.brakePadWearRear,
    vehicleCondition.brakeFluidLevel, vehicleCondition.chainLubeStatus, vehicleCondition.chainTensionStatus,
    vehicleCondition.oilLevelStatus, vehicleCondition.coolantLevelStatus, vehicleCondition.batteryHealth,
    vehicleCondition.headlightFunction, vehicleCondition.taillightFunction, vehicleCondition.turnSignalFunction,
    vehicleCondition.hornFunction, vehicleCondition.mirrorCondition,
    vehicleCondition.lastTireChangeKm, vehicleCondition.lastOilChangeKm, vehicleCondition.lastBrakePadChangeKm,
    vehicleCondition.lastChainChangeKm, vehicleCondition.lastServiceKm, vehicleCondition.lastServiceDate,
    vehicleCondition.recentIssues, vehicleCondition.customizations,

    // Memoized functions as dependencies
    calculatePerformanceMetrics, calculateVehicleAge, determineTerrainSuitability, assessMaintenanceNeeds,
    generateMaintenanceTips, generatePerformanceTips, generateSafetyAlerts,
  ]);


  // --- Context Value ---
  const contextValue = {
    vehicleSpecs,
    updateVehicleSpecs,
    vehicleCondition,
    updateVehicleCondition,
    calculatedMetrics,
    vehicleRecommendation,
    isLoadingVehicle,
    errorVehicle,
    resetVehicleContext,
  };

  // Provide the context value to children components
  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

// Hook for consuming the VehicleContext in functional components
export const useVehicle = () => useContext(VehicleContext);

export default VehicleContext;
