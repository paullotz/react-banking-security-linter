import { navigationSecurityRule } from './rules/navigation-security';
import { dataComplianceRule } from './rules/data-compliance';

module.exports = {
  rules: {
    'navigation-security': navigationSecurityRule,
    'data-compliance': dataComplianceRule
  }
};
