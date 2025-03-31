// calorie-calc.js
document.getElementById('calorie-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    // Get form values
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const heartRate = parseInt(document.getElementById('heart-rate').value);
    const bodyTemp = parseFloat(document.getElementById('body-temp').value);
    const exerciseType = document.getElementById('exercise-type').value;
    const duration = parseInt(document.getElementById('duration').value);

    // Validation
    let isValid = true;
    if (age < 1 || age > 120) {
        document.getElementById('age-error').textContent = 'Age must be between 1 and 120';
        isValid = false;
    }
    if (!gender) {
        document.getElementById('result').textContent = 'Please select a gender';
        isValid = false;
    }
    if (weight < 1 || weight > 300) {
        document.getElementById('weight-error').textContent = 'Weight must be between 1 and 300 kg';
        isValid = false;
    }
    if (height < 50 || height > 250) {
        document.getElementById('height-error').textContent = 'Height must be between 50 and 250 cm';
        isValid = false;
    }
    if (heartRate < 40 || heartRate > 200) {
        document.getElementById('heart-rate-error').textContent = 'Heart rate must be between 40 and 200 bpm';
        isValid = false;
    }
    if (bodyTemp < 35 || bodyTemp > 42) {
        document.getElementById('body-temp-error').textContent = 'Temperature must be between 35 and 42°C';
        isValid = false;
    }
    if (!exerciseType) {
        document.getElementById('result').textContent = 'Please select an exercise type';
        isValid = false;
    }
    if (duration < 1 || duration > 1440) {
        document.getElementById('duration-error').textContent = 'Duration must be between 1 and 1440 minutes';
        isValid = false;
    }

    if (!isValid) return;

    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // MET values
    const metValues = {
        running: 10,
        cycling: 8,
        swimming: 7,
        weightlifting: 6,
        walking: 3.8
    };

    // Adjustments
    const heartRateFactor = heartRate > 100 ? 1.1 : 1.0;
    const tempFactor = bodyTemp > 37 ? 1.05 : 1.0;

    // Calculate calories
    const met = metValues[exerciseType];
    const calories = (bmr / 24) * met * (duration / 60) * heartRateFactor * tempFactor;

    // Show the popup with calculated calories
    showPopup(calories.toFixed(1));
});

function showPopup(calories) {
    document.getElementById("calories").textContent = calories;
    document.getElementById("result-popup").style.display = "flex";
}

function closePopup() {
    document.getElementById("result-popup").style.display = "none";
}