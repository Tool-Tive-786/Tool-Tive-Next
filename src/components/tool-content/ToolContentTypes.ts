// ToolTive — Tool Content Section Types
// Reusable data model for all tool page content sections

export interface ToolContentConfig {
    categoryLabel: string;
    intro: {
        heading: string;
        headingAccent: string;
        description: string;
        featuredImage?: string;
        featuredImageAlt?: string;
    };
    valueProps: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    whyUse: {
        eyebrow: string;
        heading: string;
        description: string;
        points: Array<{
            title: string;
            description?: string;
        }>;
    };
    features: {
        eyebrow: string;
        heading: string;
        description: string;
        items: Array<{
            title: string;
            description: string;
        }>;
    };
    howTo: {
        eyebrow: string;
        heading: string;
        description: string;
        steps: Array<{
            title: string;
            description: string;
        }>;
    };
    goodToKnow?: Array<{
        label: string;
        value: string;
    }>;
    privacy?: {
        title: string;
        description: string;
    };
    relatedTools?: Array<{
        href: string;
        title: string;
        description: string;
        icon: string;
    }>;
}
