import React from 'react';
import { Vacancy } from '../../types';

interface JobSchemaProps {
  vacancy: Vacancy;
}

const JobSchema: React.FC<JobSchemaProps> = ({ vacancy }) => {
  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.createdAt,
    validThrough: vacancy.updatedAt,
    employmentType: vacancy.type,
    hiringOrganization: {
      '@type': 'Organization',
      name: vacancy.company.name,
      sameAs: vacancy.company.website,
      logo: vacancy.company.logo
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vacancy.location
      }
    },
    ...(vacancy.salary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: vacancy.salary.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: vacancy.salary.min,
          maxValue: vacancy.salary.max,
          unitText: 'YEAR'
        }
      }
    })
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(jobSchema)}
    </script>
  );
};

export default JobSchema;