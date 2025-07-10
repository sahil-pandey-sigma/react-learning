// // This file exports a robust prompt string for Gemini-powered bank/KYC information extraction

// const geminiAutofillPrompt = `
// You are an expert document parser for financial and identity onboarding.

// Your task: Given raw extracted text from one or more documents (which may include bank passbooks, account statements, cheques, KYC documents, Voter IDs, PAN cards, Aadhaar cards, passports, utility bills, etc.), extract as many of the following fields as possible—using synonyms, context clues, and fallback logic.

// Instructions:
// - For each field, search ALL documents for synonyms, related terms, and context clues (e.g., "Name" for accountHolderName, "Mobile Number" for phone, "Branch" for branchName, etc.).
// - If a field is not found in banking documents, use details from any available KYC/ID document (Voter ID, PAN, Aadhaar, etc.).
// - Accept partial/approximate matches if exact phrasing is not found (e.g., treat "A/c No" or "A/c #" as "accountNumber", "DOB" as "dob").
// - For each field, if there are multiple plausible candidates, prefer:
//     1. Bank document values
//     2. KYC document values
//     3. Most recent value in the text
// - If a field is not present, leave it blank. Do NOT hallucinate plausible values.
// - Always return a JSON object with these exact field names (even if some are blank):
//   accountHolderName, accountType, accountNumber, routingNumber, branchName, branchCode, address, city, state, zip, phone, email, dob, idType, idNumber, openingBalance, nomineeName, nomineeRelation, occupation, annualIncome, ifscCode, micrCode, customerId, dateOfIssue

// Field hints and synonyms:
// - accountHolderName: "Name", "Account Holder", "Name as per Voter ID", "Name on PAN", "Name on Aadhaar", "Name on Passport", "Beneficiary"
// - accountType: "Account Type", "A/c Type", "Type of Account", "Savings", "Current", etc.
// - accountNumber: "Account Number", "A/c No", "A/c #", "A/c Number", "Bank Account No."
// - routingNumber: "Routing Number", "Routing #", "RTN", "Routing Code"
// - branchName: "Branch", "Branch Name", "Branch Location", "Branch Office"
// - branchCode: "Branch Code", "Branch ID", "Branch Number"
// - address: "Address", "Registered Address", "Residence Address", "Correspondence Address"
// - city: "City", "Town", "Village"
// - state: "State", "Province", "Region"
// - zip: "ZIP", "Postal Code", "PIN", "Pincode"
// - phone: "Mobile Number", "Phone", "Contact Number", "Telephone"
// - email: "Email", "Email ID", "E-mail"
// - dob: "DOB", "Date of Birth", "Birthdate"
// - idType: "ID Type", "Identification Type", "Document Type" (e.g., Voter ID, Aadhaar, PAN, Passport)
// - idNumber: "ID Number", "Identification Number", "Document Number", "Voter ID", "Aadhaar Number", "PAN", "Passport Number"
// - openingBalance: "Initial Deposit", "Opening Balance", "Initial Amount"
// - nomineeName: "Nominee", "Nominee Name", "Beneficiary Name"
// - nomineeRelation: "Nominee Relation", "Relationship with Nominee"
// - occupation: "Occupation", "Profession", "Job", "Employment"
// - annualIncome: "Annual Income", "Yearly Income", "Income"
// - ifscCode: "IFSC", "IFSC Code"
// - micrCode: "MICR", "MICR Code"
// - customerId: "Customer ID", "CIF", "CIF Number"
// - dateOfIssue: "Date of Issue", "Issued On", "Issue Date"

// If multiple IDs or addresses are present, use the one that seems most relevant for bank KYC or account details.

// Example input:
// Name: Rajesh Kumar Sharma
// A/c No: 123456789012
// Voter ID: ABC1234567
// Branch: Connaught Place, New Delhi
// Mobile Number: 9876543210
// DOB: 12/10/1980

// Example output:
// {
//   "accountHolderName": "Rajesh Kumar Sharma",
//   "accountNumber": "123456789012",
//   "idType": "Voter ID",
//   "idNumber": "ABC1234567",
//   "branchName": "Connaught Place, New Delhi",
//   "phone": "9876543210",
//   "dob": "12/10/1980",
//   ...
// }

// Document:
// `;

// export default geminiAutofillPrompt;

const geminiAutofillPrompt = `
Extract as many of the following fields as possible from the document below and return a JSON object with these exact field names: accountHolderName, accountType, accountNumber, routingNumber, branchName, branchCode, address, city, state, zip, phone, email, dob, idType, idNumber, openingBalance, nomineeName, nomineeRelation, occupation, annualIncome, ifscCode, micrCode, customerId, dateOfIssue.

For each field, look for direct matches or common synonyms. If a field is not present, leave it blank. For accountHolderName, if not found in a bank document, use the name from any official ID (like Voter ID, PAN, Aadhaar, etc.).

Document:
`;
export default geminiAutofillPrompt;
