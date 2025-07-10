import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  accountHolderName: yup.string().required("Account holder name is required"),
  accountType: yup.string().required("Account type is required"),
  accountNumber: yup
    .string()
    .matches(/^\d{8,16}$/, "Account number must be 8-16 digits")
    .required(),
  routingNumber: yup
    .string()
    .matches(/^\d{9}$/, "Routing number must be 9 digits")
    .required(),
  branchName: yup.string().required(),
  branchCode: yup.string().required(),
  address: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  zip: yup
    .string()
    .matches(/^\d{5,6}$/, "Invalid ZIP/Postal code")
    .required(),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone must be 10 digits")
    .required(),
  email: yup.string().email("Invalid email").required(),
  dob: yup.string().required(),
  idType: yup.string().required(),
  idNumber: yup.string().required(),
  openingBalance: yup.number().min(0, "Must be non-negative").required(),
  nomineeName: yup.string(),
  nomineeRelation: yup.string(),
  occupation: yup.string(),
  annualIncome: yup.number().min(0, "Must be non-negative"),
});

type BankingFormValues = yup.InferType<typeof schema>;

// Helper function to normalize date to YYYY-MM-DD
function toDateInputValue(dateStr: string): string {
  if (!dateStr) return "";
  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Handle dd/mm/yyyy and dd-mm-yyyy
  let match = dateStr.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (match) {
    // dd/mm/yyyy or dd-mm-yyyy -> yyyy-mm-dd
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // Handle mm/dd/yyyy and mm-dd-yyyy
  match = dateStr.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // Fallback: try Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return dateStr;
}

// Expose fillFromAi via forwardRef!
const BankingForm = forwardRef((_props, ref) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BankingFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      accountHolderName: "",
      accountType: "",
      accountNumber: "",
      routingNumber: "",
      branchName: "",
      branchCode: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "",
      dob: "",
      idType: "",
      idNumber: "",
      openingBalance: 0,
      nomineeName: "",
      nomineeRelation: "",
      occupation: "",
      annualIncome: 0,
    },
  });

  // Expose fillFromAi to parent via ref
  useImperativeHandle(ref, () => ({
    fillFromAi: (fields: Partial<BankingFormValues>) => {
      Object.entries(fields).forEach(([key, value]) => {
        // Normalize dropdown and date values
        if (key === "dob" && typeof value === "string") {
          setValue("dob", toDateInputValue(value));
        } else if (key === "accountType" && typeof value === "string") {
          // Normalize to match select option if needed
          const allowed = ["Savings", "Current", "Fixed Deposit"];
          if (allowed.includes(value)) {
            setValue("accountType", value);
          } else {
            // Try to find similar
            const match = allowed.find(
              (v) => v.toLowerCase() === value.toLowerCase()
            );
            setValue("accountType", match ?? "");
          }
        } else if (key === "idType" && typeof value === "string") {
          const allowed = ["Aadhar", "Passport", "Voter ID", "Driving License"];
          if (allowed.includes(value)) {
            setValue("idType", value);
          } else {
            const match = allowed.find(
              (v) => v.toLowerCase() === value.toLowerCase()
            );
            setValue("idType", match ?? "");
          }
        } else if (key in schema.fields) {
          setValue(key as keyof BankingFormValues, value ?? "");
        }
      });
    },
  }));

  const onSubmit: SubmitHandler<BankingFormValues> = (data) => {
    alert("Form submitted!\n" + JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-2 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
      >
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
            Bank Account Opening Form
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block font-semibold mb-1">
              Account Holder Name
            </label>
            <input {...register("accountHolderName")} className="input" />
            <p className="error">{errors.accountHolderName?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Type</label>
            <select {...register("accountType")} className="input">
              <option value="">Select</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
            </select>
            <p className="error">{errors.accountType?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Number</label>
            <input {...register("accountNumber")} className="input" />
            <p className="error">{errors.accountNumber?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Routing Number</label>
            <input {...register("routingNumber")} className="input" />
            <p className="error">{errors.routingNumber?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Branch Name</label>
            <input {...register("branchName")} className="input" />
            <p className="error">{errors.branchName?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Branch Code</label>
            <input {...register("branchCode")} className="input" />
            <p className="error">{errors.branchCode?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input {...register("address")} className="input" />
            <p className="error">{errors.address?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">City</label>
            <input {...register("city")} className="input" />
            <p className="error">{errors.city?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">State</label>
            <input {...register("state")} className="input" />
            <p className="error">{errors.state?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">ZIP/Postal Code</label>
            <input {...register("zip")} className="input" />
            <p className="error">{errors.zip?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input {...register("phone")} className="input" />
            <p className="error">{errors.phone?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input {...register("email")} className="input" />
            <p className="error">{errors.email?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Date of Birth</label>
            <input type="date" {...register("dob")} className="input" />
            <p className="error">{errors.dob?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">ID Type</label>
            <select {...register("idType")} className="input">
              <option value="">Select</option>
              <option value="Aadhar">Aadhar</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Driving License">Driving License</option>
            </select>
            <p className="error">{errors.idType?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">ID Number</label>
            <input {...register("idNumber")} className="input" />
            <p className="error">{errors.idNumber?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Initial Deposit Amount
            </label>
            <input
              type="number"
              {...register("openingBalance")}
              className="input"
            />
            <p className="error">{errors.openingBalance?.message}</p>
          </div>
          <div>
            <label className="block font-semibold mb-1">Nominee Name</label>
            <input {...register("nomineeName")} className="input" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nominee Relation</label>
            <input {...register("nomineeRelation")} className="input" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Occupation</label>
            <input {...register("occupation")} className="input" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Annual Income</label>
            <input
              type="number"
              {...register("annualIncome")}
              className="input"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-8 py-3 bg-blue-700 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition"
        >
          Submit
        </button>
      </form>
      <style>
        {`
        .input {
          @apply block w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition;
        }
        .error {
          @apply text-red-500 text-sm mt-1;
        }
        `}
      </style>
    </div>
  );
});

export default BankingForm;
