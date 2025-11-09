const transition = {
  agentPage: {
    reviewingStatus: 'Under Review',
    myAgents: 'My Agents',
    allTypes: 'All Types',
    instructionType: 'Command Type',
    workflowType: 'Workflow',
    sortByCreateTime: 'Sort by Creation Time',
    sortByUpdateTime: 'Sort by Update Time',
    allStatus: 'All Status',
    published: 'Released',
    unpublished: 'Unreleased',
    publishing: 'In Release',
    rejected: 'Withdrawn',
    createNewAgent: 'Create New Agent',
    searchableInMarketplace:
      'Users can search and use this agent in the agent marketplace',
    personalUseOnly: 'You can use this agent yourself or share it with friends',
    underReview:
      'This agent has been released. Under review, you can use it yourself or share it with friends',
    needsModification:
      'This agent has been withdrawn. You need to modify it before you can release it again. Reason for withdrawal: ',

    goToEdit: 'Edit',
    notSupported: 'This agent does not support chat',
    chat: 'Chat',
    share: 'Share',
    copy: 'Copy',
    export: 'Export',
    delete: 'Delete',
    copySuccess: 'Copy successful!',
  },
  deleteBot: {
    confirmDelete: 'Confirm deletion of agent?',
    publishedWarning:
      'This agent has been published. After deletion, users will not be able to use it. Confirm to take it offline and delete?',
    deletionNotice1:
      'Note: Deletion cannot be undone. Users will no longer be able to access this agent. All agent information will be permanently deleted.',
    deletionNotice2:
      'Note: Deletion cannot be undone. Users will no longer be able to access this Bot. All Bot information will be permanently deleted, including but not limited to prompt configurations and logs.',
    deleteButton: 'Delete',
    cancelButton: 'Cancel',
    deleteSuccess: 'Delete successful!',
  },
  agentSumModal: {
    learnMore: 'Learn More',
  },
};

export default transition;
