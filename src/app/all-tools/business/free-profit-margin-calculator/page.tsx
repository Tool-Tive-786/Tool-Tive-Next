import { Metadata } from 'next';
import ProfitMarginCalculatorNoSSR from '@/components/tools/profit-margin/ProfitMarginCalculatorNoSSR';
import FaqSection from '@/components/FaqSection';
import ToolHeroSection from '@/components/tool-content/ToolHeroSection';
import ToolContentLayout from '@/components/tool-content/ToolContentLayout';
import { ToolContentConfig } from '@/components/tool-content/ToolContentTypes';
import { getToolBySlug } from '@/lib/tools';

export const metadata: Metadata = {
    title: 'Free Profit Margin Calculator | Calculate Margin & Markup',
    description: 'Calculate profit margin, markup, profit per sale, and target selling price. Add shipping, fees, discounts, and other costs with this free calculator.',
    keywords: 'profit margin calculator, profit margin calculator online, profit margin calculator free, gross profit margin calculator, markup calculator, margin vs markup calculator, selling price calculator',
    robots: { index: true, follow: true },
    alternates: { canonical: '/all-tools/business/free-profit-margin-calculator' },
};

const pmcContentConfig: ToolContentConfig = {
    categoryLabel: 'Business Tools',
    intro: {
        heading: 'Free',
        headingAccent: 'Profit Margin Calculator.',
        description: 'Calculate profit margin, markup, profit per sale, and target selling price. Add shipping, fees, discounts, and other costs with this free calculator.',
    },
    valueProps: [
        {
            icon: 'fas fa-calculator',
            title: 'Accurate Formulas',
            description: 'Calculates true margin and markup.'
        },
        {
            icon: 'fas fa-tags',
            title: 'Fee-Aware',
            description: 'Includes percentage-based fees in reverse pricing.'
        },
        {
            icon: 'fas fa-percent',
            title: 'Discount Support',
            description: 'Accurately calculates profit after discounts.'
        },
        {
            icon: 'fas fa-lock',
            title: '100% Private',
            description: 'All calculations run directly in your browser.'
        }
    ],
    whyUse: {
        eyebrow: 'Features',
        heading: 'More Than Just Margin',
        description: 'This calculator gives you the complete picture of your product profitability.',
        points: [
            {
                title: 'Calculate Margin and Markup',
                description: 'Quickly find your profit margin and markup with one tool.'
            },
            {
                title: 'Target Pricing',
                description: 'Need a specific margin? Enter your target and find out exactly what to charge.'
            },
            {
                title: 'Advanced Costs',
                description: 'Factor in shipping, packaging, and percentage fees (like payment processing or marketplace fees).'
            },
            {
                title: 'Scenario Comparison',
                description: 'Compare multiple price points to see how small changes affect your bottom line.'
            }
        ]
    },
    features: {
        eyebrow: 'Detailed Breakdown',
        heading: 'Understand Your Costs',
        description: 'See exactly where your money is going.',
        items: [
            {
                title: 'Base Cost',
                description: 'The direct cost of your product or service.'
            },
            {
                title: 'Fixed Costs',
                description: 'Fixed shipping, packaging, or handling costs.'
            },
            {
                title: 'Percentage Fees',
                description: 'Fees that scale with your selling price, correctly factored into reverse calculations.'
            },
            {
                title: 'Discounts',
                description: 'See how promotional discounts impact your final profit margin.'
            }
        ]
    },
    howTo: {
        eyebrow: 'Step by Step',
        heading: 'How to Calculate Profit Margin',
        description: 'Follow these steps to find your margin.',
        steps: [
            {
                title: 'Enter your cost',
                description: 'Input the base cost to produce or acquire your item.'
            },
            {
                title: 'Enter your selling price',
                description: 'Input the final price you charge the customer.'
            },
            {
                title: 'Add any fees',
                description: 'Open the Advanced Costs section to add shipping or percentage fees.'
            },
            {
                title: 'Review results',
                description: 'See your profit, margin, markup, and cost breakdown instantly.'
            }
        ]
    },
    goodToKnow: [
        { label: 'Formula', value: 'Profit / Revenue' },
        { label: 'Privacy', value: '100% Client-Side' },
        { label: 'Cost', value: 'Free' }
    ],
    privacy: {
        title: 'Browser-based calculation',
        description: 'This tool calculates everything directly in your browser. No financial data is ever sent to our servers.'
    },
    relatedTools: [
        {
            href: '/all-tools/business/free-invoice-generator',
            title: 'Free Invoice Generator',
            description: 'Create professional invoices instantly.',
            icon: 'fas fa-file-invoice'
        }
    ]
};

const pmcFaqs = [
    {
        question: "What is profit margin?",
        answer: <>Profit margin is a measure of profitability. It is calculated by finding the profit (revenue minus costs) and dividing it by the revenue. It tells you what percentage of your sales is actual profit.</>,
        schemaAnswer: "Profit margin is a measure of profitability. It is calculated by finding the profit (revenue minus costs) and dividing it by the revenue. It tells you what percentage of your sales is actual profit."
    },
    {
        question: "How do I calculate profit margin?",
        answer: <>To calculate profit margin, subtract your total costs from your total revenue to get your profit. Then, divide your profit by your total revenue, and multiply by 100 to get the percentage.</>,
        schemaAnswer: "To calculate profit margin, subtract your total costs from your total revenue to get your profit. Then, divide your profit by your total revenue, and multiply by 100 to get the percentage."
    },
    {
        question: "What is the difference between margin and markup?",
        answer: <>Margin is your profit as a percentage of your selling price (revenue). Markup is your profit as a percentage of your cost. For example, if you buy an item for $50 and sell it for $100, your profit is $50. Your margin is 50% ($50/$100), but your markup is 100% ($50/$50).</>,
        schemaAnswer: "Margin is your profit as a percentage of your selling price (revenue). Markup is your profit as a percentage of your cost. For example, if you buy an item for $50 and sell it for $100, your profit is $50. Your margin is 50% ($50/$100), but your markup is 100% ($50/$50)."
    },
    {
        question: "Can I include shipping and payment fees in my calculation?",
        answer: <>Yes. Our calculator allows you to add fixed costs (like shipping and packaging) and percentage fees (like payment processing or marketplace fees). These are properly factored into both margin and reverse-pricing calculations.</>,
        schemaAnswer: "Yes. Our calculator allows you to add fixed costs (like shipping and packaging) and percentage fees (like payment processing or marketplace fees). These are properly factored into both margin and reverse-pricing calculations."
    },
    {
        question: "Can this calculator tell me what selling price I need for a target margin?",
        answer: <>Yes! Use the "What Should I Charge?" tab. Enter your cost and your desired target margin, and it will calculate the exact selling price required. It even accurately accounts for percentage-based fees that scale with your final price.</>,
        schemaAnswer: "Yes! Use the \"What Should I Charge?\" tab. Enter your cost and your desired target margin, and it will calculate the exact selling price required. It even accurately accounts for percentage-based fees that scale with your final price."
    }
];

export default function ProfitMarginCalculatorPage() {
    const tool = getToolBySlug('free-profit-margin-calculator')!;

    const pmcJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free Profit Margin Calculator",
        "url": "https://tooltive.com/all-tools/business/free-profit-margin-calculator",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Calculate profit margin, markup, profit per sale, and target selling price with this free calculator."
    };

    return (
        <main className="tools-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pmcJsonLd) }}
            />

            <ToolHeroSection
                categoryLabel={pmcContentConfig.categoryLabel}
                heading={pmcContentConfig.intro.heading}
                headingAccent={pmcContentConfig.intro.headingAccent}
                description={pmcContentConfig.intro.description}
                featuredImage={pmcContentConfig.intro.featuredImage}
                featuredImageAlt={pmcContentConfig.intro.featuredImageAlt}
            />

            <ProfitMarginCalculatorNoSSR />

            <ToolContentLayout config={pmcContentConfig} />

            <FaqSection
                faqs={pmcFaqs}
                title={<>Frequently Asked <span className="highlight">Questions.</span></>}
                description="Learn more about calculating profit margins, markup, and pricing strategies."
                label="FAQ"
            />
        </main>
    );
}
