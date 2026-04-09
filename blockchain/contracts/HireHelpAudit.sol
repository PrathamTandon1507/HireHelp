// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HireHelpAudit {
    // Structure to represent an audit record
    struct AuditRecord {
        string decisionHash;
        uint256 timestamp;
        address auditor;
    }

    // Mapping of application_id -> AuditRecord
    mapping(string => AuditRecord) public auditRecords;

    // Event emitted when a decision is audited
    event DecisionAudited(string applicationId, string decisionHash, uint256 timestamp, address auditor);

    /**
     * @dev Audits a hiring decision on the blockchain.
     * @param _applicationId Unique identifier for the application.
     * @param _decisionHash SHA-256 hash of the decision details.
     */
    function auditDecision(string memory _applicationId, string memory _decisionHash) public {
        require(bytes(_applicationId).length > 0, "Application ID cannot be empty");
        require(bytes(_decisionHash).length > 0, "Decision Hash cannot be empty");
        // Ensure no overwrite for the same application ID just to be strict
        require(bytes(auditRecords[_applicationId].decisionHash).length == 0, "Application decision already audited");

        auditRecords[_applicationId] = AuditRecord({
            decisionHash: _decisionHash,
            timestamp: block.timestamp,
            auditor: msg.sender
        });

        emit DecisionAudited(_applicationId, _decisionHash, block.timestamp, msg.sender);
    }
}
