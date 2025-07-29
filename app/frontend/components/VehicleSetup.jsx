import React, { useState, useContext } from 'react';
import axios from 'axios';
import RiderContext from '../context/RiderContext';
import { useVehicle } from '../context/VehicleContext';

const { vehicleData, updateVehicleData } = useVehicle();
const VehicleSetup = () => {
  const { updateVehicleDetails } = useContext(RiderContext);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [pillionGender, setPillionGender] = useState('male'); // default
  const [luggageWeight, setLuggageWeight] = useState(0);
  const [hardLuggage, setHardLuggage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetchSpecs = async () => {
    setLoading(true);

    try {
      const res = await axios.post('/api/gpt-vehicle-fetch/specs', { make, model, year });
      const specs = res.data;

      const pillionWeight = pillionGender === 'male' ? 75 : 60;
      const totalLoad = Number(luggageWeight) + pillionWeight;

      updateVehicleDetails({
        make,
        model,
        year,
        groundClearance: specs.groundClearance,
        vehicleWeight: specs.weight,
        engineCC: specs.engineCC,
        luggageWeight: Number(luggageWeight),
        hardLuggage,
        pillionGender,
        pillionWeight,
        totalLoad,
      });

      alert('Vehicle data loaded from GPT and saved to context!');
    } catch (error) {
      console.error(error);
      alert('Failed to fetch vehicle specs. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="vehicle-setup">
      <h2>Vehicle Setup</h2>

      <label>Make:</label>
      <input type="text" value={make} onChange={(e) => setMake(e.target.value)} />

      <label>Model:</label>
      <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />

      <label>Year:</label>
      <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />

      <label>Pillion Gender:</label>
      <select value={pillionGender} onChange={(e) => setPillionGender(e.target.value)}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <label>Luggage Weight (in kg):</label>
      <input type="number" value={luggageWeight} onChange={(e) => setLuggageWeight(e.target.value)} />

      <label>
        <input
          type="checkbox"
          checked={hardLuggage}
          onChange={(e) => setHardLuggage(e.target.checked)}
        />
        Hard Luggage (Top Box, Panniers, etc.)
      </label>

      <button onClick={handleFetchSpecs} disabled={loading}>
        {loading ? 'Fetching Specs...' : 'Submit & Fetch from AI'}
      </button>
    </div>
  );
};
useEffect(() => {
    const calculatedPillionWeight = vehicleData.pillionGender === 'male' ? 75 : 60;
    const totalLoad = calculatedPillionWeight + parseFloat(vehicleData.luggageWeight || 0);
  
    updateVehicleData({
      pillionWeight: calculatedPillionWeight,
      totalLoad: totalLoad,
    });
  }, [vehicleData.pillionGender, vehicleData.luggageWeight]);

export default VehicleSetup;
