// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DeedNFT.sol";
import "./TokenizationManager.sol";

/**
 * @title RentalManager
 * @dev Manages property rentals and lease agreements
 */
contract RentalManager is AccessControl, ReentrancyGuard {
    bytes32 public constant RENTAL_MANAGER_ROLE = keccak256("RENTAL_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    IERC20 public stableToken; // USDC or other stablecoin for rental payments
    
    enum RentalStatus { ACTIVE, PENDING, COMPLETED, CANCELLED, DISPUTED }
    
    struct RentalAgreement {
        uint256 agreementId;
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        RentalStatus status;
        uint256 totalPaid;
        uint256 lastPaymentDate;
        bool securityDepositReturned;
    }
    
    struct RentalPayment {
        uint256 agreementId;
        uint256 amount;
        uint256 paymentDate;
        uint256 periodStart;
        uint256 periodEnd;
    }
    
    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(uint256 => RentalPayment[]) public rentalPayments;
    mapping(uint256 => uint256[]) public propertyRentals;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public landlordRentals;
    
    uint256 public agreementCounter;
    uint256 public constant MIN_RENTAL_PERIOD = 30 days;
    
    event RentalAgreementCreated(
        uint256 indexed agreementId,
        uint256 indexed propertyId,
        address indexed landlord,
        address tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate
    );
    
    event RentalPaymentMade(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount,
        uint256 periodStart,
        uint256 periodEnd,
        uint256 timestamp
    );
    
    event RentalCompleted(
        uint256 indexed agreementId,
        uint256 indexed propertyId,
        address landlord,
        address tenant,
        uint256 timestamp
    );
    
    event SecurityDepositReturned(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _deedNFT, address _stableToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RENTAL_MANAGER_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        stableToken = IERC20(_stableToken);
    }

    function createRentalAgreement(
        uint256 propertyId,
        address tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate
    ) public returns (uint256) {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        require(tenant != address(0), "Invalid tenant address");
        require(monthlyRent > 0, "Rent must be greater than 0");
        require(endDate > startDate + MIN_RENTAL_PERIOD, "Rental period too short");
        require(startDate >= block.timestamp, "Start date must be in future");
        
        // Collect security deposit
        require(
            stableToken.transferFrom(tenant, address(this), securityDeposit),
            "Security deposit transfer failed"
        );
        
        agreementCounter++;
        
        rentalAgreements[agreementCounter] = RentalAgreement({
            agreementId: agreementCounter,
            propertyId: propertyId,
            landlord: msg.sender,
            tenant: tenant,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            startDate: startDate,
            endDate: endDate,
            status: RentalStatus.PENDING,
            totalPaid: 0,
            lastPaymentDate: 0,
            securityDepositReturned: false
        });
        
        propertyRentals[propertyId].push(agreementCounter);
        tenantRentals[tenant].push(agreementCounter);
        landlordRentals[msg.sender].push(agreementCounter);
        
        emit RentalAgreementCreated(
            agreementCounter,
            propertyId,
            msg.sender,
            tenant,
            monthlyRent,
            securityDeposit,
            startDate,
            endDate
        );
        
        return agreementCounter;
    }

    function activateRentalAgreement(uint256 agreementId) public {
        RentalAgreement storage agreement = rentalAgreements[agreementId];
        require(agreement.landlord == msg.sender, "Not landlord");
        require(agreement.status == RentalStatus.PENDING, "Agreement not pending");
        require(block.timestamp >= agreement.startDate, "Rental period not started");
        
        agreement.status = RentalStatus.ACTIVE;
    }

    function makeRentalPayment(uint256 agreementId) public nonReentrant {
        RentalAgreement storage agreement = rentalAgreements[agreementId];
        require(agreement.tenant == msg.sender, "Not tenant");
        require(agreement.status == RentalStatus.ACTIVE, "Agreement not active");
        require(block.timestamp >= agreement.startDate, "Rental period not started");
        require(block.timestamp <= agreement.endDate, "Rental period ended");
        
        // Calculate payment period
        uint256 paymentDate = block.timestamp;
        uint256 periodStart = agreement.lastPaymentDate > 0 ? agreement.lastPaymentDate : agreement.startDate;
        uint256 periodEnd = periodStart + 30 days;
        
        require(paymentDate >= periodStart, "Payment too early");
        
        // Process payment
        require(
            stableToken.transferFrom(msg.sender, agreement.landlord, agreement.monthlyRent),
            "Rent payment failed"
        );
        
        agreement.totalPaid += agreement.monthlyRent;
        agreement.lastPaymentDate = paymentDate;
        
        // Record payment
        rentalPayments[agreementId].push(RentalPayment({
            agreementId: agreementId,
            amount: agreement.monthlyRent,
            paymentDate: paymentDate,
            periodStart: periodStart,
            periodEnd: periodEnd
        }));
        
        emit RentalPaymentMade(
            agreementId,
            msg.sender,
            agreement.monthlyRent,
            periodStart,
            periodEnd,
            block.timestamp
        );
    }

    function completeRentalAgreement(uint256 agreementId) public nonReentrant {
        RentalAgreement storage agreement = rentalAgreements[agreementId];
        require(
            agreement.landlord == msg.sender || agreement.tenant == msg.sender,
            "Not party to agreement"
        );
        require(agreement.status == RentalStatus.ACTIVE, "Agreement not active");
        require(block.timestamp > agreement.endDate, "Rental period not ended");
        
        agreement.status = RentalStatus.COMPLETED;
        
        // Return security deposit (assuming no damages)
        if (!agreement.securityDepositReturned) {
            _returnSecurityDeposit(agreementId);
        }
        
        emit RentalCompleted(
            agreementId,
            agreement.propertyId,
            agreement.landlord,
            agreement.tenant,
            block.timestamp
        );
    }

    function _returnSecurityDeposit(uint256 agreementId) internal {
        RentalAgreement storage agreement = rentalAgreements[agreementId];
        
        require(
            stableToken.transfer(agreement.tenant, agreement.securityDeposit),
            "Security deposit return failed"
        );
        
        agreement.securityDepositReturned = true;
        
        emit SecurityDepositReturned(
            agreementId,
            agreement.tenant,
            agreement.securityDeposit,
            block.timestamp
        );
    }

    function getRentalPayments(uint256 agreementId) public view returns (RentalPayment[] memory) {
        return rentalPayments[agreementId];
    }

    function getTenantRentals(address tenant) public view returns (uint256[] memory) {
        return tenantRentals[tenant];
    }

    function getLandlordRentals(address landlord) public view returns (uint256[] memory) {
        return landlordRentals[landlord];
    }

    function getPropertyRentals(uint256 propertyId) public view returns (uint256[] memory) {
        return propertyRentals[propertyId];
    }

    function calculateOutstandingRent(uint256 agreementId) public view returns (uint256) {
        RentalAgreement memory agreement = rentalAgreements[agreementId];
        
        if (agreement.status != RentalStatus.ACTIVE || block.timestamp < agreement.startDate) {
            return 0;
        }
        
        uint256 monthsOwed = 0;
        uint256 currentTime = block.timestamp > agreement.endDate ? agreement.endDate : block.timestamp;
        
        if (agreement.lastPaymentDate == 0) {
            // No payments made yet
            monthsOwed = (currentTime - agreement.startDate) / 30 days;
        } else {
            monthsOwed = (currentTime - agreement.lastPaymentDate) / 30 days;
        }
        
        return monthsOwed * agreement.monthlyRent;
    }
}