import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    fathersName: '',
    permanentAddress: '',
    panNumber: '',
    aadhaarNumber: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    email: '',
    phoneNumber: '',
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.dob && formData.gender;
      case 2:
        return formData.panNumber.match(/^\w{5}\d{4}\w$/) && formData.aadhaarNumber.length === 12;
      case 3:
        return formData.accountNumber && formData.ifscCode && formData.bankName;
      case 4:
        return formData.email && formData.phoneNumber;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('Please fill all required fields correctly.');
    }
  };
  const preventEnterSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted. Check console.');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Test Banking Form (Simulated SPA)</h1>

      <div className="tabs mb-6 flex justify-center gap-4">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            disabled={step > currentStep}
            className={`px-4 py-2 rounded ${step === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentStep(step)}
          >
            Step {step}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Personal Details</h2>
            <input name="fullName" placeholder="Full Name" onChange={handleChange} className="input" data-testid="fullName" /><br />
            <input name="dob" type="date" onChange={handleChange} className="input" data-testid="dob" /><br />
            <select name="gender" onChange={handleChange} className="input" data-testid="gender">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select><br />
            <input name="fathersName" placeholder="Father's Name" onChange={handleChange} className="input" /><br />
            <textarea name="permanentAddress" placeholder="Permanent Address" onChange={handleChange} className="input" />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Identification Details</h2>
            <input name="panNumber" placeholder="PAN Number (ABCDE1234F)" onChange={handleChange} className="input" data-testid="pan" /><br />
            <input name="aadhaarNumber" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} className="input" data-testid="aadhaar" /><br />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Bank Details</h2>
            <input name="accountNumber" placeholder="Account Number" onChange={handleChange} className="input" /><br />
            <input name="ifscCode" placeholder="IFSC Code" onChange={handleChange} className="input" /><br />
            <input name="bankName" placeholder="Bank Name" onChange={handleChange} className="input" /><br />
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 4: Contact Details</h2>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input" /><br />
            <input name="phoneNumber" type="tel" placeholder="Phone Number" onChange={handleChange} className="input" /><br />
          </div>
        )}

        <div className="flex justify-between mt-4">
          {currentStep < 4 && (
            <button type="button" onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
              Save & Next
            </button>
          )}
          {currentStep === 4 && (
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Submit
            </button>
          )}
        </div>
      </form>

      <style>{`
        .input {
          display: block;
          width: 100%;
          margin-bottom: 12px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default App;
