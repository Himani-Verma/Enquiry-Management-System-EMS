/**
 * Format status for display
 * Converts database status values to user-friendly display text
 */
export function formatStatus(status: string | undefined | null): string {
  if (!status) return 'N/A';
  
  // Special case mappings
  const statusMap: Record<string, string> = {
    'enquiry_required': 'Enquiry Received',
    'enquiry_received': 'Enquiry Received',
    'contact_initiated': 'Contact Initiated',
    'feasibility_check': 'Feasibility Check',
    'quotation_sent': 'Quotation Sent',
    'negotiation': 'Negotiation',
    'converted': 'Converted',
    'lost': 'Lost',
    'on_hold': 'On Hold',
    'in_progress': 'In Progress',
    'escalated': 'Escalated',
  };
  
  // Return mapped value or format by replacing underscores and capitalizing
  return statusMap[status.toLowerCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get status color classes for badges
 */
export function getStatusColorClass(status: string | undefined | null): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'converted':
      return 'bg-green-100 text-green-800';
    case 'enquiry_required':
    case 'enquiry_received':
      return 'bg-blue-100 text-blue-800';
    case 'contact_initiated':
      return 'bg-yellow-100 text-yellow-800';
    case 'feasibility_check':
      return 'bg-purple-100 text-purple-800';
    case 'quotation_sent':
      return 'bg-indigo-100 text-indigo-800';
    case 'negotiation':
      return 'bg-orange-100 text-orange-800';
    case 'lost':
      return 'bg-red-100 text-red-800';
    case 'on_hold':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-cyan-100 text-cyan-800';
    case 'escalated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
