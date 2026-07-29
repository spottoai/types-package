import {
  WORK_ITEM_EXTERNAL_TICKET_PROVIDERS,
  WORK_ITEM_SHARE_CHANNELS,
  type IntegrationTicketRecord,
  type ShareWorkItemRequest,
  type WorkItemShareQueueMessage,
} from '../index.vite';

const jiraShareRequest: ShareWorkItemRequest = {
  shareType: 'jira',
  message: 'Please review',
};

const emailShareRequest: ShareWorkItemRequest = {
  shareType: 'email',
  recipients: ['owner@example.com'],
};

const workItemShareMessage: WorkItemShareQueueMessage = {
  ...jiraShareRequest,
  action: 'share',
  entity: 'work-item',
  companyId: 'company-1',
  boardId: 'kanban',
  workItem: {
    workItemId: 'wi-1',
    sourceType: 'health-event',
    sourceId: 'health-1',
    title: 'Service health event',
    subscriptionIds: ['sub-1'],
    subscriptionNames: ['Production'],
    subscriptionCount: 1,
    resourceIds: ['/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1'],
    resourceCount: 1,
    details: [{ label: 'Severity', value: 'Critical' }],
    sourcePath: '/company/company-1/health',
  },
  requestId: 'request-1',
  shareRequestId: 'share-request-1',
  eventId: 'event-1',
};

const workItemTicket: IntegrationTicketRecord = {
  companyId: 'company-1',
  rowKey: 'row-1',
  createdAt: new Date(0).toISOString(),
  createdMs: 0,
  provider: 'jira',
  ticketId: 'SPOT-1',
  referenceType: 'work-item',
  referenceId: workItemShareMessage.workItem.workItemId,
};

const invalidWorkItemShareRequest: ShareWorkItemRequest = {
  // @ts-expect-error WorkItem shares only support the canonical channel vocabulary.
  shareType: 'teams',
};

const invalidTicketReference: IntegrationTicketRecord = {
  ...workItemTicket,
  // @ts-expect-error Ticket references are restricted to supported Spotto entities.
  referenceType: 'resource',
};

void WORK_ITEM_EXTERNAL_TICKET_PROVIDERS;
void WORK_ITEM_SHARE_CHANNELS;
void emailShareRequest;
void workItemShareMessage;
void workItemTicket;
void invalidWorkItemShareRequest;
void invalidTicketReference;
