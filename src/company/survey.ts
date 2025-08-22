export interface SurveyOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multi-select' | 'sortable-list';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  help?: string; // Add help property for tooltip
  description?: string; // Add description property for card description
  rows?: number; // Add rows property for textarea
  options?: SurveyOption[];
  maxSelections?: number;
  conditionalPrompts?: Record<string, string>;
}

export interface SurveySchema {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  id: string;
  label: string;
  value: string | string[];
}

export interface SurveyFormProps {
  schema: SurveySchema | null;
  initialValues?: SurveyResponse[];
  onChange?: (data: SurveyResponse[]) => void;
  onSave: (data: SurveyResponse[]) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  isNew?: boolean;
  hideActionButtons?: boolean;
}
