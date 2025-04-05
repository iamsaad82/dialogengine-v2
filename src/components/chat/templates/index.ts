import { lazy } from 'react';
import React from 'react';

// Lazy-Loaded Components
const StandardMessage = lazy(() => import('./standard/StandardMessage'));
const AOKMessage = lazy(() => import('./aok/AOKMessage'));
const AOKKeyFacts = lazy(() => import('./aok/AOKKeyFacts'));
const AOKQuickOverview = lazy(() => import('./aok/AOKQuickOverview'));
const AOKContactInfo = lazy(() => import('./aok/AOKContactInfo'));

const CreditreformMessage = lazy(() => import('./creditreform/CreditreformMessage'));
const CreditreformKeyFacts = lazy(() => import('./creditreform/CreditreformKeyFacts'));
const CreditreformServiceSection = lazy(() => import('./creditreform/CreditreformServiceSection'));
const CreditreformInfo = lazy(() => import('./creditreform/CreditreformInfo'));

const BrandenburgMessage = lazy(() => import('./brandenburg/BrandenburgMessage'));
const BrandenburgServiceBox = lazy(() => import('./brandenburg/BrandenburgServiceBox'));
const BrandenburgNews = lazy(() => import('./brandenburg/BrandenburgNews'));
const BrandenburgInfo = lazy(() => import('./brandenburg/BrandenburgInfo'));

// Shopping Mall Template-Komponenten
const ShoppingMallMessage = lazy(() => import('./mall/ShoppingMallMessage'));

// Ninfly Sports Arena Template-Komponenten
const NinflyMessage = lazy(() => import('./ninfly/NinflyMessage'));
const NinflyKeyFacts = lazy(() => import('./ninfly/NinflyKeyFacts'));
const NinflyQuickOverview = lazy(() => import('./ninfly/NinflyQuickOverview'));

// Template-Komponenten-Interface
export interface TemplateComponents {
  Message: React.ComponentType<{
    content: string;
    isStreaming?: boolean;
    messageControls?: React.ReactNode;
    colorStyle?: Record<string, string>;
    isComplete: boolean;
  }>;
  KeyFacts?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  QuickOverview?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  ContactInfo?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  ServiceSection?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  Info?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  ServiceBox?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
  News?: React.ComponentType<{
    content: string;
    colorStyle?: Record<string, string>;
  }>;
}

/**
 * Template-Factory: Liefert die passenden Komponenten für das angeforderte Template
 */
export function getTemplateComponents(templateName?: string | null): TemplateComponents {
  // Default-Template (StandardMessage) als Fallback
  if (!templateName || templateName === 'default' || templateName === '') {
    return {
      Message: StandardMessage,
    };
  }

  // Template-spezifische Komponenten
  switch (templateName.toLowerCase()) {
    case 'aok':
      return {
        Message: AOKMessage,
        KeyFacts: AOKKeyFacts,
        QuickOverview: AOKQuickOverview,
        ContactInfo: AOKContactInfo,
      };

    case 'creditreform':
      return {
        Message: CreditreformMessage,
        KeyFacts: CreditreformKeyFacts,
        ServiceSection: CreditreformServiceSection,
        Info: CreditreformInfo,
      };

    case 'brandenburg':
      return {
        Message: BrandenburgMessage,
        ServiceBox: BrandenburgServiceBox,
        News: BrandenburgNews,
        Info: BrandenburgInfo,
      };

    case 'mall':
      return {
        Message: ShoppingMallMessage,
      };

    case 'ninfly':
      return {
        Message: NinflyMessage,
        KeyFacts: NinflyKeyFacts,
        QuickOverview: NinflyQuickOverview,
      };

    // Weitere Templates hier hinzufügen

    default:
      return {
        Message: StandardMessage,
      };
  }
}

// Template-Namen für UI-Anzeige
export const templateNames = {
  default: "Standard",
  aok: "AOK",
  creditreform: "Creditreform",
  brandenburg: "Brandenburg",
  mall: "Shopping Mall",
  ninfly: "Ninfly Sports Arena"
};

// MessageTemplates-Export für Abwärtskompatibilität
const MessageTemplates = {
  default: StandardMessage,
  aok: AOKMessage,
  creditreform: CreditreformMessage,
  brandenburg: BrandenburgMessage,
  mall: ShoppingMallMessage,
  ninfly: NinflyMessage
};

export default MessageTemplates;