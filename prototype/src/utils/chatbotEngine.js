import delegates, { getAllDelegations, getDelegationsForDelegate, getStats } from '../data/mockData';

const normalize = (str) => str.toLowerCase().trim().replace(/[?!.]+$/, '');

// Contact role labels
const CONTACT_LABELS = {
  um: 'UM Contact',
  cm: 'CM Contact',
  claims: 'Claims Contact',
  clinical: 'Clinical Contact',
  contracting: 'Contracting Contact',
  technical: 'Technical Contact',
};

// Valid states in our data (derived from delegation-level states)
const VALID_STATES = [...new Set(
  delegates.flatMap((d) => d.products.flatMap((p) => p.delegations.flatMap((del) => del.states || [])))
)].map((s) => s.toLowerCase());

// --- Entity matching ---

function extractEntityFragment(input) {
  const frames = [
    /^(?:who is |what is |what are |show me |tell me about |find |look up |get )/,
    /^(?:the )?(contacts?|contact info|engagement manager|manager|status|delegations?|details?|info|information) (?:for |of |about |on )/,
    /(?:contacts?|contact info|engagement manager|manager|status|delegations?) (?:for |of |about |on )/,
  ];
  let remainder = input;
  for (const frame of frames) {
    remainder = remainder.replace(frame, '');
  }
  // Strip trailing common words
  remainder = remainder
    .replace(/\b(please|thanks|thank you)\b/g, '')
    .replace(/[?!.]+$/, '')
    .trim();
  return remainder;
}

function findDelegates(fragment) {
  if (!fragment || fragment.length < 3) return [];
  const lower = fragment.toLowerCase();
  return delegates.filter(
    (d) =>
      d.contractedEntity.toLowerCase().includes(lower) ||
      lower.includes(d.contractedEntity.toLowerCase().split(' ')[0].toLowerCase())
  );
}

function findDelegateByTIN(input) {
  const tinMatch = input.match(/\b(\d{2}-\d{7})\b/);
  if (!tinMatch) return null;
  return delegates.find((d) => d.tin === tinMatch[1]);
}

// --- Response formatters ---

function formatContacts(delegate) {
  const lines = [];
  for (const [key, label] of Object.entries(CONTACT_LABELS)) {
    const val = delegate.contacts[key];
    if (val) {
      const nameMatch = val.match(/^(.+?)\s*\((.+?)\)$/);
      if (nameMatch) {
        lines.push(`${label}: ${nameMatch[1]} (${nameMatch[2]})`);
      } else {
        lines.push(`${label}: ${val}`);
      }
    }
  }
  if (lines.length === 0) return 'No contacts on file.';
  return lines.join('\n');
}

function formatDelegationStatuses(delegate) {
  const allDels = getDelegationsForDelegate(delegate);
  return allDels
    .map((d) => `  ${d.delegationType} (${d.productName}): ${d.status}`)
    .join('\n');
}

// --- Intent definitions ---

const INTENTS = [
  // Greetings
  {
    id: 'greeting',
    test: (input) => /^(hi|hello|hey|good morning|good afternoon|howdy|greetings)\b/.test(input),
    respond: () =>
      "Hello! I'm the D360 Assistant. I can help you find delegation information quickly.\n\nTry asking:\n  How many delegates do we have?\n  Which delegates have overdue audits?\n  Who is the contact for Pacific Health Partners?\n  How many Clinical-UM delegations are there?",
  },

  // Help
  {
    id: 'help',
    test: (input) => /^(help|what can you do|what do you know|how do i use)/.test(input),
    respond: () =>
      "I can answer questions about your delegation data. Here's what I can help with:\n\n  Counts: \"How many delegates total?\" or \"How many UM delegations?\"\n  Lookups: \"Who is the contact for [entity]?\" or \"What is the status of [entity]?\"\n  Lists: \"Which delegates have overdue audits?\" or \"Who has open CAPs?\"\n  Filters: \"How many delegates in CA?\" or \"How many approved delegations?\"\n  Details: \"Tell me about [entity]\" or \"What delegations does [entity] have?\"",
  },

  // List overdue audits (specific — must come before count)
  {
    id: 'list_overdue',
    test: (input) =>
      (input.includes('which') || input.includes('list') || input.includes('show') || input.includes('who')) &&
      input.includes('overdue'),
    respond: () => {
      const today = new Date().toISOString().split('T')[0];
      const overdue = getAllDelegations().filter(
        (d) => d.nextAuditDue && d.nextAuditDue < today && d.status === 'Approved'
      );
      if (overdue.length === 0) return 'Good news — there are no overdue audits right now.';
      const grouped = {};
      overdue.forEach((d) => {
        if (!grouped[d.contractedEntity]) grouped[d.contractedEntity] = [];
        grouped[d.contractedEntity].push(d);
      });
      const lines = Object.entries(grouped).map(
        ([entity, dels]) =>
          `  ${entity}: ${dels.map((d) => `${d.delegationType} (due ${d.nextAuditDue})`).join(', ')}`
      );
      return `There are ${overdue.length} overdue audit(s) across ${Object.keys(grouped).length} delegate(s):\n\n${lines.join('\n')}`;
    },
  },

  // List open CAPs (specific — must come before count)
  {
    id: 'list_caps',
    test: (input) =>
      (input.includes('which') || input.includes('list') || input.includes('show') || input.includes('who')) &&
      (input.includes('cap') || input.includes('corrective action')),
    respond: () => {
      const caps = getAllDelegations().filter((d) => d.correctiveActionPlan && d.status === 'Approved');
      if (caps.length === 0) return 'There are no open Corrective Action Plans.';
      const grouped = {};
      caps.forEach((d) => {
        if (!grouped[d.contractedEntity]) grouped[d.contractedEntity] = [];
        grouped[d.contractedEntity].push(d);
      });
      const lines = Object.entries(grouped).map(
        ([entity, dels]) =>
          `  ${entity}: ${dels.map((d) => `${d.delegationType} (${d.productName})`).join(', ')}`
      );
      return `There are ${caps.length} open CAP(s) across ${Object.keys(grouped).length} delegate(s):\n\n${lines.join('\n')}`;
    },
  },

  // List delegates by engagement manager
  {
    id: 'list_by_manager',
    test: (input) =>
      (input.includes('which') || input.includes('list') || input.includes('who')) &&
      input.includes('manage') &&
      !input.includes('for '),
    respond: (input) => {
      const managers = [...new Set(delegates.map((d) => d.engagementManager))];
      const matchedManager = managers.find((m) => input.includes(m.toLowerCase()));
      if (matchedManager) {
        const managed = delegates.filter((d) => d.engagementManager === matchedManager);
        const lines = managed.map((d) => `  ${d.contractedEntity} (${d.state})`);
        return `${matchedManager} manages ${managed.length} delegate(s):\n\n${lines.join('\n')}`;
      }
      // If no specific manager named, show all managers
      const summary = managers
        .map((m) => {
          const count = delegates.filter((d) => d.engagementManager === m).length;
          return `  ${m}: ${count} delegate(s)`;
        })
        .join('\n');
      return `Engagement managers and their delegate counts:\n\n${summary}`;
    },
  },

  // Count by delegation type — UM
  {
    id: 'count_um',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('total') || input.includes('number of')) &&
      (input.includes(' um ') || input.includes(' um?') || input.includes('clinical-um') || input.includes('utilization management') ||
       (input.includes('um') && input.includes('delegation'))),
    respond: () => {
      const all = getAllDelegations();
      const um = all.filter((d) => d.delegationType === 'Clinical-UM');
      const approved = um.filter((d) => d.status === 'Approved').length;
      return `There are ${um.length} Clinical-UM delegations total (${approved} approved).`;
    },
  },

  // Count by delegation type — PHM
  {
    id: 'count_phm',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('total') || input.includes('number of')) &&
      (input.includes(' phm ') || input.includes(' phm?') || input.includes('clinical-phm') || input.includes('population health') ||
       (input.includes('phm') && input.includes('delegation'))),
    respond: () => {
      const all = getAllDelegations();
      const phm = all.filter((d) => d.delegationType === 'Clinical-PHM');
      const approved = phm.filter((d) => d.status === 'Approved').length;
      return `There are ${phm.length} Clinical-PHM delegations total (${approved} approved).`;
    },
  },

  // Count by delegation type — Claims
  {
    id: 'count_claims',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('total') || input.includes('number of')) &&
      input.includes('claims') && input.includes('delegation'),
    respond: () => {
      const all = getAllDelegations();
      const claims = all.filter((d) => d.delegationType === 'Claims');
      const approved = claims.filter((d) => d.status === 'Approved').length;
      return `There are ${claims.length} Claims delegations total (${approved} approved).`;
    },
  },

  // Count by status
  {
    id: 'count_by_status',
    test: (input) => {
      const statuses = ['approved', 'terminated', 'under review', 'pend entity', 'draft'];
      return (
        (input.includes('how many') || input.includes('count') || input.includes('total') || input.includes('number of')) &&
        statuses.some((s) => input.includes(s))
      );
    },
    respond: (input) => {
      const statusMap = {
        approved: 'Approved',
        terminated: 'Terminated',
        'under review': 'Under Review',
        'pend entity': 'Pend Entity',
        draft: 'Draft',
      };
      const all = getAllDelegations();
      for (const [key, value] of Object.entries(statusMap)) {
        if (input.includes(key)) {
          const count = all.filter((d) => d.status === value).length;
          return `There are ${count} delegation(s) with status "${value}".`;
        }
      }
      return 'I couldn\'t determine which status you\'re asking about.';
    },
  },

  // Count by product
  {
    id: 'count_by_product',
    test: (input) => {
      const products = ['medicare', 'medicaid', 'commercial', 'ifp', 'dsnp', 'mmp', 'fide'];
      return (
        (input.includes('how many') || input.includes('count') || input.includes('number of')) &&
        products.some((p) => input.includes(p))
      );
    },
    respond: (input) => {
      const productMap = {
        medicare: 'Medicare', medicaid: 'Medicaid', commercial: 'Commercial',
        'i-snp': 'I-SNP', 'd-snp': 'D-SNP', 'c-snp': 'C-SNP',
      };
      const all = getAllDelegations();
      for (const [key, value] of Object.entries(productMap)) {
        if (input.includes(key)) {
          const matching = all.filter((d) => d.productName.startsWith(value));
          const approved = matching.filter((d) => d.status === 'Approved').length;
          return `There are ${matching.length} delegation(s) under ${value} products (${approved} approved).`;
        }
      }
      return 'I couldn\'t determine which product you\'re asking about.';
    },
  },

  // Count by state
  {
    id: 'count_by_state',
    test: (input) => {
      return (
        (input.includes('how many') || input.includes('count') || input.includes('number of')) &&
        (input.includes(' in ') || input.includes(' from ')) &&
        VALID_STATES.some((s) => input.includes(` ${s} `) || input.endsWith(` ${s}`))
      );
    },
    respond: (input) => {
      for (const state of VALID_STATES) {
        if (input.includes(` ${state} `) || input.endsWith(` ${state}`)) {
          const stateUpper = state.toUpperCase();
          const matching = delegates.filter((d) =>
            d.products.some((p) => p.delegations.some((del) => del.states?.includes(stateUpper)))
          );
          if (matching.length === 0) return `There are no delegates in ${stateUpper}.`;
          return `There are ${matching.length} delegate(s) in ${stateUpper}:\n\n${matching.map((d) => `  ${d.contractedEntity}`).join('\n')}`;
        }
      }
      return 'I couldn\'t determine which state you\'re asking about.';
    },
  },

  // Count delegates by entity type
  {
    id: 'count_entity_type',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('number of')) &&
      (input.includes('vendor') || input.includes('provider')),
    respond: (input) => {
      if (input.includes('vendor')) {
        const count = delegates.filter((d) => d.entityType === 'Vendor').length;
        return `There are ${count} Vendor delegate(s).`;
      }
      const count = delegates.filter((d) => d.entityType === 'Provider').length;
      return `There are ${count} Provider delegate(s).`;
    },
  },

  // Count overdue audits
  {
    id: 'count_overdue',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('number of')) &&
      input.includes('overdue'),
    respond: () => {
      const stats = getStats();
      return `There are ${stats.overdueAudits} overdue audit(s).`;
    },
  },

  // Count open CAPs
  {
    id: 'count_caps',
    test: (input) =>
      (input.includes('how many') || input.includes('count') || input.includes('number of')) &&
      (input.includes('cap') || input.includes('corrective action')),
    respond: () => {
      const stats = getStats();
      return `There are ${stats.openCAPs} open Corrective Action Plan(s).`;
    },
  },

  // Total delegates
  {
    id: 'total_delegates',
    test: (input) =>
      (input.includes('how many') || input.includes('total') || input.includes('count') || input.includes('number of')) &&
      input.includes('delegate') &&
      !input.includes('delegation'),
    respond: () => {
      const stats = getStats();
      return `There are ${stats.totalDelegates} delegated entities in the system, with ${stats.activeDelegations} active delegations.`;
    },
  },

  // Total delegations
  {
    id: 'total_delegations',
    test: (input) =>
      (input.includes('how many') || input.includes('total') || input.includes('count') || input.includes('number of')) &&
      input.includes('delegation'),
    respond: () => {
      const all = getAllDelegations();
      const byType = {};
      all.forEach((d) => {
        byType[d.delegationType] = (byType[d.delegationType] || 0) + 1;
      });
      const breakdown = Object.entries(byType)
        .map(([type, count]) => `  ${type}: ${count}`)
        .join('\n');
      return `There are ${all.length} delegations total:\n\n${breakdown}`;
    },
  },

  // Upcoming audits
  {
    id: 'upcoming_audits',
    test: (input) =>
      (input.includes('upcoming') || input.includes('coming up') || input.includes('due soon') || input.includes('next')) &&
      input.includes('audit'),
    respond: () => {
      const today = new Date().toISOString().split('T')[0];
      const ninetyDays = new Date();
      ninetyDays.setDate(ninetyDays.getDate() + 90);
      const cutoff = ninetyDays.toISOString().split('T')[0];
      const upcoming = getAllDelegations()
        .filter((d) => d.nextAuditDue && d.nextAuditDue >= today && d.nextAuditDue <= cutoff && d.status === 'Approved')
        .sort((a, b) => a.nextAuditDue.localeCompare(b.nextAuditDue));
      if (upcoming.length === 0) return 'No audits are due in the next 90 days.';
      const lines = upcoming.map(
        (d) => `  ${d.contractedEntity} — ${d.delegationType} (${d.productName}) — due ${d.nextAuditDue}`
      );
      return `There are ${upcoming.length} audit(s) due in the next 90 days:\n\n${lines.join('\n')}`;
    },
  },

  // List delegates by product
  {
    id: 'list_by_product',
    test: (input) => {
      const products = ['medicare', 'medicaid', 'commercial', 'ifp', 'dsnp', 'mmp', 'fide'];
      return (
        (input.includes('which') || input.includes('list') || input.includes('show')) &&
        input.includes('delegate') &&
        products.some((p) => input.includes(p))
      );
    },
    respond: (input) => {
      const productMap = {
        medicare: 'Medicare', medicaid: 'Medicaid', commercial: 'Commercial',
        'i-snp': 'I-SNP', 'd-snp': 'D-SNP', 'c-snp': 'C-SNP',
      };
      for (const [key, value] of Object.entries(productMap)) {
        if (input.includes(key)) {
          const matching = delegates.filter((d) =>
            d.products.some((p) => p.name.startsWith(value))
          );
          if (matching.length === 0) return `No delegates have ${value} products.`;
          const lines = matching.map((d) => `  ${d.contractedEntity} (${d.state})`);
          return `${matching.length} delegate(s) have ${value} products:\n\n${lines.join('\n')}`;
        }
      }
      return 'I couldn\'t determine which product you\'re asking about.';
    },
  },

  // Contact lookup
  {
    id: 'contact_lookup',
    test: (input) => input.includes('contact'),
    respond: (input) => {
      // Try TIN first
      const tinDelegate = findDelegateByTIN(input);
      if (tinDelegate) {
        return `Contacts for ${tinDelegate.contractedEntity}:\n\n${formatContacts(tinDelegate)}`;
      }
      const fragment = extractEntityFragment(input);
      const matches = findDelegates(fragment);
      if (matches.length === 0) {
        return `I couldn't find a delegate matching "${fragment}". Try using the full entity name as it appears in the system.`;
      }
      if (matches.length > 1) {
        const names = matches.map((d) => `  ${d.contractedEntity}`).join('\n');
        return `I found multiple matches:\n\n${names}\n\nPlease be more specific.`;
      }
      return `Contacts for ${matches[0].contractedEntity}:\n\n${formatContacts(matches[0])}`;
    },
  },

  // Engagement manager lookup
  {
    id: 'manager_lookup',
    test: (input) => input.includes('manager') || input.includes('engagement'),
    respond: (input) => {
      const fragment = extractEntityFragment(input);
      const matches = findDelegates(fragment);
      if (matches.length === 0) {
        return `I couldn't find a delegate matching "${fragment}". Try using the full entity name.`;
      }
      if (matches.length > 1) {
        const names = matches.map((d) => `  ${d.contractedEntity} — ${d.engagementManager}`).join('\n');
        return `I found multiple matches:\n\n${names}`;
      }
      return `The engagement manager for ${matches[0].contractedEntity} is ${matches[0].engagementManager}.`;
    },
  },

  // Status lookup
  {
    id: 'status_lookup',
    test: (input) => input.includes('status'),
    respond: (input) => {
      const fragment = extractEntityFragment(input);
      const matches = findDelegates(fragment);
      if (matches.length === 0) {
        return `I couldn't find a delegate matching "${fragment}". Try using the full entity name.`;
      }
      if (matches.length > 1) {
        const names = matches.map((d) => `  ${d.contractedEntity}`).join('\n');
        return `I found multiple matches:\n\n${names}\n\nPlease be more specific.`;
      }
      const d = matches[0];
      return `Delegation statuses for ${d.contractedEntity}:\n\n${formatDelegationStatuses(d)}`;
    },
  },

  // Tell me about / entity detail
  {
    id: 'entity_detail',
    test: (input) =>
      input.includes('tell me about') ||
      input.includes('details for') ||
      input.includes('info on') ||
      input.includes('information about') ||
      input.includes('look up') ||
      input.includes('find '),
    respond: (input) => {
      const fragment = extractEntityFragment(input);
      const matches = findDelegates(fragment);
      if (matches.length === 0) {
        return `I couldn't find a delegate matching "${fragment}". Try using the full entity name.`;
      }
      if (matches.length > 1) {
        const names = matches.map((d) => `  ${d.contractedEntity}`).join('\n');
        return `I found multiple matches:\n\n${names}\n\nPlease be more specific.`;
      }
      const d = matches[0];
      const allDels = getDelegationsForDelegate(d);
      const activeDels = allDels.filter((del) => del.status === 'Approved').length;
      const types = [...new Set(allDels.map((del) => del.delegationType))].join(', ');
      const products = d.products.map((p) => p.name).join(', ');
      const hasCap = allDels.some((del) => del.correctiveActionPlan);

      return `${d.contractedEntity}\n\n` +
        `  Type: ${d.entityType}\n` +
        `  TIN: ${d.tin}\n` +
        `  State: ${d.state}\n` +
        `  Tracking ID: ${d.trackingId}\n` +
        `  Engagement Manager: ${d.engagementManager}\n` +
        `  Products: ${products}\n` +
        `  Delegations: ${allDels.length} (${activeDels} approved)\n` +
        `  Delegation Types: ${types}\n` +
        `  Open CAP: ${hasCap ? 'Yes' : 'No'}`;
    },
  },

  // Summary / overview
  {
    id: 'summary',
    test: (input) =>
      input.includes('summary') || input.includes('overview') || input.includes('dashboard') || input.includes('snapshot'),
    respond: () => {
      const stats = getStats();
      const all = getAllDelegations();
      const byType = {};
      all.forEach((d) => {
        byType[d.delegationType] = (byType[d.delegationType] || 0) + 1;
      });
      const typeBreakdown = Object.entries(byType)
        .map(([type, count]) => `  ${type}: ${count}`)
        .join('\n');
      return `D360 Overview:\n\n` +
        `  Total Delegated Entities: ${stats.totalDelegates}\n` +
        `  Total Delegations: ${all.length}\n` +
        `  Active Delegations: ${stats.activeDelegations}\n` +
        `  Overdue Audits: ${stats.overdueAudits}\n` +
        `  Open CAPs: ${stats.openCAPs}\n\n` +
        `By Delegation Type:\n${typeBreakdown}`;
    },
  },

  // Fallback
  {
    id: 'fallback',
    test: () => true,
    respond: () =>
      "I'm not sure I understood that. Here are some questions I can answer:\n\n" +
      '  "How many delegates do we have?"\n' +
      '  "Who is the contact for Pacific Health Partners?"\n' +
      '  "Which delegates have overdue audits?"\n' +
      '  "How many Clinical-UM delegations are there?"\n' +
      '  "What is the status of Midwest Care Alliance?"\n' +
      '  "How many delegates are in CA?"\n' +
      '  "Which delegates does Sarah Mitchell manage?"\n' +
      '  "Give me an overview"',
  },
];

export default function processQuery(rawInput) {
  const input = normalize(rawInput);
  for (const intent of INTENTS) {
    if (intent.test(input)) {
      return intent.respond(input);
    }
  }
  // Should never reach here due to fallback, but just in case
  return INTENTS[INTENTS.length - 1].respond(input);
}
