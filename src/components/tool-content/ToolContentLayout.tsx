import React from 'react';
import { ToolContentConfig } from './ToolContentTypes';
import ToolValueStrip from './ToolValueStrip';
import ToolWhySection from './ToolWhySection';
import ToolFeatureSection from './ToolFeatureSection';
import ToolHowToSection from './ToolHowToSection';
import ToolInfoSection from './ToolInfoSection';
import ToolRelatedSection from './ToolRelatedSection';
import '@/styles/tool-content.css';

interface ToolContentLayoutProps {
    config: ToolContentConfig;
}

export default function ToolContentLayout({ config }: ToolContentLayoutProps) {
    return (
        <div className="tc-content-area">
            {/* Value Strip */}
            {config.valueProps && config.valueProps.length > 0 && (
                <ToolValueStrip items={config.valueProps} />
            )}

            {/* Why Use Section */}
            {config.whyUse && (
                <ToolWhySection
                    eyebrow={config.whyUse.eyebrow}
                    heading={config.whyUse.heading}
                    description={config.whyUse.description}
                    points={config.whyUse.points}
                />
            )}

            {/* Features Section */}
            {config.features && (
                <ToolFeatureSection
                    eyebrow={config.features.eyebrow}
                    heading={config.features.heading}
                    description={config.features.description}
                    items={config.features.items}
                />
            )}

            {/* How-To Section */}
            {config.howTo && (
                <ToolHowToSection
                    eyebrow={config.howTo.eyebrow}
                    heading={config.howTo.heading}
                    description={config.howTo.description}
                    steps={config.howTo.steps}
                />
            )}

            {/* Good to Know + Privacy */}
            {(config.goodToKnow || config.privacy) && (
                <ToolInfoSection
                    items={config.goodToKnow || []}
                    privacy={config.privacy}
                />
            )}

            {/* Related Tools */}
            {config.relatedTools && config.relatedTools.length > 0 && (
                <ToolRelatedSection tools={config.relatedTools} />
            )}
        </div>
    );
}
