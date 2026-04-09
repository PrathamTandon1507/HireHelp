import hashlib
import json
from datetime import datetime
from typing import Optional
from web3 import Web3
from core.config import settings
import os

class BlockchainAuditService:
    def __init__(self):
        self.network = settings.blockchain_network
        
        # Load ABI for the standard contract we designed
        self.contract_abi = [
            {
                "inputs": [
                    {"internalType": "string", "name": "_applicationId", "type": "string"},
                    {"internalType": "string", "name": "_decisionHash", "type": "string"}
                ],
                "name": "auditDecision",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        if self.network == "sepolia":
            # Real web3 integration using RPC provided in .env
            rpc_url = settings.blockchain_rpc_url
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            self.contract_address = settings.smart_contract_address
            if self.w3.is_connected() and self.contract_address != "0x0000000000000000000000000000000000000000" and self.contract_address:
                self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.contract_abi)
            else:
                self.contract = None
        else:
            # Fallback to local / mock
            self.w3 = None
            self.contract = None
    
    def generate_decision_hash(
        self,
        application_id: str,
        final_decision: str,
        match_score: float,
        metadata: dict
    ) -> str:
        """Generate SHA-256 hash of decision record."""
        decision_record = {
            "application_id": application_id,
            "final_decision": final_decision,
            "match_score": match_score,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        record_str = json.dumps(decision_record, sort_keys=True)
        decision_hash = hashlib.sha256(record_str.encode()).hexdigest()
        return decision_hash
    
    def store_hash_on_blockchain(
        self,
        decision_hash: str,
        application_id: str
    ) -> Optional[str]:
        """
        Store decision hash on smart contract mapping if configured,
        Otherwise returns a simulated transaction hash.
        """
        if self.w3 and self.w3.is_connected() and self.contract:
            try:
                account = self.w3.eth.account.from_key(settings.blockchain_private_key)
                
                # Build contract transaction
                tx = self.contract.functions.auditDecision(application_id, decision_hash).build_transaction({
                    'from': account.address,
                    'nonce': self.w3.eth.get_transaction_count(account.address),
                    'gas': 2000000,
                    'gasPrice': self.w3.to_wei('50', 'gwei')
                })
                
                signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=settings.blockchain_private_key)
                tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                return tx_hash.hex()
            except Exception as e:
                print(f"Error storing on blockchain: {e}")
                return None
        
        # Local / Simulation fallback logic
        return f"0x{hashlib.sha256(f'{decision_hash}{application_id}'.encode()).hexdigest()}"
    
    def verify_hash(self, stored_hash: str, decision_record: dict) -> bool:
        """Verify that a decision hash matches its record."""
        record_str = json.dumps(decision_record, sort_keys=True)
        computed_hash = hashlib.sha256(record_str.encode()).hexdigest()
        return stored_hash == computed_hash

# Initialize blockchain service
blockchain_service = BlockchainAuditService()