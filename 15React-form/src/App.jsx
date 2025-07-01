// src/App.jsx
import React, { useState } from 'react'; // useState is optional for this test form, but good practice

function App() {
  // State is not strictly needed for this non-submitting form,
  // but including it shows how state would typically be managed.
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    address: '',
    fathersName: '',
    email: '',
    phoneNumber: '',
  });

  // Optional: Handle input changes if using state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Optional: Prevent default form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted (simulation only):', formData);
    alert('Form submitted (simulation only). Check console.');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Test Banking Form</h1>

      {/*
        IMPORTANT: The 'id' and 'name' attributes on these input elements
        are what your Python script's Selenium locators in config/form_mappings.yaml
        will target. Make sure they match!
      */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

        {/* Personal Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Personal Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullNameInput">
                Full Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullNameInput"
                name="fullName"
                type="text"
                placeholder="Full Name"
              // value={formData.fullName} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dobInput">
                Date of Birth
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dobInput"
                name="dob"
                type="date"
              // value={formData.dob} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genderSelect">
                Gender
              </label>
              {/* Example of a select dropdown */}
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="genderSelect"
                name="gender"
              // value={formData.gender} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fathersNameInput">
                Father's Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fathersNameInput"
                name="fathersName"
                type="text"
                placeholder="Father's Name"
              // value={formData.fathersName} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="permanentAddressTextarea">
              Permanent Address
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="permanentAddressTextarea"
              name="permanentAddress"
              rows="3"
              placeholder="Permanent Address"
            // value={formData.address} // Optional if not using state
            // onChange={handleChange}   // Optional if not using state
            ></textarea>
          </div>
        </div>

        {/* Identification Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Identification Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="panNumberInput">
                PAN Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="panNumberInput"
                name="panNumber"
                type="text"
                placeholder="PAN Number"
              // value={formData.panNumber} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aadhaarNumberInput">
                Aadhaar Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="aadhaarNumberInput"
                name="aadhaarNumber"
                type="text"
                placeholder="Aadhaar Number"
              // value={formData.aadhaarNumber} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
          </div>
        </div>


        {/* Bank Account Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bank Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="accountNumberInput">
                Account Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="accountNumberInput"
                name="accountNumber"
                type="text"
                placeholder="Account Number"
              // value={formData.accountNumber} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ifscCodeInput">
                IFSC Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ifscCodeInput"
                name="ifscCode"
                type="text"
                placeholder="IFSC Code"
              // value={formData.ifscCode} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bankNameInput">
              Bank Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bankNameInput"
              name="bankName"
              type="text"
              placeholder="Bank Name"
            // value={formData.bankName} // Optional if not using state
            // onChange={handleChange}   // Optional if not using state
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailInput">
                Email Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="emailInput"
                name="email"
                type="email"
                placeholder="Email"
              // value={formData.email} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumberInput">
                Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phoneNumberInput"
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
              // value={formData.phoneNumber} // Optional if not using state
              // onChange={handleChange}   // Optional if not using state
              />
            </div>
          </div>
        </div>


        <div className="flex items-center justify-between">
          {/* This is the button your user will manually click */}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Simulate Submit
          </button>
          {/* Add any other buttons like "Reset" here if needed */}
        </div>
      </form>
    </div>
  );
}

export default App;