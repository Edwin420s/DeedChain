const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  VERIFIER: 'VERIFIER',
  ADMIN: 'ADMIN'
};

const PROPERTY_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  TRANSFERRING: 'TRANSFERRING'
};

const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

const VERIFICATION_SETTINGS = {
  MIN_VERIFIERS: 1,
  VOTING_PERIOD_DAYS: 3,
  APPROVAL_THRESHOLD: 0.5 // 50% approval rate
};

const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

const BLOCKCHAIN = {
  CONFIRMATIONS_REQUIRED: 2,
  GAS_LIMIT: 500000,
  MAX_RETRIES: 3
};

module.exports = {
  USER_ROLES,
  PROPERTY_STATUS,
  TRANSFER_STATUS,
  VERIFICATION_SETTINGS,
  FILE_UPLOAD,
  BLOCKCHAIN
};