// utils/riderUtils.js

/**
 * Calculate Body Mass Index (BMI)
 * @param {number} weight - in kilograms
 * @param {number} height - in centimeters
 * @returns {number|null}
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    return +bmi.toFixed(2);
  };
  
  /**
   * Evaluate rider stamina holistically using BMI, age, sleep, hydration, terrain adaptation, and physical activity level.
   * @param {object} rider - { age, weight, height, activityLevel, sleepHours, hydrationLitres, terrainAdaptability }
   * @returns {object} { staminaLevel, staminaScore, reason }
   */
  export const evaluateStaminaProfile = (rider) => {
    const {
      age = 30,
      weight = 70,
      height = 175,
      activityLevel = 'moderate', // 'low', 'moderate', 'high'
      sleepHours = 6,
      hydrationLitres = 2.5,
      terrainAdaptability = 'moderate' // 'low', 'moderate', 'high'
    } = rider;
  
    const bmi = calculateBMI(weight, height);
    let score = 0;
    const reasons = [];
  
    // Age Factor
    if (age < 30) {
      score += 2;
      reasons.push("Young age boosts endurance.");
    } else if (age < 50) {
      score += 1;
      reasons.push("Balanced maturity. Ride with breaks.");
    } else {
      score -= 1;
      reasons.push("Higher age. Prioritize comfort and rest.");
    }
  
    // BMI Factor
    if (bmi >= 18.5 && bmi <= 24.9) {
      score += 2;
      reasons.push("Healthy BMI supports long rides.");
    } else if (bmi < 18.5) {
      score -= 1;
      reasons.push("Underweight. Take nutrition seriously.");
    } else {
      score -= 1;
      reasons.push("High BMI. May feel fatigue on longer rides.");
    }
  
    // Sleep
    if (sleepHours >= 7) {
      score += 1;
      reasons.push("Good sleep restores muscle recovery.");
    } else if (sleepHours < 5) {
      score -= 1;
      reasons.push("Poor sleep reduces reflexes and stamina.");
    }
  
    // Hydration
    if (hydrationLitres >= 2.5) {
      score += 1;
      reasons.push("Well hydrated. Less chance of cramps.");
    } else {
      score -= 1;
      reasons.push("Low water intake. Risk of dehydration.");
    }
  
    // Activity Level
    if (activityLevel === 'high') {
      score += 2;
      reasons.push("Active lifestyle enables longer rides.");
    } else if (activityLevel === 'low') {
      score -= 1;
      reasons.push("Sedentary lifestyle. Need breaks and training.");
    }
  
    // Terrain Adaptability
    if (terrainAdaptability === 'high') {
      score += 2;
      reasons.push("Familiar with hilly/rough terrain.");
    } else if (terrainAdaptability === 'low') {
      score -= 1;
      reasons.push("Needs practice with terrain transitions.");
    }
  
    // Interpret Score
    let staminaLevel = 'moderate';
    if (score >= 6) staminaLevel = 'high';
    else if (score <= 2) staminaLevel = 'low';
  
    return {
      bmi,
      staminaScore: score,
      staminaLevel,
      reason: reasons.join(' '),
    };
  };
  
  /**
   * Generate natural language tips based on stamina & bike type
   * @param {string} staminaLevel 
   * @param {string} bikeType - 'cruiser' | 'adventure' | 'tourer' | 'scooter'
   */
  export const personalizedRidingAdvice = (staminaLevel, bikeType = 'cruiser') => {
    const advice = {
      cruiser: {
        low: "Your comfort is key. Stick to straight, flat highways and schedule tea stops every 60-80 km.",
        moderate: "Perfect for weekend tours. Maintain 80-100 kmph, hydrate every 2 hours.",
        high: "Let the engine sing — long stretches of 300+ km are within your capability. Enjoy cruising!"
      },
      adventure: {
        low: "Avoid steep trails. Focus on gaining experience on mild gradients and gravel roads.",
        moderate: "You’re ready to challenge hills. Moderate inclines with light luggage should be fine.",
        high: "Take the dirt. Your stamina supports intense terrain and remote expeditions."
      },
      tourer: {
        low: "Pack light. Stick to 150 km/day with frequent stops.",
        moderate: "You're tour-ready. Explore 250 km days across mixed terrains.",
        high: "The open road awaits. Go wild on 300-400 km ride days."
      },
      scooter: {
        low: "Avoid inclines and limit to 50-70 km/day.",
        moderate: "City tours and suburban rides of 100+ km are doable.",
        high: "Max out potential. Long state highways are within reach with backup."
      }
    };
  
    return advice[bikeType]?.[staminaLevel] || "Stay safe, gear up, and hydrate well!";
  };
  
  /**
   * Convert staminaLevel to numeric scale (for AI scoring)
   */
  export const staminaToScore = (staminaLevel) => {
    switch (staminaLevel) {
      case 'high': return 3;
      case 'moderate': return 2;
      case 'low': return 1;
      default: return 2;
    }
  };
  
  /**
   * AI-based ride success predictor using rider + terrain context
   * @param {object} riderProfile 
   * @param {object} terrain - { type: 'highway'|'mountain'|'mixed', elevationGain: number, distance: number }
   */
  export const predictRideSuccess = (riderProfile, terrain) => {
    const { staminaScore, staminaLevel } = evaluateStaminaProfile(riderProfile);
    const { type = 'highway', elevationGain = 500, distance = 200 } = terrain;
  
    let baseSuccess = staminaScore * 10;
    let terrainPenalty = 0;
  
    if (type === 'mountain') terrainPenalty = elevationGain > 1000 ? 15 : 10;
    if (type === 'mixed') terrainPenalty = elevationGain > 500 ? 10 : 5;
  
    if (distance > 300) terrainPenalty += 5;
    if (distance > 500) terrainPenalty += 10;
  
    let finalScore = Math.max(0, Math.min(100, baseSuccess + 40 - terrainPenalty));
    let riskNote = finalScore < 50
      ? "High risk. Plan recovery halts, hydration, and don't ride alone."
      : finalScore < 70
      ? "Moderate risk. Carry backup gear and ride in group."
      : "Ride is feasible. Maintain discipline and breaks.";
  
    return {
      successRate: finalScore,
      riskLevel: finalScore < 50 ? "High" : finalScore < 70 ? "Moderate" : "Low",
      recommendation: riskNote,
      staminaLevel
    };
  };
  