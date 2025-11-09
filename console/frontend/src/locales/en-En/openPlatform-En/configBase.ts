const translation = {
  prompt: `# Role
You are an experienced and creative Xiaohongshu copywriter with millions of fans across the network. You excel in creating unique and innovative copy.
# Task
Based on the given note topic, write a creative Xiaohongshu-style product recommendation copy. Add appropriate emoji expressions.
# Response Requirements
1. Please output in the format of title, body, and trending keywords.
2. Create the title using the "diode title method" to ensure it is appealing to the target audience.
3. Add appropriate emoji expressions.
4. Add trending keywords at the end: Create 5 - 6 trending keywords closely related to the topic for SEO purposes, presented in the format of #TrendingKeyword1 #TrendingKeyword2...
`,
  //header
  agentName: 'Agent Name',
  botStatus2: 'Released',
  botStatus3: 'Rejected',
  botStatus4: 'In Release',
  botStatus0: 'Unreleased',
  createAgent: 'Create',
  createAgentFirst: 'Click Create Agent first, then analyze',
  analyze: 'Analyze',

  // left
  defaultAvatar: 'Current avatar is default, please upload avatar',
  uploadAvatar: 'Upload Avatar',
  requiredInfoNotFilled: 'Required information not filled',
  saveSuccess: 'Save Success',
  saveFailed: 'Save Failed',
  create: 'Create',
  save: 'Save',
  notSelectPrompt: 'Not selected prompt',
  completeComparison: 'Complete comparison',
  updatePublishSuccess: 'Update publish success',
  publishSuccess: 'Publish success',
  updatePublish: 'Update publish',
  publish: 'Publish',
  agentCategory: 'Agent Category',
  agentIntroduction: 'Agent Introduction',
  restoreDefaultDisplay: 'Restore Default Display',

  commonConfig: 'Common Config',
  promptEdit: 'Prompt Edit',
  promptComparison: 'Prompt Comparison',
  AIoptimization: 'AI Optimization',
  modelSelection: 'Model Selection',
  modelComparison: 'Model Comparison',
  sparkModel: 'Spark V4.0 Ultra',
  sparkX1Model: 'Spark X1',
  pleaseSelectModel: 'Please select model',
  highOrderConfig: 'High Order Config',

  defaultPrompt: 'Default Prompt',

  //头像上传
  clickUpload: 'Click Upload',
  reUpload: 'Re-upload',
  onlyUploadImage: 'Only upload image',
  fileSizeCannotExceed5MB: 'File size cannot exceed 5MB',
  //AI生成
  aiGenerate: 'AI Generate',
  aiGenerateDesc:
    'Please fill in the agent name and function description to generate',
  modelComparisonDesc: 'You can compare up to four models',

  debugPreview: 'Debug Preview',
  addModel: 'Add Model',
  model: 'Model',
  clearHistory: 'Clear History',
  inputContent: 'Input Content',
  pleaseEnterContent: 'Please enter content',
  send: 'Send',
  comparePrompt: 'Compare Prompt',
  selected: 'Selected',
  select: 'Select',

  //能力开发
  CapabilityDevelopment: {
    requireCreativeNovelty: 'Require creative novelty',
    pleaseWriteACreativeCommercialCopywriting:
      'Please write a creative commercial copywriting',
    youAreAComprehensiveCopywriter: 'You are a comprehensive copywriter',
    selectPronouncer: 'Select Pronouncer',
    pleaseFillInAgentNameFunctionDescriptionAndAgentInstruction:
      'Please fill in the agent name, function description, and agent instruction',
    generateFailedPleaseTryAgainLater:
      'Generate failed, please try again later!',
    capability: 'Capability',
    internetSearch: 'Internet Search',
    AIDraw: 'AI Draw',
    codeGeneration: 'Code Generation',
    officialPlugins: 'Official Plugins',
    personalPlugins: 'Personal Plugins',
    knowledgeBase: 'Knowledge Base',
    addKnowledgeBase: 'Add Knowledge Base',
    selectToAssociateTheDataset: 'Select to associate the dataset',
    refresh: 'Refresh',
    personalVersion: 'Personal Version',
    stardust: 'Stardust',
    spark: 'Spark',
    character: 'Character',
    youHaveNotCreatedAnyDatasets: 'You have not created any datasets',
    createNewDataset: 'Create New Dataset',
    cancel: 'Cancel',
    confirm: 'Confirm',
    goCreate: 'Go Create',
    addDataset: 'Add Dataset',
    characterCount: 'Character Count',
    conversationEnhancement: 'Conversation Enhancement',
    openingStatement: 'Opening Statement',
    pleaseFillInIntroductionAndName: 'Please fill in introduction and name',
    aiGenerated: 'AI Generated',
    generating: 'Generating',
    pleaseEnterOpeningStatement: 'Please enter opening statement',
    inputExample: 'Input Example',
    femaleBabyWithSurnameZhang: 'Female baby with surname Zhang',
    nameWithSurnameSong: 'Name with surname Song',
    liNameWithSurname: 'Li name with surname',
    roleSound: 'Role Sound',
    supportMultiRoundConversation: 'Support Multi Round Conversation',
    iHaveAgreed: 'I have agreed',
    xunfeiOpenPlatformServiceAgreement:
      'Xunfei Open Platform Service Agreement',
    privacyAgreement: 'Privacy Agreement',
  },
  promptTry: {
    promptTry: 'Please complete the verification',
    pluginNeedUserAuthorizationInfo:
      'Plugin needs user authorization information',
    answerPleaseTryAgainLater: 'Answer in progress, please try again later',
    pleaseEnterQuestion: 'Please enter the question',
    end: 'End',
    networkError:
      'Network seems to have a problem, you can refresh the page to try again.',
    youHaveNotUploadedDescriptionFileOrInterfaceDocument:
      'You have not uploaded the description file or interface document',
    youUploadedInterfaceDocumentButItHasNotBeenVerified:
      'You uploaded the interface document but it has not been verified',
    pleaseUploadDescriptionFileAndInterfaceDocumentAndVerify:
      'Please upload the description file and interface document and verify',
    pleaseUploadInterfaceDocumentAndVerify:
      'Please upload the interface document and verify',
    stopOutput: 'Stop',
    answerInProgress: 'Answer in progress...',
    hereIsTheAgentName: 'Here is the agent name',
    hereIsTheAgentIntroduction: 'Here is the agent introduction',
    clearHistory: 'Clear History',
    send: 'Send',
  },
  promptTip: {
    pleaseCompleteVerification: 'Please complete the verification',
    pluginNeedsUserAuthorization: 'Plugin needs user authorization information',
    answerPleaseTryAgainLater: 'Answer in progress, please try again later',
    pleaseEnterQuestion: 'Please enter the question',
    end: 'End',
    networkError:
      'Network seems to have a problem, you can refresh the page to try again.',
    uploadDescriptionAndApiDocument:
      'You have not uploaded the description file and interface document',
    uploadApiDocumentAndVerify:
      'You uploaded the interface document but it has not been verified',
    uploadDescriptionAndApiDocumentAndVerify:
      'Please upload the description file and interface document and verify',
    uploadApiDocumentAndVerifyAndDebugPreview:
      'Please upload the interface document and verify',
    stopOutput: 'Stop',
    answerInProgress: 'Answer in progress...',
    hereIsTheAgentName: 'Here is the agent name',
    hereIsTheAgentIntroduction: 'Here is the agent introduction',
    clearHistory: 'Clear History',
    send: 'Send',
  },
  promptModel: {
    pleaseCompleteVerification: 'Please complete the verification',
    pluginNeedsUserAuthorization: 'Plugin needs user authorization information',
    answerPleaseTryAgainLater: 'Answer in progress, please try again later',
    pleaseEnterQuestion: 'Please enter the question',
    end: 'End',
    networkError:
      'Network seems to have a problem, you can refresh the page to try again.',
    uploadDescriptionAndApiDocument:
      'You have not uploaded the description file and interface document',
    uploadApiDocumentAndVerify:
      'You uploaded the interface document but it has not been verified',
    uploadDescriptionAndApiDocumentAndVerify:
      'Please upload the description file and interface document and verify',
    uploadApiDocumentAndVerifyAndDebugPreview:
      'Please upload the interface document and verify',
    stopOutput: 'Stop',
    answerInProgress: 'Answer in progress...',
    hereIsTheAgentName: 'Here is the agent name',
    hereIsTheAgentIntroduction: 'Here is the agent introduction',
    clearHistory: 'Clear History',
    send: 'Send',
  },
};

export default translation;
