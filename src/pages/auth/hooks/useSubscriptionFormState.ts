
import { useState } from 'react';

export const useSubscriptionFormState = () => {
  // Dati personali
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Dati aziendali
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('IT');
  const [province, setProvince] = useState('');

  // Preferenze
  const [billingType, setBillingType] = useState('monthly');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  // Checkbox handlers to properly handle CheckedState
  const handleAgreeTermsChange = (checked: boolean | "indeterminate") => {
    setAgreeTerms(checked === true);
  };

  const handleAgreePrivacyChange = (checked: boolean | "indeterminate") => {
    setAgreePrivacy(checked === true);
  };

  const handleNewsletterChange = (checked: boolean | "indeterminate") => {
    setNewsletter(checked === true);
  };

  const getFormData = () => ({
    firstName,
    lastName,
    email,
    password,
    phone,
    companyName,
    vatNumber,
    address,
    city,
    postalCode,
    country,
    province,
    billingType,
    newsletter
  });

  return {
    // Personal data
    firstName,
    lastName,
    email,
    password,
    phone,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setPhone,

    // Company data
    companyName,
    vatNumber,
    address,
    city,
    postalCode,
    country,
    province,
    setCompanyName,
    setVatNumber,
    setAddress,
    setCity,
    setPostalCode,
    setCountry,
    setProvince,

    // Preferences
    billingType,
    setBillingType,
    agreeTerms,
    agreePrivacy,
    newsletter,
    handleAgreeTermsChange,
    handleAgreePrivacyChange,
    handleNewsletterChange,

    // Utility
    getFormData
  };
};
