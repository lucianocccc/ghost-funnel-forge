
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, Phone } from 'lucide-react';

interface PersonalDataSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  firstName,
  lastName,
  email,
  password,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onPhoneChange
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-black border-b pb-2">Dati Personali</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-black">Nome *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="Nome"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-black">Cognome *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Cognome"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-black">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="inserisci la tua email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-black">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="crea una password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="pl-10"
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-black">Telefono</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="+39 123 456 7890"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSection;
