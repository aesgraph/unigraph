import { AlertCircle, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";

// Form schema defines fields, validation rules, and error messages
interface FormSchemaField {
  validate: (value: string) => string | null;
  label: string;
}

interface FormSchema {
  [key: string]: FormSchemaField;
}

const formSchema: FormSchema = {
  username: {
    validate: (value) => {
      if (!value) return "Username is required";
      if (value.length < 3) return "Username must be at least 3 characters";
      return null;
    },
    label: "Username",
  },
  email: {
    validate: (value) => {
      if (!value) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
      return null;
    },
    label: "Email",
  },
  age: {
    validate: (value) => {
      if (!value) return "Age is required";
      if (isNaN(Number(value)) || Number(value) < 18)
        return "Must be at least 18";
      return null;
    },
    label: "Age",
  },
};

interface FormFieldProps {
  name: string;
  value: string;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  schema: FormSchema;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  error,
  onChange,
  schema,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1" htmlFor={name}>
      {schema[name].label}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-md ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && (
      <div className="flex items-center mt-1 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

interface FormData {
  [key: string]: string;
}

const DynamicForm = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    age: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  interface Errors {
    [key: string]: string | null;
  }

  const validateField = (name: string, value: string): string | null => {
    const validator = formSchema[name].validate;
    return validator(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Errors = {};
    Object.keys(formSchema).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitted(true);
      // Handle successful submission
      console.log("Form submitted:", formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      {isSubmitted ? (
        <div className="flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-6 h-6 mr-2" />
          <span>Form submitted successfully!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {Object.keys(formSchema).map((fieldName) => (
            <FormField
              key={fieldName}
              name={fieldName}
              value={formData[fieldName]}
              error={errors[fieldName]}
              onChange={handleChange}
              schema={formSchema}
            />
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default DynamicForm;
