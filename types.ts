export interface DimensionData {
  score: number;
  evidence: string[];
}

export interface AuthenticityAnalysis {
  name: string;
  authenticity_analysis: {
    alignment: DimensionData;
    boundary_consistency: DimensionData;
    shadow_integration: DimensionData;
    ethical_string_influence: DimensionData;
    self_expression: DimensionData;
  };
  narrative_summary: string;
}

export type View = 'publicFigure' | 'userAssessment';

export interface UserAnswers {
  [key: string]: string;
}

export interface CachedAnalyses {
  [key: string]: AuthenticityAnalysis;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}