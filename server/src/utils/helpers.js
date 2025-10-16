const { PROPERTY_STATUS, TRANSFER_STATUS, USER_ROLES } = require('./constants');

class Helpers {
  static formatPropertyResponse(property) {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      coordinates: property.coordinates,
      size: property.size,
      ipfsHash: property.ipfsHash,
      tokenId: property.tokenId,
      status: property.status,
      owner: property.owner,
      verifications: property.verifications,
      transfers: property.transfers,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };
  }

  static formatUserResponse(user) {
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: user._count
    };
  }

  static formatTransferResponse(transfer) {
    return {
      id: transfer.id,
      property: transfer.property,
      fromUser: transfer.fromUser,
      toUser: transfer.toUser,
      status: transfer.status,
      txHash: transfer.txHash,
      createdAt: transfer.createdAt,
      completedAt: transfer.completedAt
    };
  }

  static generateVerificationMessage(nonce) {
    return `Welcome to DeedChain! Please sign this message to verify your ownership of the wallet. Nonce: ${nonce}`;
  }

  static generateTransferMessage(propertyId, toAddress) {
    return `I confirm the transfer of property ${propertyId} to ${toAddress}. Timestamp: ${Date.now()}`;
  }

  static calculatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    };
  }

  static sanitizeUserInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }

  static isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static isValidIPFSHash(hash) {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^bafy[a-zA-Z0-9]{56}$/.test(hash);
  }

  static generateRandomNonce() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Helpers;