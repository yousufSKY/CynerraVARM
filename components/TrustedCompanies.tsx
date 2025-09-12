import React from 'react';
import './TrustedCompanies.css';

const TrustedCompanies: React.FC = () => {
  const companiesRow1 = ['Microsoft', 'IBM', 'Oracle', 'Google', 'Cisco'];
  const companiesRow2 = ['Amazon', 'Adobe', 'Intel', 'Salesforce', 'SAP'];

  return (
    <div className="trusted-companies" aria-label="Trusted by leading Engineers at companies worldwide">
      <h2 className="trusted-heading">Trusted by leading Engineers at companies worldwide</h2>
      <div className="companies-grid">
        {companiesRow1.map((company, index) => (
          <div key={`row1-${index}`} className="company-name">
            {company}
          </div>
        ))}
        {companiesRow2.map((company, index) => (
          <div key={`row2-${index}`} className="company-name">
            {company}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;