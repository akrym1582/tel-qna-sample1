/* eslint-disable */
export type ApiResponseDto = {
  success: boolean;
}

export type ApiResponseDtoOfCallCenterBootstrapDto = {
  success: boolean;

  data?: null | CallCenterBootstrapDto | undefined;
}

export type ApiResponseDtoOfCallRecordDto = {
  success: boolean;

  data?: null | CallRecordDto | undefined;
}

export type ApiResponseDtoOfCreatedUserResultDto = {
  success: boolean;

  data?: null | CreatedUserResultDto | undefined;
}

export type ApiResponseDtoOfFaqItemDto = {
  success: boolean;

  data?: null | FaqItemDto | undefined;
}

export type ApiResponseDtoOfIReadOnlyListOfTestLoginUserDto = {
  success: boolean;
}

export type ApiResponseDtoOfPasswordResetResultDto = {
  success: boolean;

  data?: null | PasswordResetResultDto | undefined;
}

export type ApiResponseDtoOfSystemSettingsDto = {
  success: boolean;

  data?: null | SystemSettingsDto | undefined;
}

export type ApiResponseDtoOfTransferDestinationDto = {
  success: boolean;

  data?: null | TransferDestinationDto | undefined;
}

export type ApiResponseDtoOfUserDto = {
  success: boolean;

  data?: null | UserDto | undefined;
}

export type ApiResponseDtoOfUserListResponseDto = {
  success: boolean;

  data?: null | UserListResponseDto | undefined;
}

export type AppendTranscriptLineRequestDto = {
  speaker: string;
  text: string;
}

export type CallCenterBootstrapDto = {
  currentOperator: CurrentOperatorDto;
  systemSettings: SystemSettingsDto;
  incomingCall: CallRecordDto;
  callRecords: CallRecordDto[];
  faqItems: FaqItemDto[];
  transferDestinations: TransferDestinationDto[];
  systemPrompts: SystemPromptDto[];
  dashboardStats: DashboardStatDto[];
}

export type CallEventDto = {
  at: string;
  type: string;
  actor: string;
  detail: string;
}

export type CallRecordDto = {
  id: string;
  callerNumber: string;
  receivedAt: string;
  endedAt: string;
  status: string;
  responseMode: string;
  operatorName: string;
  customerId: string;
  customerName: string;
  customerType: string;
  customerSummary: string;
  aiHandled: boolean;
  transferRequired: boolean;
  aiSummary: string;
  recordingLocation: string;
  transcript: CallTranscriptLineDto[];
  events: CallEventDto[];
  transferHistory: TransferHistoryItemDto[];
}

export type CallTranscriptLineDto = {
  speaker: string;
  text: string;
  at: string;
}

export type ChangePasswordRequestDto = {
  newPassword: string;
}

export type CreatedUserResultDto = {
  user: UserDto;
  initialPassword: string;
  mustChangePassword: boolean;
}

export type CreateTestIncomingCallRequestDto = {
  callerNumber: string;
  customerName: string;
  customerType: string;
  customerSummary: string;
  requestedTopic: string;
}

export type CreateUserRequestDto = {
  email: string;
  displayName: string;
  storeCode: string;
  storeName: string;
}

export type CurrentOperatorDto = {
  id: string;
  name: string;
  role: string;
  team: string;
}

export type DashboardStatDto = {
  label: string;
  value: string;
}

export type EntraLoginRequestDto = {
  idToken: string;
}

export type FaqItemDto = {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
  scoreHint: string;
}

export type LoginRequestDto = {
  email: string;
  password: string;
}

export type PasswordResetResultDto = {
  initialPassword: string;
  mustChangePassword: boolean;
}

export type ResetPasswordByCredentialsRequestDto = {
  email: string;
  currentPassword: string;
}

export type SystemPromptDto = {
  id: string;
  name: string;
  type: string;
  version: string;
  content: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type SystemSettingsDto = {
  businessHours: string;
  afterHoursMessage: string;
  rejectMessage: string;
  aiEnabled: boolean;
  testLoginEnabled: boolean;
  faqScoreThreshold: string;
  operatorAssignmentRule: string;
}

export type TestLoginRequestDto = {
  userId: string;
}

export type TestLoginUserDto = {
  userId: string;
  roles: string[];
}

export type TransferDestinationDto = {
  id: string;
  name: string;
  type: string;
  department: string;
  target: string;
  businessHours: string;
  hint: string;
  fallbackName: string;
  enabled: boolean;
}

export type TransferHistoryItemDto = {
  destinationId: string;
  destinationName: string;
  reason: string;
  result: string;
}

export type UpdateFaqRequestDto = {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  enabled: boolean;
  scoreHint: string;
}

export type UpdateSystemSettingsRequestDto = {
  businessHours: string;
  afterHoursMessage: string;
  rejectMessage: string;
  aiEnabled: boolean;
  testLoginEnabled: boolean;
  faqScoreThreshold: string;
  operatorAssignmentRule: string;
}

export type UpdateTransferDestinationRequestDto = {
  name: string;
  type: string;
  department: string;
  target: string;
  businessHours: string;
  hint: string;
  fallbackName: string;
  enabled: boolean;
}

export type UpdateUserRequestDto = {
  email: string;
  displayName: string;
  storeCode: string;
  storeName: string;
}

export type UserDto = {
  userId: string;
  email: string;
  displayName: string;
  storeCode: string;
  storeName: string;
  roles: string[];
  isActive: boolean;
  mustChangePassword: boolean;
}

export type UserListResponseDto = {
  users: UserDto[];
  allowUserCreation: boolean;
}
