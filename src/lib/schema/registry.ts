import { SchemaDefinition } from './types';
import { createEmptyResult, validateCommonSchemaProps } from './validators';

export const articleSchema: SchemaDefinition = {
  id: 'article',
  label: 'Article',
  schemaType: 'Article',
  description: 'Use this for editorial or article content.',
  fields: [
    { id: 'headline', label: 'Headline', type: 'text', required: true, description: 'The title of the article.', group: 'Basic Information' },
    { id: 'description', label: 'Description', type: 'textarea', description: 'A short summary of the actual article.', group: 'Basic Information' },
    { id: 'url', label: 'Page URL', type: 'url', group: 'Basic Information' },
    { id: 'image', label: 'Image URL', type: 'url', group: 'Basic Information' },

    { id: 'authorName', label: 'Author Name', type: 'text', required: true, group: 'Author' },
    { id: 'authorUrl', label: 'Author URL', type: 'url', group: 'Author' },

    { id: 'publisherName', label: 'Publisher Name', type: 'text', group: 'Publisher' },
    { id: 'publisherLogo', label: 'Publisher Logo URL', type: 'url', group: 'Publisher' },

    { id: 'datePublished', label: 'Date Published', type: 'datetime-local', required: true, group: 'Publication' },
    { id: 'dateModified', label: 'Date Modified', type: 'datetime-local', group: 'Publication' },

    { id: 'articleSection', label: 'Article Section', type: 'text', description: 'e.g., Technology, Business, News', group: 'Additional Information' },
    { id: 'keywords', label: 'Keywords', type: 'text', description: 'Comma-separated keywords.', group: 'Additional Information' },
    { 
      id: 'language', 
      label: 'Language', 
      type: 'select', 
      group: 'Additional Information',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Urdu', value: 'ur' },
        { label: 'Arabic', value: 'ar' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Spanish', value: 'es' }
      ]
    },

    { id: 'articleBody', label: 'Article Body', type: 'textarea', group: 'Advanced' },
    { id: 'wordCount', label: 'Word Count', type: 'number', group: 'Advanced' },
    { id: 'mainEntityOfPage', label: 'Main Entity Of Page', type: 'url', group: 'Advanced' }
  ],
  build: (data) => {
    const schema: any = {
      ...(data._originalData || {}),
      '@context': 'https://schema.org',
      '@type': 'Article',
    };

    if (data.headline) schema.headline = data.headline;
    if (data.description) schema.description = data.description;
    
    if (data.url) schema.url = data.url;
    if (data.image) schema.image = [data.image];

    if (data.authorName) {
      schema.author = {
        '@type': 'Person',
        name: data.authorName
      };
      if (data.authorUrl) schema.author.url = data.authorUrl;
    }

    if (data.publisherName) {
      schema.publisher = {
        '@type': 'Organization',
        name: data.publisherName
      };
      if (data.publisherLogo) {
        schema.publisher.logo = { '@type': 'ImageObject', url: data.publisherLogo };
      }
    }

    if (data.datePublished) schema.datePublished = new Date(data.datePublished).toISOString();
    if (data.dateModified) schema.dateModified = new Date(data.dateModified).toISOString();

    if (data.articleSection) schema.articleSection = data.articleSection;
    
    if (data.keywords) {
      // Serialize correctly without inventing data, handling commas safely
      const kws = data.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
      if (kws.length > 0) schema.keywords = kws.join(', ');
    }
    
    if (data.language) schema.inLanguage = data.language;

    if (data.articleBody) schema.articleBody = data.articleBody;
    if (data.wordCount) schema.wordCount = Number(data.wordCount);
    
    if (data.mainEntityOfPage) {
      schema.mainEntityOfPage = {
        '@type': 'WebPage',
        '@id': data.mainEntityOfPage
      };
    } else if (data.url) {
      schema.mainEntityOfPage = {
        '@type': 'WebPage',
        '@id': data.url
      };
    }

    return schema;
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    
    if (!data.headline) {
      result.errors.push({ level: 'error', code: 'MISSING_HEADLINE', message: 'Article headline is required for this generator.' });
    }
    if (!data.author) {
      result.errors.push({ level: 'error', code: 'MISSING_AUTHOR', message: 'Author name is required for this generator.' });
    }
    if (!data.datePublished) {
      result.errors.push({ level: 'error', code: 'MISSING_DATE_PUBLISHED', message: 'Date Published is required for this generator.' });
    }
    
    if (!data.image) {
      result.warnings.push({ level: 'suggestion', code: 'MISSING_IMAGE', message: 'Recommended: Image URL is often required for Google Rich Results eligibility.' });
    }
    
    return result;
  }
};

export const faqSchema: SchemaDefinition = {
  id: 'faq',
  label: 'FAQ Page',
  schemaType: 'FAQPage',
  description: 'Only include questions and answers that are genuinely present on the page.',
  fields: [
    {
      id: 'questions',
      label: 'Questions',
      type: 'repeater',
      fields: [
        { id: 'question', label: 'Question', type: 'text', required: true },
        { id: 'answer', label: 'Answer', type: 'textarea', required: true }
      ]
    }
  ],
  build: (data) => {
    const questions = Array.isArray(data.questions) ? data.questions : [];
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.filter((q: any) => q.question && q.answer).map((q: any) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    };
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);

    if (!data.mainEntity || !Array.isArray(data.mainEntity) || data.mainEntity.length === 0) {
      result.errors.push({ level: 'error', code: 'NO_QUESTIONS', message: 'FAQPage must contain at least one Question.' });
    } else {
      data.mainEntity.forEach((q: any, i: number) => {
        if (q['@type'] !== 'Question') {
            result.errors.push({ level: 'error', code: 'INVALID_QUESTION_TYPE', message: `Item at index ${i} is not a Question.` });
        }
        if (!q.name) {
          result.errors.push({ level: 'error', code: 'MISSING_QUESTION_NAME', message: `Question at index ${i} is missing a name (the question text).` });
        }
        if (!q.acceptedAnswer || !q.acceptedAnswer.text) {
          result.errors.push({ level: 'error', code: 'MISSING_ANSWER', message: `Question at index ${i} is missing an acceptedAnswer text.` });
        }
      });
    }

    result.suggestions.push({
      level: 'suggestion',
      code: 'CONTENT_WARNING',
      message: 'Notice: Use this markup only when the FAQ content is actually present and visible on the page.'
    });

    return result;
  }
};

export const productSchema: SchemaDefinition = {
  id: 'product',
  label: 'Product',
  schemaType: 'Product',
  description: 'Use Product markup for an actual product represented on this page.',
  fields: [
    { id: 'name', label: 'Product Name', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea' },
    { id: 'image', label: 'Image URL', type: 'url' },
    { id: 'brand', label: 'Brand', type: 'text' },
    { id: 'sku', label: 'SKU', type: 'text' },
    { id: 'price', label: 'Price', type: 'number' },
    { id: 'priceCurrency', label: 'Price Currency', type: 'text', description: 'e.g., USD, EUR' },
    { 
      id: 'availability', 
      label: 'Availability', 
      type: 'select', 
      options: [
        { label: 'In Stock', value: 'https://schema.org/InStock' },
        { label: 'Out of Stock', value: 'https://schema.org/OutOfStock' },
        { label: 'Pre-order', value: 'https://schema.org/PreOrder' }
      ]
    }
  ],
  build: (data) => {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description || undefined,
      image: data.image ? [data.image] : undefined,
      sku: data.sku || undefined,
    };
    if (data.brand) {
      schema.brand = { '@type': 'Brand', name: data.brand };
    }
    if (data.price || data.priceCurrency || data.availability) {
      schema.offers = {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.priceCurrency || 'USD',
        availability: data.availability || undefined
      };
    }
    return schema;
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) {
      result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'Product name is required.' });
    }
    if (!data.offers) {
      result.warnings.push({ level: 'warning', code: 'MISSING_OFFER', message: 'Product is missing pricing/offer information.' });
    }
    return result;
  }
};

export const localBusinessSchema: SchemaDefinition = {
  id: 'localBusiness',
  label: 'Local Business',
  schemaType: 'LocalBusiness',
  description: 'Use for a physical business or branch of an organization.',
  fields: [
    { id: 'name', label: 'Business Name', type: 'text', required: true },
    { id: 'url', label: 'Website URL', type: 'url' },
    { id: 'image', label: 'Image URL', type: 'url' },
    { id: 'telephone', label: 'Telephone', type: 'text' },
    { id: 'streetAddress', label: 'Street Address', type: 'text' },
    { id: 'addressLocality', label: 'City', type: 'text' },
    { id: 'addressRegion', label: 'State/Region', type: 'text' },
    { id: 'postalCode', label: 'Postal Code', type: 'text' },
    { id: 'addressCountry', label: 'Country', type: 'text' }
  ],
  build: (data) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name,
      url: data.url || undefined,
      image: data.image ? [data.image] : undefined,
      telephone: data.telephone || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.streetAddress || undefined,
        addressLocality: data.addressLocality || undefined,
        addressRegion: data.addressRegion || undefined,
        postalCode: data.postalCode || undefined,
        addressCountry: data.addressCountry || undefined
      }
    };
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'Business name is required.' });
    if (!data.address) result.warnings.push({ level: 'warning', code: 'MISSING_ADDRESS', message: 'Address is highly recommended for Local Business.' });
    return result;
  }
};

export const organizationSchema: SchemaDefinition = {
  id: 'organization',
  label: 'Organization',
  schemaType: 'Organization',
  description: 'Use for a brand, company, school, or NGO.',
  fields: [
    { id: 'name', label: 'Organization Name', type: 'text', required: true },
    { id: 'url', label: 'Website URL', type: 'url' },
    { id: 'logo', label: 'Logo URL', type: 'url' },
    { id: 'sameAs', label: 'Social Profiles (comma separated URLs)', type: 'text' }
  ],
  build: (data) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.name,
      url: data.url || undefined,
      logo: data.logo || undefined,
      sameAs: data.sameAs ? data.sameAs.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined
    };
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'Organization name is required.' });
    if (!data.url && !data.logo) result.warnings.push({ level: 'warning', code: 'MISSING_URL_LOGO', message: 'A URL or logo is recommended for an Organization.' });
    return result;
  }
};

export const breadcrumbSchema: SchemaDefinition = {
  id: 'breadcrumb',
  label: 'Breadcrumb List',
  schemaType: 'BreadcrumbList',
  description: 'Indicates the page\'s position in the site hierarchy.',
  fields: [
    {
      id: 'items',
      label: 'Breadcrumbs',
      type: 'repeater',
      fields: [
        { id: 'name', label: 'Name (e.g. Home)', type: 'text', required: true },
        { id: 'item', label: 'URL', type: 'url', required: true }
      ]
    }
  ],
  build: (data) => {
    const items = Array.isArray(data.items) ? data.items : [];
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((itm: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: itm.name,
        item: itm.item
      }))
    };
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.itemListElement || data.itemListElement.length === 0) {
      result.errors.push({ level: 'error', code: 'NO_ITEMS', message: 'BreadcrumbList must have at least one item.' });
    }
    return result;
  }
};

export const softwareSchema: SchemaDefinition = {
  id: 'software',
  label: 'Software Application',
  schemaType: 'SoftwareApplication',
  description: 'Use for software apps, web apps, or mobile apps.',
  fields: [
    { id: 'name', label: 'App Name', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea' },
    { id: 'applicationCategory', label: 'Category', type: 'select', options: [
      { label: 'BusinessApplication', value: 'BusinessApplication' },
      { label: 'DeveloperApplication', value: 'DeveloperApplication' },
      { label: 'UtilitiesApplication', value: 'UtilitiesApplication' }
    ]},
    { id: 'operatingSystem', label: 'Operating System', type: 'text', description: 'e.g., Windows, macOS, All' },
    { id: 'price', label: 'Price', type: 'number' },
    { id: 'priceCurrency', label: 'Currency', type: 'text' }
  ],
  build: (data) => {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: data.name,
      description: data.description || undefined,
      applicationCategory: data.applicationCategory || undefined,
      operatingSystem: data.operatingSystem || undefined,
    };
    if (data.price !== undefined || data.priceCurrency) {
      schema.offers = {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.priceCurrency || 'USD'
      };
    }
    return schema;
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'Application name is required.' });
    return result;
  }
};

export const eventSchema: SchemaDefinition = {
  id: 'event',
  label: 'Event',
  schemaType: 'Event',
  description: 'Use for real events taking place at a specific time and location.',
  fields: [
    { id: 'name', label: 'Event Name', type: 'text', required: true },
    { id: 'startDate', label: 'Start Date & Time', type: 'datetime-local', required: true },
    { id: 'endDate', label: 'End Date & Time', type: 'datetime-local' },
    { id: 'eventStatus', label: 'Status', type: 'select', options: [
      { label: 'Scheduled', value: 'https://schema.org/EventScheduled' },
      { label: 'Cancelled', value: 'https://schema.org/EventCancelled' },
      { label: 'Postponed', value: 'https://schema.org/EventPostponed' }
    ]},
    { id: 'locationName', label: 'Location Name', type: 'text' },
    { id: 'locationAddress', label: 'Location Address', type: 'text' }
  ],
  build: (data) => {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      eventStatus: data.eventStatus || 'https://schema.org/EventScheduled'
    };
    if (data.locationName || data.locationAddress) {
      schema.location = {
        '@type': 'Place',
        name: data.locationName || undefined,
        address: data.locationAddress ? {
          '@type': 'PostalAddress',
          streetAddress: data.locationAddress
        } : undefined
      };
    }
    return schema;
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'Event name is required.' });
    if (!data.startDate) result.errors.push({ level: 'error', code: 'MISSING_START', message: 'Event startDate is required.' });
    if (!data.location) result.warnings.push({ level: 'warning', code: 'MISSING_LOCATION', message: 'Physical events should have a location.' });
    return result;
  }
};

export const howtoSchema: SchemaDefinition = {
  id: 'howto',
  label: 'How-To',
  schemaType: 'HowTo',
  description: 'Instructions that explain how to achieve a goal.',
  fields: [
    { id: 'name', label: 'Title', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea' },
    {
      id: 'steps',
      label: 'Steps',
      type: 'repeater',
      fields: [
        { id: 'name', label: 'Step Title', type: 'text', required: true },
        { id: 'text', label: 'Step Instructions', type: 'textarea', required: true },
        { id: 'url', label: 'Step URL (optional anchor)', type: 'url' }
      ]
    }
  ],
  build: (data) => {
    const steps = Array.isArray(data.steps) ? data.steps : [];
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: data.name,
      description: data.description || undefined,
      step: steps.map((s: any) => ({
        '@type': 'HowToStep',
        name: s.name,
        text: s.text,
        url: s.url || undefined
      }))
    };
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'HowTo title is required.' });
    if (!data.step || data.step.length === 0) result.errors.push({ level: 'error', code: 'NO_STEPS', message: 'HowTo must contain at least one step.' });
    return result;
  }
};

export const websiteSchema: SchemaDefinition = {
  id: 'website',
  label: 'WebSite',
  schemaType: 'WebSite',
  description: 'General information about the website.',
  fields: [
    { id: 'name', label: 'Website Name', type: 'text', required: true },
    { id: 'url', label: 'Website URL', type: 'url', required: true },
    { id: 'searchUrl', label: 'Search Query URL (e.g. https://example.com/?q={search_term_string})', type: 'text' }
  ],
  build: (data) => {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.name,
      url: data.url
    };
    if (data.searchUrl) {
      schema.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: data.searchUrl
        },
        'query-input': 'required name=search_term_string'
      };
    }
    return schema;
  },
  validate: (data) => {
    const result = createEmptyResult();
    validateCommonSchemaProps(data, result);
    if (!data.name) result.errors.push({ level: 'error', code: 'MISSING_NAME', message: 'WebSite name is required.' });
    if (!data.url) result.errors.push({ level: 'error', code: 'MISSING_URL', message: 'WebSite URL is required.' });
    return result;
  }
};

export const schemaRegistry: SchemaDefinition[] = [
  articleSchema,
  faqSchema,
  productSchema,
  localBusinessSchema,
  organizationSchema,
  breadcrumbSchema,
  softwareSchema,
  eventSchema,
  howtoSchema,
  websiteSchema
];

export function getSchemaDefinition(id: string): SchemaDefinition | undefined {
  return schemaRegistry.find(s => s.id === id);
}
