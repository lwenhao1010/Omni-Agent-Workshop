const transition = {
  agentPage: {
    reviewingStatus: '审核中',
    myAgents: '我的智能体',
    allTypes: '全部类型',
    instructionType: '指令型',
    workflowType: '工作流',
    sortByCreateTime: '创建时间排序',
    sortByUpdateTime: '更新时间排序',
    allStatus: '全部状态',
    published: '已发布',
    unpublished: '未发布',
    publishing: '发布中',
    rejected: '已下架',
    createNewAgent: '新建智能体',
    searchableInMarketplace: '用户可在智能体广场搜索并使用该智能体',
    personalUseOnly: '您可以自己使用该智能体，或分享给好友',
    underReview: '该智能体已发布，人工复查中，当前您可以自己使用，或分享给好友',
    needsModification: '该智能体被人工下架，需修改后才可重新发布，下架原因：',
    goToEdit: '去编辑',
    notSupported: '当前智能体不支持对话',
    chat: '对话',
    share: '分享',
    copy: '复制',
    export: '导出',
    delete: '删除',
    copySuccess: '复制成功！',
  },
  deleteBot: {
    confirmDelete: '确认删除智能体？',
    publishedWarning:
      '该智能体已发布，删除后用户将无法使用该智能体,确认将该智能体下线并删除吗？',
    deletionNotice1:
      '说明：智能体删除后无法撤销。用户将无法继续访问该智能体。智能体信息将一并删除且无法修复。',
    deletionNotice2:
      '说明：智能体删除后无法撤销。用户将无法继续访问该Bot。Bot信息将一并删除且无法修复，包括但不限于prompt编排配置和日志。',
    deleteButton: '删除',
    cancelButton: '取消',
    deleteSuccess: '删除成功！',
  },
  agentSumModal: {
    learnMore: '了解详情',
  },
};

export default transition;
