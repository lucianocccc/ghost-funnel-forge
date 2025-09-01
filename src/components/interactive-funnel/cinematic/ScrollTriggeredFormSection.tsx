import React, { useState, useEffect, useCallback } from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface ScrollTriggeredFormSectionProps {
  step: InteractiveFunnelStep;
  scrollProgress: number;
  isActive: boolean;
  onDataChange: (data: any) => void;
  existingData?: any;
  colorScheme: any;
  isLastScene: boolean;
  onFinalSubmit: () => void;
}

export const ScrollTriggeredFormSection: React.FC<ScrollTriggeredFormSectionProps> = ({
  step,
  scrollProgress,
  isActive,
  onDataChange,
  existingData,
  colorScheme,
  isLastScene,
  onFinalSubmit
}) => {
  const [formData, setFormData] = useState(existingData || {});
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [visibleFields, setVisibleFields] = useState(0);

  // Progressive field revelation based on scroll
  useEffect(() => {
    if (!step.fields_config || !Array.isArray(step.fields_config)) return;
    
    const totalFields = step.fields_config.length;
    const newVisibleFields = Math.floor(scrollProgress * totalFields * 1.5);
    setVisibleFields(Math.min(newVisibleFields, totalFields));
  }, [scrollProgress, step.fields_config]);

  // Auto-update parent when form data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  // Validate form completion
  useEffect(() => {
    if (!step.fields_config || !Array.isArray(step.fields_config)) {
      setIsValidationComplete(true);
      return;
    }

    const requiredFields = step.fields_config.filter(field => field.required);
    const isComplete = requiredFields.every(field => 
      formData[field.id] && formData[field.id].toString().trim().length > 0
    );
    setIsValidationComplete(isComplete);
  }, [formData, step.fields_config]);

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const renderField = (field: any, index: number) => {
    const isVisible = index < visibleFields;
    const fieldValue = formData[field.id] || '';

    return (
      <motion.div
        key={field.id}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 30,
          scale: isVisible ? 1 : 0.9
        }}
        transition={{ 
          duration: 0.6,
          delay: index * 0.1,
          ease: "easeOut"
        }}
        className="space-y-2"
      >
        <Label 
          htmlFor={field.id} 
          className={`${colorScheme.text} font-medium text-lg`}
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </Label>

        {field.type === 'textarea' && (
          <Textarea
            id={field.id}
            placeholder={field.placeholder || ''}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${colorScheme.surface} ${colorScheme.border} border backdrop-blur-md text-foreground placeholder:text-muted-foreground min-h-[120px] focus:ring-2 focus:ring-golden/50 transition-all duration-300`}
            required={field.required}
          />
        )}

        {field.type === 'checkbox' && field.options && (
          <div className="space-y-3">
            {field.options.map((option: string, optionIndex: number) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index * 0.1) + (optionIndex * 0.05) }}
                className="flex items-center space-x-3"
              >
                <Checkbox
                  id={`${field.id}-${optionIndex}`}
                  checked={(fieldValue || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = fieldValue || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                  className="border-border data-[state=checked]:bg-golden data-[state=checked]:border-golden"
                />
                <Label 
                  htmlFor={`${field.id}-${optionIndex}`}
                  className={`${colorScheme.text} cursor-pointer hover:text-golden transition-colors`}
                >
                  {option}
                </Label>
              </motion.div>
            ))}
          </div>
        )}

        {field.type === 'radio' && field.options && (
          <RadioGroup
            value={fieldValue}
            onValueChange={(value) => handleInputChange(field.id, value)}
            className="space-y-3"
          >
            {field.options.map((option: string, optionIndex: number) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index * 0.1) + (optionIndex * 0.05) }}
                className="flex items-center space-x-3"
              >
                <RadioGroupItem 
                  value={option} 
                  id={`${field.id}-${optionIndex}`}
                  className="border-border text-golden"
                />
                <Label 
                  htmlFor={`${field.id}-${optionIndex}`}
                  className={`${colorScheme.text} cursor-pointer hover:text-golden transition-colors`}
                >
                  {option}
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        )}

        {!['textarea', 'checkbox', 'radio'].includes(field.type) && (
          <Input
            id={field.id}
            type={field.type || 'text'}
            placeholder={field.placeholder || ''}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${colorScheme.surface} ${colorScheme.border} border backdrop-blur-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-golden/50 transition-all duration-300 text-lg py-3`}
            required={field.required}
          />
        )}
      </motion.div>
    );
  };

  // Don't render form for content-only steps
  if (step.step_type === 'content') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${colorScheme.surface} ${colorScheme.border} border backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl`}
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-golden to-primary rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className={`text-2xl font-semibold ${colorScheme.text}`}>
              {step.title}
            </h3>
            <p className={`${colorScheme.text} opacity-80 leading-relaxed`}>
              {step.description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`${colorScheme.surface} ${colorScheme.border} border backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl`}
    >
      {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 ? (
        <div className="space-y-8">
          {step.fields_config.map((field, index) => renderField(field, index))}

          {/* Completion indicator */}
          <AnimatePresence>
            {isValidationComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center space-x-3 p-4 bg-golden/10 border border-golden/20 rounded-lg"
              >
                <Check className="w-5 h-5 text-golden" />
                <span className="text-golden font-medium">
                  {isLastScene ? 'Pronto per l\'invio finale!' : 'Sezione completata!'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final submit button for last scene */}
          {isLastScene && isValidationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <Button
                onClick={onFinalSubmit}
                size="lg"
                className="w-full bg-golden hover:bg-golden/90 text-black font-semibold py-4 text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Completa il Funnel
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Nessun campo configurato per questa sezione
          </p>
        </div>
      )}
    </motion.div>
  );
};