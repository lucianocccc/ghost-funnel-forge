
import React, { useState } from 'react';
import { ChatBotSettings } from '@/types/chatbot';
import SettingsHeader from '@/components/admin/chatbot/settings/SettingsHeader';
import PersonalitySection from '@/components/admin/chatbot/settings/PersonalitySection';
import ResponseLengthSection from '@/components/admin/chatbot/settings/ResponseLengthSection';
import SpecializationSection from '@/components/admin/chatbot/settings/SpecializationSection';
import LanguageSection from '@/components/admin/chatbot/settings/LanguageSection';
import TemperatureSection from '@/components/admin/chatbot/settings/TemperatureSection';
import SettingsActions from '@/components/admin/chatbot/settings/SettingsActions';

interface AdminChatSettingsProps {
  settings: ChatBotSettings;
  onSaveSettings: (settings: ChatBotSettings) => void;
}

const AdminChatSettings: React.FC<AdminChatSettingsProps> = ({
  settings,
  onSaveSettings
}) => {
  const [currentSettings, setCurrentSettings] = useState<ChatBotSettings>({...settings});
  
  const handleChange = (field: keyof ChatBotSettings, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    onSaveSettings(currentSettings);
  };
  
  const handleReset = () => {
    setCurrentSettings({...settings});
  };

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <div className="space-y-8">
        <PersonalitySection
          personality={currentSettings.personality}
          onChange={(value) => handleChange('personality', value)}
        />

        <ResponseLengthSection
          responseLength={currentSettings.responseLength}
          onChange={(value) => handleChange('responseLength', value)}
        />

        <SpecializationSection
          specialization={currentSettings.specialization}
          onChange={(value) => handleChange('specialization', value)}
        />

        <LanguageSection
          language={currentSettings.language}
          onChange={(value) => handleChange('language', value)}
        />

        <TemperatureSection
          temperature={currentSettings.temperature}
          onChange={(value) => handleChange('temperature', value)}
        />

        <SettingsActions
          onSave={handleSave}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default AdminChatSettings;
