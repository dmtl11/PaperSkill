import React from 'react';
import { ExampleSlider } from './exampleSlider';
import { PatchTSTExplorer } from './patchtst-explorer';

export interface WidgetProps {
  chapterId: string;
  moduleId: string;
}

export const widgetRegistry: Record<string, React.FC<WidgetProps>> = {};
widgetRegistry['example-slider'] = ExampleSlider;
widgetRegistry['patchtst-explorer'] = PatchTSTExplorer;
