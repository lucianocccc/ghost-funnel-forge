
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin } from 'lucide-react';

interface CompanyDataSectionProps {
  companyName: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  province: string;
  onCompanyNameChange: (value: string) => void;
  onVatNumberChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
}

const CompanyDataSection: React.FC<CompanyDataSectionProps> = ({
  companyName,
  vatNumber,
  address,
  city,
  postalCode,
  country,
  province,
  onCompanyNameChange,
  onVatNumberChange,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  onCountryChange,
  onProvinceChange
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-black border-b pb-2">Dati Aziendali</h4>
      
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-black">Nome Azienda</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="companyName"
            type="text"
            placeholder="Nome della tua azienda"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vatNumber" className="text-black">Partita IVA</Label>
        <Input
          id="vatNumber"
          type="text"
          placeholder="IT12345678901"
          value={vatNumber}
          onChange={(e) => onVatNumberChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-black">Indirizzo</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="address"
            type="text"
            placeholder="Via/Piazza e numero civico"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-black">Città</Label>
          <Input
            id="city"
            type="text"
            placeholder="Città"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-black">CAP</Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="00000"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="province" className="text-black">Provincia</Label>
          <Input
            id="province"
            type="text"
            placeholder="RM"
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-black">Paese</Label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">Italia</SelectItem>
              <SelectItem value="US">Stati Uniti</SelectItem>
              <SelectItem value="GB">Regno Unito</SelectItem>
              <SelectItem value="DE">Germania</SelectItem>
              <SelectItem value="FR">Francia</SelectItem>
              <SelectItem value="ES">Spagna</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CompanyDataSection;
