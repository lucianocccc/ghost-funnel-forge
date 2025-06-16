
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentSectionProps {
  agreeTerms: boolean;
  agreePrivacy: boolean;
  newsletter: boolean;
  onAgreeTermsChange: (checked: boolean | "indeterminate") => void;
  onAgreePrivacyChange: (checked: boolean | "indeterminate") => void;
  onNewsletterChange: (checked: boolean | "indeterminate") => void;
}

const ConsentSection: React.FC<ConsentSectionProps> = ({
  agreeTerms,
  agreePrivacy,
  newsletter,
  onAgreeTermsChange,
  onAgreePrivacyChange,
  onNewsletterChange
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-black border-b pb-2">Consensi</h4>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="agreeTerms" 
          checked={agreeTerms}
          onCheckedChange={onAgreeTermsChange}
          required
        />
        <Label htmlFor="agreeTerms" className="text-sm text-black">
          Accetto i <span className="text-golden underline cursor-pointer">Termini di Servizio</span> *
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="agreePrivacy" 
          checked={agreePrivacy}
          onCheckedChange={onAgreePrivacyChange}
          required
        />
        <Label htmlFor="agreePrivacy" className="text-sm text-black">
          Accetto la <span className="text-golden underline cursor-pointer">Privacy Policy</span> *
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="newsletter" 
          checked={newsletter}
          onCheckedChange={onNewsletterChange}
        />
        <Label htmlFor="newsletter" className="text-sm text-black">
          Desidero ricevere newsletter e aggiornamenti sui prodotti
        </Label>
      </div>
    </div>
  );
};

export default ConsentSection;
